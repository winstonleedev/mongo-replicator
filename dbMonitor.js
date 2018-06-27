'use strict';

const _ = require('lodash');
const async = require('async');

const mongoClient = require('./db/mongo');
const devicesController = require('./devicesController');
const postgresController = require('./postgresController');

const MONGO_DB_NAME = 'testtp';
const SERIES_PREFIX = 'tss.';
const LABEL_COLLECTION = 'labels';
const THINGS_COLLECTION = 'things';

// Turn on/off series log
const LOG_SERIES = false;
const LOG_LABEL = true;

const pipeline = [
  {
    $match:
      { 'ns.db': MONGO_DB_NAME },
  }
];

function getTableType(sampleValue) {
  let numericalValue = +sampleValue;
  let tableType = isNaN(numericalValue) ? 'string' : 'number';
  return tableType;
}

function processDataInsertion(action, doc, collectionName) {
  /*
  doc {
      "_id" : 1520558377232.0,
      "ctime" : 1520558377232.0,
      "value" : "0"
  }
  */

  let sensorId = collectionName.substring(SERIES_PREFIX.length);
  if (action === 'insert') {
    let time = +Math.round(doc.ctime / 1000);
    let value = doc.value;
    let tableType = getTableType(doc.value);

    postgresController.insertSeries(tableType, sensorId, time, value, (err, res) => {
      if (LOG_SERIES) {
        /*jshint camelcase: false */
        console.log('[insert result]', err ? err.message : res.rows[0].insert_value_number);
      }
    });
  } else {
    console.log('[other action]', action, doc, collectionName);
  }
  return;
}

/**
 * Flatten a combination of gateways, devices and sensors into a sensor list
 * @param {*} devices
 * @param {*} gateways
 * @param {*} sensors
 * @param {*} cb
 */
function flattenIntoSensorList(devices, gateways, sensors, cb) {
  async.parallel([
    (done) => {
      async.map(
        devices,
        devicesController.listSensorsOnDevice,
        (err, results) => {
          done(err, _.flatten(results));
        });
    },
    (done) => {
      async.map(
        gateways,
        devicesController.listSensorsOnGateway,
        (err, results) => {
          done(err, _.flatten(results));
        });
    },
    (done) => {
      done(null, sensors);
    }
  ], (err, results) => {
    if (!err) {
      let flattened = _.flatten(results);
      cb(err, flattened);
    } else {
      cb(err, null);
    }
  });
}

function processInsertLabel(labelId, fullDocument) {
  console.log('[label insert] Request', labelId);
  let devices = fullDocument.item.target.devices;
  let gateways = fullDocument.item.target.gateways;
  let sensors = fullDocument.item.target.sensors;

  flattenIntoSensorList(devices, gateways, sensors, (err, flattenedSensors) => {
    postgresController.deleteLabel(labelId, (err) => {
        !err && postgresController.insertLabel(labelId, flattenedSensors, (err) => {
          if (!err && LOG_LABEL) {
            console.log('[label insert] Success!', labelId, flattenedSensors);
          }
        });// jshint ignore:line
    });
  });
}

function processUpdateLabel(labelId, updateDescription) {
  console.log('[label update] Request', labelId);
  let devices = updateDescription.updatedFields['item.target'].devices;
  let gateways = updateDescription.updatedFields['item.target'].gateways;
  let sensors = updateDescription.updatedFields['item.target'].sensors;

  flattenIntoSensorList(devices, gateways, sensors, (err, flattenedSensors) => {
    postgresController.deleteLabel(labelId, (err) => {
        !err && postgresController.insertLabel(labelId, flattenedSensors, (err) => {
          if (!err && LOG_LABEL) {
            console.log('[label update] Success!', labelId, flattenedSensors);
          }
        });// jshint ignore:line
    });
  });
}

function processDeleteLabel(labelId) {
  console.log('[label delete] Request', labelId);
    postgresController.deleteLabel(labelId, (err) => {
      if (!err && LOG_LABEL) {
        console.log('[label delete] Success!', labelId);
      }
    });
}

function processLabelChange(operationType, fullDocument, documentKey, updateDescription) {
  let labelId = documentKey._id;

  if (operationType === 'insert') {
    processInsertLabel(labelId, fullDocument);
  } else if (operationType === 'delete') {
    processDeleteLabel(labelId);
  } else if (operationType === 'update') {
    processUpdateLabel(labelId, updateDescription);
  } else {
    console.log('[label unknown]', labelId, operationType, documentKey, updateDescription);
  }
  return;
}

function processThingChange(operationType, fullDocument) {
  console.log('[rebuildThing]', operationType, fullDocument);
  return;
}

mongoClient(
  (client) => {
    let db = client.db(MONGO_DB_NAME);
    const changeStream = db.watch();
    // start listen to changes
    changeStream.on('change', (change) => {
      if (_.startsWith(change.ns.coll, SERIES_PREFIX)) {
        processDataInsertion(change.operationType, change.fullDocument, change.ns.coll);
      } else if (change.ns.coll === LABEL_COLLECTION) {
        processLabelChange(change.operationType, change.fullDocument, change.documentKey, change.updateDescription);
      } else if (change.ns.coll === THINGS_COLLECTION) {
        processThingChange(change.operationType, change.fullDocument);
      }
    }, pipeline);
  },
  (error) => {
    console.error(error);
  }
);

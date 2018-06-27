'use strict';

const _ = require('lodash');
const async = require('async');

const mongoClient = require('./db/mongo');
const postgresClient = require('./db/postgres');
const devicesController = require('./devicesController');

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
    // console.log('[inserting] (', sensorId, time, value, tableType, ')');

    postgresClient.query(
      'SELECT * FROM "insert_value_' + tableType + '"($1, to_timestamp($2)::timestamp, $3)',
      [sensorId, time, value],
      (err, res) => {
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

function deleteLabel(labelId, cb) {
  postgresClient.query(
    'DELETE FROM label_sensor WHERE mongo_id_label = $1',
    [labelId],
    cb);
}

function insertLabel(labelId, sensors, cb) {
  async.each(
    sensors,
    (sensor, done) => {
      console.log('INSERT INTO label_sensor(id_sensor, mongo_id_label) VALUES ((SELECT id_sensor FROM sensors WHERE (mongo_id_sensor = \'' + sensor + '\'::text)), ' + labelId + ')');
      postgresClient.query(
        'INSERT INTO label_sensor(id_sensor, mongo_id_label) VALUES ((SELECT id_sensor FROM sensors WHERE (mongo_id_sensor = \'$1\'::text)), $2)',
        [sensor, labelId],
        done);
    },
    cb);
}

function processLabelChange(operationType, fullDocument, documentKey) {
  let labelId = documentKey._id;

  if (operationType === 'insert') {
    console.log('[label insert] Request', labelId);
    let devices = fullDocument.item.target.devices;
    let gateways = fullDocument.item.target.gateways;
    let sensors = fullDocument.item.target.sensors;

    flattenIntoSensorList(devices, gateways, sensors, (err, flattenedSensors) => {
      deleteLabel(labelId, (err) => {
        if (!err) {
          insertLabel(labelId, flattenedSensors, (err) => {
            if (!err && LOG_LABEL) {
              console.log('[label insert] Success!', labelId, devices, gateways, flattenedSensors);
            } else {
              console.log('[label insert] Fail!', err);
            }
          });
        } else {
          console.log('[label insert] Fail!', err);
        }
      });
    });
  } else if (operationType === 'delete') {
    console.log('[label delete] Request', labelId);
    deleteLabel(labelId, (err) => {
      if (!err && LOG_LABEL) {
        console.log('[label delete] Success!', labelId);
      }
    });
  } else {
    console.log('[label unknown]', labelId, operationType, documentKey);
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
        processLabelChange(change.operationType, change.fullDocument, change.documentKey);
      } else if (change.ns.coll === THINGS_COLLECTION) {
        processThingChange(change.operationType, change.fullDocument);
      }
    }, pipeline);
  },
  (error) => {
    console.error(error);
  }
);

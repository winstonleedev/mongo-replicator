'use strict';

const rdbController = require('./rdbController');
const devicesController = require('./devicesController');

const LOG = true;
const LABEL_COLLECTION = 'labels';

function processInsertLabel(labelId, fullDocument) {
  console.log('[label insert] Request', labelId);
  let devices = fullDocument.item.target.devices;
  let gateways = fullDocument.item.target.gateways;
  let sensors = fullDocument.item.target.sensors;

  devicesController.flattenIntoSensorList(devices, gateways, sensors, (err, flattenedSensors) => {
    rdbController.deleteLabel(labelId, (err) => {
        !err && rdbController.insertLabel(labelId, flattenedSensors, (err) => {
          if (!err && LOG) {
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

  devicesController.flattenIntoSensorList(devices, gateways, sensors, (err, flattenedSensors) => {
    rdbController.deleteLabel(labelId, (err) => {
        !err && rdbController.insertLabel(labelId, flattenedSensors, (err) => {
          if (!err && LOG) {
            console.log('[label update] Success!', labelId, flattenedSensors);
          }
        });// jshint ignore:line
    });
  });
}

function processDeleteLabel(labelId) {
  console.log('[label delete] Request', labelId);
    rdbController.deleteLabel(labelId, (err) => {
      if (!err && LOG) {
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

function initLabels(db) {
  let collection = db.collection(LABEL_COLLECTION);
  let cursor = collection.find({}, {});
  rdbController.getStoredLabels((err, labels) => {
    if (err) {
      labels = [];
    }
    cursor.each((err, document) => {
      if (document && !labels.includes(document._id)) {
        processInsertLabel(document._id, document);
      }
    });
  });
}

module.exports.processLabelChange = processLabelChange;
module.exports.initLabels = initLabels;

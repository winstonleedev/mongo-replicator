'use strict';

const rdbController = require('./rdbController');
const moment = require('moment');

// Turn on/off series log
const LOG_SERIES = false;
const SERIES_PREFIX = 'tss.';

function getTableType(sampleValue) {
  return isNaN(sampleValue) ? 'string' : 'number';
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
  if (action !== 'insert') {
    console.log('[unknown series action]', action, doc, collectionName);
    return;
  }

  let time = moment(doc.ctime).format('YYYY-MM-DD HH:mm:ss');
  let value = doc.value;
  let tableType = getTableType(doc.value);

  rdbController.insertSeries(tableType, sensorId, time, value, (err, res) => {
    if (LOG_SERIES) {
      /*jshint camelcase: false */
      console.log('[insert result]', err ? err.message : res);
    }
  });
  return;
}

module.exports.processDataInsertion = processDataInsertion;
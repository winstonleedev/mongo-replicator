'use strict';

const postgresController = require('./postgresController');

// Turn on/off series log
const LOG_SERIES = false;
const SERIES_PREFIX = 'tss.';

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

module.exports.processDataInsertion = processDataInsertion;
'use strict';

const _ = require('lodash');

const mongoClient = require('./db/mongo');
const postgresClient = require('./db/postgres');


const MONGO_DB_NAME = 'testtp';
const SERIES_PREFIX = 'tss.';

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

function replicateAction(action, doc, collectionName) {
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
    console.log('[inserting] (', sensorId, time, value, tableType, ')');

    postgresClient.query(
      'SELECT * FROM "insert_value_' + tableType + '"($1, to_timestamp($2)::timestamp, $3)',
      [sensorId, time, value],
      (err, res) => {
        /*jshint camelcase: false */
        console.log('[insert result]', err ? err.message : res.rows[0].insert_value_number);
      });
  } else {
    console.log('[other action]', action, doc, collectionName);
  }
  return;
}

mongoClient(
  (client) => {
    let db = client.db(MONGO_DB_NAME);
    const changeStream = db.watch();
    // start listen to changes
    changeStream.on('change', (change) => {
      if (_.startsWith(change.ns.coll, SERIES_PREFIX)) {
        replicateAction(change.operationType, change.fullDocument, change.ns.coll);
      }
    }, pipeline);
  },
  (error) => {
    console.error(error);
  }
);

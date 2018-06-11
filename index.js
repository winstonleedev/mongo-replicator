'use strict';

const _ = require('lodash');

const mongoClient = require('./db/mongo');
const postgresClient = require('./db/postgres');

const MONGO_DB_NAME = 'testtp';
const POSTGRES_TABLE_NAME = 'series';
const SERIES_PREFIX = 'tss.';

const pipeline = [
  { $match:
      { 'ns.db': MONGO_DB_NAME },
  }
];

function replicateAction(action, doc, collectionName) {
  let sensorId = collectionName.substring(SERIES_PREFIX.length);
  if (action === 'insert') {
    postgresClient.query('INSERT INTO ' + POSTGRES_TABLE_NAME + '(sensor, time, value) VALUES ($1, to_timestamp($2), $3) RETURNING id',
    [sensorId, +doc.ctime / 1000, doc.value], (err, res) => {
      console.log('[insert result]', err ? err.stack : res.rows[0].id, typeof +doc.value, +doc.value);
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
    changeStream.on('change', function (change) {
      if (_.startsWith(change.ns.coll, SERIES_PREFIX)) {
        replicateAction(change.operationType, change.fullDocument, change.ns.coll);
      }
    }, pipeline);
  },
  (error) => {
    console.error(error);
  }
);

/*
{
    "_id" : 1520558377232.0,
    "ctime" : 1520558377232.0,
    "value" : "0"
}
*/
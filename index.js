'use strict';

const _ = require('lodash');

const mongoClient = require('./db/mongo');
const postgresClient = require('./db/postgres');
const nrpClient = require('./db/node-redis-pubsub');

const MONGO_DB_NAME = 'testtp';
const SERIES_PREFIX = 'tss.';

const pipeline = [
  { $match:
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
  {
      "_id" : 1520558377232.0,
      "ctime" : 1520558377232.0,
      "value" : "0"
  }
  */

  let sensorId = collectionName.substring(SERIES_PREFIX.length);
  if (action === 'insert') {
    let tableType = getTableType(doc.value);
    postgresClient.query(
      'SELECT * FROM insertNumericValue($1, $2, $3, $4)',
      [sensorId, +doc.ctime / 1000, doc.value, tableType],
      (err, res) => {
        console.log('[insert result]', err ? err.stack : res.rows[0].id);
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

nrpClient.on('main:all', (data) => {
  console.log('[redis-pubsub] data.eventId, data.id, data.operation', data.eventId, data.id, data.operation);
  console.log('[redis-pubsub] data - ', data);
});

/*
[redis-pubsub] data.eventId, data.id, data.operation sensor smokeAlarm-gw_248300000853-COALARM D
[redis-pubsub] data -
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "D", updatedItem: null, prevItem: Object, …}
[redis-pubsub] data.eventId, data.id, data.operation gateway gw_248300000853 D
[redis-pubsub] data -
Object {eventId: "gateway", id: "gw_248300000853", operation: "D", updatedItem: null, prevItem: Object, …}

[redis-pubsub] data.eventId, data.id, data.operation gateway gw_248300000853 U
[redis-pubsub] data -
Object {eventId: "gateway", id: "gw_248300000853", operation: "U", updatedItem: Object, prevItem: Object, …}
[redis-pubsub] data.eventId, data.id, data.operation sensor smokeAlarm-gw_248300000853-COALARM C
[redis-pubsub] data -
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "C", updatedItem: Object, prevItem: null, …}
[redis-pubsub] data.eventId, data.id, data.operation sensor smokeAlarm-gw_248300000853-COALARM U
[redis-pubsub] data -
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "U", updatedItem: Object, prevItem: Object, …}
[redis-pubsub] data.eventId, data.id, data.operation gateway gw_248300000853 U
[redis-pubsub] data -
Object {eventId: "gateway", id: "gw_248300000853", operation: "U", updatedItem: Object, prevItem: Object, …}
*/


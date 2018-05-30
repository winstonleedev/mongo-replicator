'use strict';

// TODO change to mongoose 5
const MongoClient = require('mongodb').MongoClient;
const { Client } = require('pg');
const _ = require('lodash');
/*
Modify Change Stream Output using Aggregation Pipelines
You can control change stream output by providing an array of one or more of the following pipeline stages when configuring the change stream:
$match, $project, $addFields, $replaceRoot, $redact
See Change Events for more information on the change stream response document format.
*/
const pipeline = [
  {
    $project: { documentKey: false }
  }
];

const MONGO_DB_NAME = 'testtp';
const SENSOR_ID = 'batteryGauge-gw_248800003093-BATTERY';
const MONGO_COLLECTION_NAME = 'tss.' + SENSOR_ID;
const POSTGRES_DB_NAME = 'testtp';
const POSTGRES_TABLE_NAME = 'series';

const postgresClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: POSTGRES_DB_NAME,
  password: '',
  port: 5432
});

postgresClient.connect();

MongoClient
  .connect('mongodb://localhost:27017,localhost:27018,localhost:27019?replicaSet=rs', { useNewUrlParser: true })
  .then(client => {
    console.log('Connected correctly to server');

    // specify db and collections
    const db = client.db(MONGO_DB_NAME);
    const collection = db.collection(MONGO_COLLECTION_NAME);
    let count = 0;

    // db.collectionNames((error, collections) => {
    //   _.each(collections, (value, index) => {
    //     console.log(index, '-', value);
    //   });
    // });

    const changeStream = collection.watch();
    // start listen to changes
    changeStream.on('change', function (change) {
      console.log(change);

      if (change.fullDocument) {
        postgresClient.query('INSERT INTO ' + POSTGRES_TABLE_NAME + '(sensor, time, value) VALUES ($1, to_timestamp($2), $3) RETURNING id',
        [SENSOR_ID, +change.fullDocument.ctime, change.fullDocument.value], (err, res) => {
          console.log(err ? err.stack : res.rows[0]);
        });
      }

      if (count > 1000) {
        client.close();
        postgresClient.end();
      }
    });
  })
  .catch(err => {
    console.error(err);
  });
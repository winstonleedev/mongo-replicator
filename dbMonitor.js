'use strict';

const _ = require('lodash');

const mongoClient = require('./db/mongo');
const labelController = require('./controllers/labelController');
const seriesController = require('./controllers/seriesController');

const MONGO_DB_NAME = 'testtp';
const SERIES_PREFIX = 'tss.';
const LABEL_COLLECTION = 'labels';
const THINGS_COLLECTION = 'things';

const pipeline = [
  {
    $match:
      { 'ns.db': MONGO_DB_NAME },
  }
];

mongoClient(
  (client) => {
    let db = client.db(MONGO_DB_NAME);
    const changeStream = db.watch();
    // start listen to changes
    changeStream.on('change', (change) => {
      if (_.startsWith(change.ns.coll, SERIES_PREFIX)) {
        seriesController.processDataInsertion(change.operationType, change.fullDocument, change.ns.coll);
      } else if (change.ns.coll === LABEL_COLLECTION) {
        labelController.processLabelChange(change.operationType, change.fullDocument, change.documentKey, change.updateDescription);
      } else if (change.ns.coll === THINGS_COLLECTION) {
        labelController.processThingChange(change.operationType, change.fullDocument);
      }
    }, pipeline);
  },
  (error) => {
    console.error(error);
  }
);

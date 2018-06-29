'use strict';

const _ = require('lodash');

const mongoClient = require('./db/mongo');

const MONGO_DB_NAME = 'testtp';
const LABEL_COLLECTION = 'labels';
const THINGS_COLLECTION = 'things';

function initLabels(db) {
  let collection = db.collection(LABEL_COLLECTION);
  let cursor = collection.find({}, {});
  cursor.each((err, item) => {
    if (item) {
      console.log(item);
    }
  });
}

mongoClient(
  (client) => {
    let db = client.db(MONGO_DB_NAME);
    initLabels(db);
  },
  (error) => {
    console.error(error);
  }
);

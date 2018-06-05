'use strict';

const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://localhost:27017,localhost:27018,localhost:27019?replicaSet=rs';

module.exports = function(successCallback, errorCallback) {
  MongoClient
  .connect(MONGO_URL, { useNewUrlParser: true })
  .then(successCallback)
  .catch(errorCallback);
};
'use strict';

const { Client } = require('mariasql');
const DB_NAME = 'testtp';
const mariaClient = new Client({
  user: 'root',
  host: 'localhost',
  password: 'topsecret',
  db: DB_NAME
});

mariaClient.connect();

function shutdown() {
  mariaClient.end();
}

module.exports.client = mariaClient;
module.exports.shutdown = shutdown;
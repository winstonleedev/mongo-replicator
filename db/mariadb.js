'use strict';

const mysql = require('mysql');
const DB_NAME = 'testtp';
const client = mysql.createConnection({
  user: 'thingplus',
  host: 'localhost',
  password: 'thingplus',
  db: DB_NAME
});

client.connect();

function shutdown() {
  client.end();
}

module.exports.client = client;
module.exports.shutdown = shutdown;
'use strict';

const mysql = require('mysql');
const DB_NAME = 'testtp';
const connection = mysql.createConnection({
  user: 'thingplus',
  host: 'localhost',
  password: 'thingplus',
  database: DB_NAME
});

connection.connect();

function shutdown() {
  connection.end();
}

module.exports.client = connection;
module.exports.shutdown = shutdown;

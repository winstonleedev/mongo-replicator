'use strict';

const mysql = require('mysql');
const DB_NAME = 'testtp';
const connection = mysql.createConnection({
  user: 'thingplus',
  host: 'localhost',
  password: 'thingplus',
  db: DB_NAME
});

connection.connect();

function shutdown() {
  connection.end();
}

module.exports.client = connection;
module.exports.shutdown = shutdown;
module.exports.DB_NAME = DB_NAME;
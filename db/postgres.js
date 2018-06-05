'use strict';

const { Client } = require('pg');
const POSTGRES_DB_NAME = 'testtp';
const postgresClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: POSTGRES_DB_NAME,
  password: '',
  port: 5432
});

postgresClient.connect();

module.exports = postgresClient;

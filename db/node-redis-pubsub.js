'use strict';

const NRP = require('node-redis-pubsub');

const config = {
  port: 6379,
  host: 'testtp',
  scope: 'delegate'
};
const client = new NRP(config);

module.exports = client;
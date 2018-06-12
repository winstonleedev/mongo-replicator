'use strict';

const redis = require('redis');

const redisPort = 6379;
const redisHost = 'testtp';
const redisDBId = 7;

const client = redis.createClient(redisPort, redisHost);
client.select(redisDBId);

module.exports = client;
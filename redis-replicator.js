'use strict';

const nrpClient = require('./db/node-redis-pubsub');
const redisClient = require('./db/redis');
const postgresClient = require('./db/postgres');

nrpClient.on('main:all', (data) => {
  // console.log('[redis-pubsub] data.eventId, data.id, data.operation', data.eventId, data.id, data.operation);
  console.log('[redis-pubsub] data - ', data);
  if (data.operation === 'D' && data.eventId === 'gateway') {
    gatewayDeleted(data.id);
  } else if (data.operation === 'D' && data.eventId === 'sensor') {
    sensorDeleted(data.id);
  }
});

listSensors('1000000000000002');

/*
[redis-pubsub] data.eventId, data.id, data.operation sensor smokeAlarm-gw_248300000853-COALARM D
[redis-pubsub] data -
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "D", updatedItem: null, prevItem: Object, …}
[redis-pubsub] data.eventId, data.id, data.operation gateway gw_248300000853 D
[redis-pubsub] data -
Object {eventId: "gateway", id: "gw_248300000853", operation: "D", updatedItem: null, prevItem: Object, …}

[redis-pubsub] data.eventId, data.id, data.operation gateway gw_248300000853 U
[redis-pubsub] data -
Object {eventId: "gateway", id: "gw_248300000853", operation: "U", updatedItem: Object, prevItem: Object, …}
[redis-pubsub] data.eventId, data.id, data.operation sensor smokeAlarm-gw_248300000853-COALARM C
[redis-pubsub] data -
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "C", updatedItem: Object, prevItem: null, …}
[redis-pubsub] data.eventId, data.id, data.operation sensor smokeAlarm-gw_248300000853-COALARM U
[redis-pubsub] data -
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "U", updatedItem: Object, prevItem: Object, …}
[redis-pubsub] data.eventId, data.id, data.operation gateway gw_248300000853 U
[redis-pubsub] data -
Object {eventId: "gateway", id: "gw_248300000853", operation: "U", updatedItem: Object, prevItem: Object, …}
*/

async function listSensors(gatewayId) { // jshint ignore:line
  redisClient.hgetall('gateway:' + gatewayId, (err, reply) => {
    console.log(err,reply);
    console.log(err,JSON.parse(reply.sensors));
  });
  /*
  Doesn't work

  redisClient.smembers('gateway:' + gatewayId + ':sensors', (err, reply) => {
    console.log(err,reply);
  });
  */
  return [];
}

function sensorDeleted(sensorId) {
  removeSensorFromLabels(sensorId);
  removeSensorFromThings(sensorId);
}

function gatewayDeleted(gatewayId) {
  listSensors(gatewayId).forEach((sensorId) => {
    sensorDeleted(sensorId);
  });
}

function removeSensorFromLabels(sensorId) {
  return;
}

function removeSensorFromThings(sensorId) {
  return;
}


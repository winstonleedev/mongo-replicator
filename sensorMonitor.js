'use strict';

const nrpClient = require('./db/node-redis-pubsub');
const postgresClient = require('./db/postgres');
const devicesController = require('./devicesController');

nrpClient.on('main:all', (data) => {
  // console.log('[redis-pubsub] data.eventId, data.id, data.operation', data.eventId, data.id, data.operation);
  console.log('[redis-pubsub] data - ', data);
  if (data.operation === 'D' && data.eventId === 'gateway') {
    gatewayDeleted(data.id);
  } else if (data.operation === 'D' && data.eventId === 'sensor') {
    sensorDeleted(data.id);
  }
});

devicesController.listSensorsOnGateway('1000000000000002', (err, sensors) => {
  if (!err && sensors) {
    console.log(sensors);
  }
});

devicesController.listSensorsOnDevice('5233d96c9ad24f3ba5a318a62593e997', (err, sensors) => {
  if (!err && sensors) {
    console.log(sensors);
  }
});

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

function sensorDeleted(sensorId) {
  removeSensorFromLabels(sensorId);
  removeSensorFromThings(sensorId);
}

function gatewayDeleted(gatewayId) {
  devicesController.listSensorsOnGateway(gatewayId).forEach((sensorId) => {
    sensorDeleted(sensorId);
  });
}

function removeSensorFromLabels(sensorId) {
  postgresClient.query(
    'SELECT * FROM "insert_value_' + tableType + '"($1, to_timestamp($2)::timestamp, $3)',
    [sensorId, time, value],
    (err, res) => {
      /*jshint camelcase: false */
      console.log('[insert result]', err ? err.message : res.rows[0].insert_value_number);
    });
  return;
}

function removeSensorFromThings(sensorId) {
  return;
}


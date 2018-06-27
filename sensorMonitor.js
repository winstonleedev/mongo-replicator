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

function sensorDeleted(sensorId) {
  removeSensorFromLabels(sensorId);
  removeSensorFromThings(sensorId);
}

function gatewayDeleted(gatewayId) {
  devicesController.listSensorsOnGateway(gatewayId, (err, sensors) => {
    sensors.forEach((sensorId) => {
      sensorDeleted(sensorId);
    });
  });
}

function removeSensorFromLabels(sensorId) {
  postgresClient.query(
    'DELETE FROM label_sensor WHERE id_sensor = (SELECT id_sensor FROM sensors WHERE mongo_id_sensor = \'$1\')',
    [sensorId],
    (err, res) => {
      /*jshint camelcase: false */
      console.log('[removeSensorFromLabels result]', res);
    });
}

function removeSensorFromThings(sensorId) {
  postgresClient.query(
    'DELETE FROM thing_sensor WHERE id_sensor = (SELECT id_sensor FROM sensors WHERE mongo_id_sensor = \'$1\')',
    [sensorId],
    (err, res) => {
      /*jshint camelcase: false */
      console.log('[removeSensorFromThings result]', res);
    });
}


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
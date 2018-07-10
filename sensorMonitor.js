'use strict';

const nrpClient = require('./db/node-redis-pubsub');
const devicesController = require('./controllers/devicesController');

devicesController.syncSensors();

nrpClient.on('main:all', (data) => {
  console.log('[redis-pubsub] data - ', data);
  if (data.operation === 'D' && data.eventId === 'gateway') {
    devicesController.gatewayDeleted(data.id);
  } else if (data.operation === 'D' && data.eventId === 'sensor') {
    devicesController.sensorDeleted(data.id);
  }
});


/*
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "D", updatedItem: null, prevItem: Object, …}
Object {eventId: "gateway", id: "gw_248300000853", operation: "D", updatedItem: null, prevItem: Object, …}
Object {eventId: "gateway", id: "gw_248300000853", operation: "U", updatedItem: Object, prevItem: Object, …}
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "C", updatedItem: Object, prevItem: null, …}
Object {eventId: "sensor", id: "smokeAlarm-gw_248300000853-COALARM", operation: "U", updatedItem: Object, prevItem: Object, …}
Object {eventId: "gateway", id: "gw_248300000853", operation: "U", updatedItem: Object, prevItem: Object, …}
*/
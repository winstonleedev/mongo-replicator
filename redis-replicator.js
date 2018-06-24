'use strict';

const nrpClient = require('./db/node-redis-pubsub');

nrpClient.on('main:all', (data) => {
  console.log('[redis-pubsub] data.eventId, data.id, data.operation', data.eventId, data.id, data.operation);
  console.log('[redis-pubsub] data - ', data);
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


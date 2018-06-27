'use strict';

const redisClient = require('./db/redis');
const async = require('async');

function listSensorsOnGateway(gatewayId, cb) {
  redisClient.hgetall('gateway:' + gatewayId, (err, reply) => {
    if (!err && reply.sensors) {
      cb(null, JSON.parse(reply.sensors));
    } else {
      cb(err, null);
    }
  });
}

function listSensorsOnDevice(deviceId, cb) {
  async.waterfall([
    // Get device's gateway
    (next) => {
      redisClient.hgetall('device:' + deviceId, (err, reply) => {
        if (!err && reply.owner) {
          next(null, reply.owner);
        } else {
          next(err, reply);
        }
      });
    },
    // Get gateway's sensors
    listSensorsOnGateway,
    // Filter sensors to keep only those match the device
    (sensors, next) => {
      async.filter(
        sensors,
        (sensor, filterNext) => redisClient.hgetall('sensor:' + sensor, (err, sensorData) => {
          // Keep only sensors that match device ID
          filterNext(err, sensorData.deviceId === deviceId);
        }),
        next);
    }
  ], cb);
}

module.exports.listSensorsOnGateway = listSensorsOnGateway;
module.exports.listSensorsOnDevice = listSensorsOnDevice;
'use strict';

const async = require('async');

const postgresClient = require('../db/postgres');

function insertSeries(tableType, sensorId, time, value, cb) {
  postgresClient.query(
    'SELECT * FROM "insert_value_' + tableType + '"($1, to_timestamp($2)::timestamp, $3)',
    [sensorId, time, value],
    cb);
}

function deleteLabel(labelId, cb) {
  postgresClient.query(
    'DELETE FROM label_sensor WHERE mongo_id_label = $1',
    [labelId],
    cb);
}

function insertLabel(labelId, sensors, cb) {
  async.each(
    sensors,
    (sensor, done) => {
      postgresClient.query(
        'INSERT INTO label_sensor(id_sensor, mongo_id_label) VALUES ((SELECT id_sensor FROM sensors WHERE (sensors.mongo_id_sensor = $1::text)), $2)',
        [sensor, labelId],
        // Ignore errors due to sensors without series data, as we can't do statistics against them anyway
        (err, result) => done(null, result));
    },
    cb);
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

module.exports.insertSeries = insertSeries;
module.exports.deleteLabel = deleteLabel;
module.exports.insertLabel = insertLabel;
module.exports.removeSensorFromLabels = removeSensorFromLabels;
module.exports.removeSensorFromThings = removeSensorFromThings;

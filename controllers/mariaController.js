'use strict';

const async = require('async');
const _ = require('lodash');

const client = require('../db/mariadb').client;

function insertSeries(tableType, sensorId, time, value, cb) {
  client.query(
    'SELECT insert_value_' + tableType + '(?, ?, ?)',
    [sensorId, time, value],
    cb
  );
}

function deleteLabel(labelId, cb) {
  client.query(
    'DELETE FROM label_sensor WHERE mongo_id_label = ?',
    [labelId],
    cb);
}

function insertLabel(labelId, sensors, cb) {
  async.each(
    sensors,
    (sensor, done) => {
      client.query(
        'INSERT INTO label_sensor(id_sensor, mongo_id_label) VALUES ((SELECT exist_sensor(?, NULL)), ?)',
        [sensor, labelId],
        done);
    },
    cb);
}

function deleteThing(labelId, cb) {
  client.query(
    'DELETE FROM thing_sensor WHERE mongo_id_thing = ?',
    [labelId],
    cb);
}

function insertThing(thingId, sensors, cb) {
  async.each(
    sensors,
    (sensor, done) => {
      client.query(
        'INSERT INTO thing_sensor(id_sensor, mongo_id_thing) VALUES ((SELECT exist_sensor(?, NULL)), ?)',
        [sensor, thingId],
        done);
    },
    cb);
}

function removeSensorFromLabels(sensorId, cb) {
  client.query(
    'DELETE FROM label_sensor WHERE id_sensor = (SELECT id_sensor FROM sensors WHERE mongo_id_sensor = ?)',
    [sensorId],
    cb);
}

function removeSensorFromThings(sensorId, cb) {
  client.query(
    'DELETE FROM thing_sensor WHERE id_sensor = (SELECT id_sensor FROM sensors WHERE mongo_id_sensor = ?)',
    [sensorId],
    cb);
}

function getStoredThings(cb) {
  client.query(
    'SELECT DISTINCT mongo_id_thing FROM thing_sensor',
    [],
    (err, res) => {
      if (!err) {
        /*jshint camelcase: false */
        let arrayOfThingIds = _.map(res, (row) => parseInt(row.mongo_id_thing));
        cb(err, arrayOfThingIds);
      } else {
        cb(err);
      }
    });
}

function getStoredLabels(cb) {
  client.query(
    'SELECT DISTINCT mongo_id_label FROM label_sensor',
    [],
    (err, res) => {
      if (!err) {
        /*jshint camelcase: false */
        let arrayOfLabelIds = _.map(res, (row) => parseInt(row.mongo_id_label));
        cb(err, arrayOfLabelIds);
      } else {
        cb(err);
      }
    });
}

module.exports.insertSeries = insertSeries;
module.exports.deleteLabel = deleteLabel;
module.exports.insertLabel = insertLabel;
module.exports.deleteThing = deleteThing;
module.exports.insertThing = insertThing;
module.exports.removeSensorFromLabels = removeSensorFromLabels;
module.exports.removeSensorFromThings = removeSensorFromThings;
module.exports.getStoredLabels = getStoredLabels;
module.exports.getStoredThings = getStoredThings;

'use strict';

const async = require('async');
const _ = require('lodash');

const rdbController = require('./rdbController');

const LOG = true;
const THING_COLLECTION = 'things';

function getSensorsFromMap(mapObj) {
  /**
   * Sample mapObj
    {
        "humidity" : {
            "owner" : "cf16cef90aa944c9ad6e0021ca88df7f",
            "id" : "humidityDaliworks-cf16cef90aa944c9ad6e0021ca88df7f",
            "field" : "series",
            "type" : "sensor"
        },
        "temperature" : {
            "field" : "series",
            "owner" : "cf16cef90aa944c9ad6e0021ca88df7f",
            "id" : "temperatureDaliworks-cf16cef90aa944c9ad6e0021ca88df7f",
            "type" : "sensor"
        }
    }
   */
  let mySensors = [];
  for (let key in mapObj) {
    if (mapObj[key].id) {
      mySensors.push(mapObj[key].id);
    }
  }
  return mySensors;
}

function flattenThing(collection, thingId, cb) {
  async.waterfall([
    // Find target thing in DB
    function findThingId(next) {
      collection.findOne({ '_id': thingId }, next);
    },
    // Combine children and sensor from child things
    function combineSensorsWithChildrenSensors(thing, next) {
      let sensors = [];
      if (thing.item.map) {
        sensors = getSensorsFromMap(thing.item.map);
      }

      let children = [];
      if (thing.item.children) {
        children = thing.item.children;
      }

      async.map(
        children,
        (thingItem, next) => flattenThing(collection, thingItem, next),
        (err, sensorArrayOfChild) => next(err, sensors.concat(_.flatten(sensorArrayOfChild)))
      );
    },
    // For the current thing, update (this will be done recursively)
    function updateThing(sensors, next) {
      rdbController.deleteThing(thingId, (err) => {
        if (err) {
          return next(err);
        }
        rdbController.insertThing(thingId, sensors, (err) => {
          console.log('[thing insert] Done for one thing', err, thingId, sensors);
          next(err, sensors);
        });// jshint ignore:line
      });
    },
  ], cb);
}

function processInsertThing(collection, thingId) {
  console.log('[thing insert] Request', thingId);
  flattenThing(collection, thingId, (err) => {
    console.log('[thing insert] All done!', err, thingId);
  });
}

function processUpdateThing(collection, thingId) {
  console.log('[thing update] Request', thingId);
  processInsertThing(collection, thingId);
}

function processDeleteThing(thingId) {
  console.log('[thing delete] Request', thingId);
  rdbController.deleteThing(thingId, (err) => {
    if (!err && LOG) {
      console.log('[thing delete] Success!', thingId);
    }
  });
}

function processThingChange(db, operationType, documentKey) {
  let collection = db.collection(THING_COLLECTION);
  let thingId = documentKey._id;

  if (operationType === 'insert') {
    processInsertThing(collection, thingId);
  } else if (operationType === 'delete') {
    processDeleteThing(thingId);
  } else if (operationType === 'update') {
    processUpdateThing(collection, thingId);
  } else {
    console.log('[thing unknown]', thingId, operationType, documentKey);
  }
  return;
}

function syncThings(db) {
  let collection = db.collection(THING_COLLECTION);
  let cursor = collection.find({}, {});
  rdbController.getStoredThings((err, things) => {
    if (err) {
      things = [];
    }
    cursor.each((err, document) => {
      if (document && !things.includes(document._id)) {
        processInsertThing(collection, document._id);
      }
    });
  });
}

module.exports.processThingChange = processThingChange;
module.exports.syncThings = syncThings;
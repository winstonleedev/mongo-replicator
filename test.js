'use strict';

const devicesController = require('./devicesController');

// Test code: List sensors
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

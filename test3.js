'use strict';

const rdbController = require('./controllers/rdbController');

rdbController.getStoredThings((err, things) => {
  console.log(things);
  // process.exit(0);
});

rdbController.getStoredLabels((err, labels) => {
  console.log(labels);
  // process.exit(0);
});
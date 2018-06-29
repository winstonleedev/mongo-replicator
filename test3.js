'use strict';

const postgresController = require('./controllers/postgresController');

postgresController.getStoredThings((err, things) => {
  console.log(things);
  // process.exit(0);
});

postgresController.getStoredLabels((err, labels) => {
  console.log(labels);
  // process.exit(0);
});
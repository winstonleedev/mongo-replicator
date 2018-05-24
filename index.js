"use strict";

const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
/*
Modify Change Stream Output using Aggregation Pipelines
You can control change stream output by providing an array of one or more of the following pipeline stages when configuring the change stream:
$match, $project, $addFields, $replaceRoot, $redact
See Change Events for more information on the change stream response document format.
*/
const pipeline = [
  {
    $project: { documentKey: false }
  }
];

function logError(err) {
  console.error(err);
}

const DB_NAME = "superheroesdb";
const COLLECTION_NAME = "superheroes";

MongoClient
  .connect("mongodb://localhost:27017,localhost:27018,localhost:27019/" + DB_NAME +
   "?replicaSet=rs", { useNewUrlParser: true })
  .then(client => {
    console.log("Connected correctly to server");
    // specify db and collections
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const changeStream = collection.watch();
    // start listen to changes
    changeStream.on("change", function (change) {
      console.log(change);
    });

    process.nextTick(function () {
      // insert few data with timeout so that we can watch it happening
      setTimeout(function () {
        collection.insert({ "batman": "bruce wayne" }, logError);
      }, 1000);
      setTimeout(function () {
        collection.insert({ "superman": "clark kent" }, logError);
      }, 2000);
      setTimeout(function () {
        collection.insert({ "wonder-woman": "diana prince" }, logError);
      }, 3000);
      setTimeout(function () {
        collection.insert({ "ironman": "tony stark" }, logError);
      }, 4000);
      setTimeout(function () {
        collection.insert({ "spiderman": "peter parker" }, logError);
      }, 5000);
      // update existing document
      setTimeout(function () {
        collection.updateOne({ "ironman": "tony stark" }, { $set: { "ironman": "elon musk" } }, logError);
      }, 6000);
      // delete existing document
      setTimeout(function () {
        collection.deleteOne({ "spiderman": "peter parker" }, logError);
        client.close();
        process.exit(0);
      }, 7000);
    });
  })
  .catch(err => {
    console.error(err);
  });
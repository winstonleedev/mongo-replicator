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

MongoClient.connect("mongodb://localhost:27017")
  .then(client => {
    console.log("Connected correctly to server");
    // specify db and collections
    const db = client.db("superheroesdb");
    const collection = db.collection("superheroes");
    
    const changeStream = collection.watch(pipeline);
    // start listen to changes
    changeStream.on("change", function (change) {
      console.log(change);
    });

    // insert few data with timeout so that we can watch it happening
    setTimeout(function () {
      collection.insert({ "batman": "bruce wayne" }, function (err) {
        assert.ifError(err);
      });
    }, 1000);
    setTimeout(function () {
      collection.insert({ "superman": "clark kent" }, function (err) {
        assert.ifError(err);
      });
    }, 2000);
    setTimeout(function () {
      collection.insert({ "wonder-woman": "diana prince" }, function (err) {
        assert.ifError(err);
      });
    }, 3000);
    setTimeout(function () {
      collection.insert({ "ironman": "tony stark" }, function (err) {
        assert.ifError(err);
      });
    }, 4000);
    setTimeout(function () {
      collection.insert({ "spiderman": "peter parker" }, function (err) {
        assert.ifError(err);
      });
    }, 5000);
  });



/**
 * module testBasic.spec
 *
 */
'use strict';
var expect = require("expect");

describe("internal test",function() {

  it("runs the test files programmatically",function(done) {

    var sm = require("../")
      , path = require("path")
      , fs = require("fs")
      ;

    var testDir = __dirname + path.sep + 'programmatic';

    var files = [];

    fs.readdirSync(testDir).forEach(function (filename) {

      var filePath = testDir + path.sep + filename;
      var file = fs.statSync(filePath);

      if (!file.isDirectory() && filename.indexOf('.js') > -1) files.push(filePath);
    });

    var reportDir = __dirname + path.sep + 'reports';

    sm.runTasks(files, true, true, reportDir)

      //sm.runTasks(files, 'lib/serialReporter.js', true)

      .then(function(results){

        expect(results.aggregated.tests.count).toBe(6);

        expect(results.aggregated.tests.statuses.passed).toBe(2);
        expect(results.aggregated.tests.statuses.failed).toBe(2);
        expect(results.aggregated.tests.statuses.skipped).toBe(2);

        expect(Object.keys(results.detail).length).toBe(2);

        done();
      })

      .catch(done);

  })
});
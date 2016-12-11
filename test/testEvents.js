/**
 * module testBasic.spec
 *
 */
'use strict';
var expect = require("expect");

describe("internal test",function() {

  it("runs the tests and checks the events",function(done) {

    var SerialMocha = require("../lib/serialMocha")
      , path = require("path")
      , fs = require("fs")
      ;

    var testDir = __dirname + path.sep + 'events';

    var reportDir = __dirname + path.sep + 'events-reports';

    var sm = new SerialMocha();

    var currentSuite;

    sm.on('run-started', function(data){

      expect(data.tasks.length).toBe(3);
      expect(data.timestamp <= Date.now()).toBe(true)

    });

    sm.on('suite-started', function(data){

      expect(data.name != null).toBe(true);
      expect(data.args.length).toBe(3)

    });

    sm.on('suite-ended', function(data){

      if (data.report.task.indexOf('01-test.js') > -1){

        expect(data.metrics.length).toBe(3);
        expect(data.metrics[0].name).toBe('01-test.js/programmatic test/a passing test');
        expect(data.metrics[1].name).toBe('01-test.js/programmatic test/a failing test');
        expect(data.metrics[2].name).toBe('01-test.js/programmatic test/a skipped test');

      }

      if (data.report.task.indexOf('02-test.js') > -1){

        expect(data.metrics.length).toBe(5);

        expect(data.metrics[4].name).toBe('02-test.js/programmatic test1/a test context/a deeper test context/a passing test in a deeper context');
        expect(data.metrics[4].status).toBe('passed');
        expect(data.metrics[4].duration >= 1000).toBe(true);
      }

      if (data.report.task.indexOf('03-test.js') > -1){

        expect(data.metrics.length).toBe(3);
        expect(data.metrics[2].status).toBe('skipped');

      }
    });

    sm.on('run-ended', function(data){
      expect(data.metrics.length).toBe(11);
    });

    sm.runTasks(testDir, true, true, reportDir)

      //sm.runTasks(files, 'lib/serialReporter.js', true)

      .then(function(results){

        expect(results.aggregated.tests.count).toBe(11);

        expect(results.aggregated.tests.statuses.passed).toBe(5);
        expect(results.aggregated.tests.statuses.failed).toBe(3);
        expect(results.aggregated.tests.statuses.skipped).toBe(3);

        expect(Object.keys(results.detail).length).toBe(3);

        done();
      })

      .catch(done);

  })
});
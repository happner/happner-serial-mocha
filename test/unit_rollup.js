var expect = require("expect");

describe("unit rollup",function() {

  it("rolls a deep report into metrics", function (done) {

    var reportData = {

      "task": "/Users/simonbishop/Documents/Projects/serial-mocha/test/events/02-test.js",
      "success": true,
      "results": {
        "file": "/Users/simonbishop/Documents/Projects/serial-mocha/test/events/02-test.js",
        "suites": [
          {
            "suite": "programmatic test1",
            "suites": [
              {
                "suite": "a test context",
                "suites": [
                  {
                    "suite": "a deeper test context",
                    "suites": [],
                    "tests": [
                      {
                        "test": {
                          "title": "a passing test in a deeper context",
                          "async": 1,
                          "sync": false,
                          "timedOut": false,
                          "pending": false,
                          "type": "test",
                          "file": "/Users/simonbishop/Documents/Projects/serial-mocha/test/events/02-test.js",
                          "duration": 0,
                          "status": "passed"
                        },
                        "error": null
                      }
                    ]
                  }
                ],
                "tests": [
                  {
                    "test": {
                      "title": "a failing test in context",
                      "async": 1,
                      "sync": false,
                      "timedOut": false,
                      "pending": false,
                      "type": "test",
                      "file": "/Users/simonbishop/Documents/Projects/serial-mocha/test/events/02-test.js",
                      "duration": 0,
                      "status": "failed"
                    },
                    "error": "test error"
                  },
                  {
                    "test": {
                      "title": "a skipped test in context",
                      "sync": true,
                      "timedOut": false,
                      "pending": true,
                      "type": "test",
                      "file": "/Users/simonbishop/Documents/Projects/serial-mocha/test/events/02-test.js"
                    },
                    "error": null
                  },
                  {
                    "test": {
                      "title": "a passing test in context",
                      "async": 1,
                      "sync": false,
                      "timedOut": false,
                      "pending": false,
                      "type": "test",
                      "file": "/Users/simonbishop/Documents/Projects/serial-mocha/test/events/02-test.js",
                      "duration": 0,
                      "status": "passed"
                    },
                    "error": null
                  }
                ]
              }
            ],
            "tests": [
              {
                "test": {
                  "title": "a passing test1",
                  "async": 1,
                  "sync": false,
                  "timedOut": false,
                  "pending": false,
                  "type": "test",
                  "file": "/Users/simonbishop/Documents/Projects/serial-mocha/test/events/02-test.js",
                  "duration": 1,
                  "status": "passed"
                },
                "error": null
              }
            ]
          }
        ]
      },
      "duration": 152
    };


    // var rollup = function(data) {
    //
    //   // var traverse = require('traverse');
    //   //
    //   // traverse(data).paths().forEach(function (x) {
    //   //  console.log('prop:::', x);
    //   // });
    //   var basePath =
    //
    //
    // };


    //var rolledUp = rollup(reportData);

    var SerialMocha = require('../lib/serialMocha');
    var serialMocha = new SerialMocha();

    serialMocha.runMetrics = [];

    var rolledUp = serialMocha.__rollup(reportData);

    done();

  });

});


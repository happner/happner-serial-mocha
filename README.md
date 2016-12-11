#Serial Mocha
A simple module which allows you to run mocha tests serially.

Mocha normally runs spec files in parallel. If you have a use case where you would like to ensure that the files are run one at a time, in sequence, you can use serial-mocha.

Normal usage is from the command line but it can also be used programatically which allows you to capture information about the tests if you want to further process that information. This is useful if you want to create a dashboard for checking health status.

The module exposes one method, runTasks, which returns a promise. That promise is resolved when __all tests__ are complete. It does not reject if a test fails. You can determine the status of an individual test by examining
the data in the resolved promise. 

Because of a deficiency in mocha, __mocha.run cannot be called multiple times. It does not clean up after itself and residual information from previous calls corrupts subsequent runs. In order to overcome this we fork a new process for each test. The implications of that are that it requires about 30 msec to spin up the process and uses about 10mb of memory. Therefor this module is not designed to run 1000's of tests sequentially.

##Installation

```
npm install happner-serial-mocha --save-dev (or -g if you are going to run from command line)

npm test

```

##Usage##
1. from the command line (requires a global install):

```
serial-mocha [-r <path to custom reporter>] [-d <path to report file output directory>] [--sm --] <path to test files may be a glob>
```
1. r - we will forward that to mocha following the usual mocha rules.
1. d - report file ourput directory
1. sm   if present we use the default serial-mocha reporter. If absent we use the mocha default.

NOTE: The -- after --sm is not a typo. If you don't add it your first test file will be assigned to sm which I am sure you don't want.

If you just want the default mocha reporter but want you tests run serially just use this:
```
serial-mocha <path to test files>

//NB you can use wildcards: serial-mocha test/*.js -r lib/serialReporter -d test/reports
```

##Programatically##

```

var sm=require("happner-serial-mocha');
var taskFiles=["./test/foo.spec.js","./test/bar.spec.js"];
sm.runTasks(taskFiles,null,true, "/my/test/reports")
	.then((results)=>{
   		//Do what you want with data
	})
	.catch((err)=>console.log(err));

// or you can also pass a directory where the files are:

sm.runTasks('/my/test/directory',null,true, "/my/test/reports")
	.then((results)=>{
   		//Do what you want with data
	})
	.catch((err)=>console.log(err));
```
The parameters for runTasks:

1. taskFiles/Dir - array of file names of task files, or directory path
1. reporter -- path to a custom reporter use null to use mocha default
1. saveData - if true information on tests will be returned in resolved promise. (See information below).
1. test report directory

If saveData is true and no custom reporter is provided the serial-mocha default reporter will be used.
If saveData is true and a custom reporter is provided that reporter will be used
If saveData is false and no customer reporter is provided the default mocha reporter will be used but no useful information will be returned on promise resolution. I have trouble imagining why you would be doing things programatically and not want the data back though.

```bash

//test runs produce both a detailed report, which is pushed to a folder of your choice, and provides aggregated results:

> mocha test/testEvents.js


  internal test

TEST RUN COMPLETE
-----------------


files:  3
 L suites:  5
   L tests:  11
      L passed: 5
      L failed: 3
      L skipped: 3


----------
failures:
----------
failed suite: programmatic test
   L test: a failing test
      L reason: test error
failed suite: a test context
   L test: a failing test in context
      L reason: test error
failed suite: programmatic test1
   L test: a failing test1
      L reason: test error
    ✓ runs the tests and checks the events (1702ms)


```

events:
-------

*when run programmatically, we can listen in on test events:*

```javascript

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

```

metrics:
-------
*the test results, either reported on the suite-ended or run-ended events are made into metrics keyed by their location within the suite, nested contexts or suites are taken into account by adding /'s ie: grand_unified_theory/relativity/special or grand_unified_theory/quantum_mechanics/string:*

```javascript

[
  {
    "name": "01-test.js/programmatic test/a passing test",
    "status": "passed",
    "duration": 1
  },
  {
    "name": "01-test.js/programmatic test/a failing test",
    "status": "failed",
    "duration": 1
  },
  {
    "name": "01-test.js/programmatic test/a skipped test",
    "status": "skipped",
    "duration": 0
  },
  {
    "name": "02-test.js/programmatic test1/a passing test1",
    "status": "passed",
    "duration": 1
  },
  {
    "name": "02-test.js/programmatic test1/a test context/a failing test in context",
    "status": "failed",
    "duration": 0
  },
  {
    "name": "02-test.js/programmatic test1/a test context/a skipped test in context",
    "status": "skipped",
    "duration": 0
  },
  {
    "name": "02-test.js/programmatic test1/a test context/a passing test in context",
    "status": "passed",
    "duration": 0
  },
  {
    "name": "02-test.js/programmatic test1/a test context/a deeper test context/a passing test in a deeper context",
    "status": "passed",
    "duration": 1006
  },
  {
    "name": "03-test.js/programmatic test1/a passing test1",
    "status": "passed",
    "duration": 1
  },
  {
    "name": "03-test.js/programmatic test1/a failing test1",
    "status": "failed",
    "duration": 1
  },
  {
    "name": "03-test.js/programmatic test1/a skipped test1",
    "status": "skipped",
    "duration": 0
  }
]

```

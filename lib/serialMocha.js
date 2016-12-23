/**
 * module index
 *
 */
var Promise = require("bluebird")
  , EventEmitter = require('events').EventEmitter
  , fs = Promise.promisifyAll(require("fs"))
  , child_process = Promise.promisifyAll(require("child_process"))
  , util = require("util")
  , SPR = require("./serialPromiseRunner")
  , minimist = require("minimist")
  , path = require("path")
  , colors = require("colors/safe")
  , fs = require("fs-extra")
  , indent="\t"
  ;

function SerialMocha(){

  this.__events = new EventEmitter();

  this.currentAggregatedSuite = null;

  this.__handleTaskStarted = function(data){
    this.__emit('suite-started', data);
  };

  this.__handleTaskEnded = function(data){
    this.__emit('suite-ended', this.__rollup(data));
  };

  this.runMetrics = [];
}

//rolls up tests, so they can be logged to benchmarket
SerialMocha.prototype.__rollup = function(results){

  var _this = this;

  var rolledUp = {
    report:results,
    metrics:[]
  };

  if (!results.results.file) return rolledUp;

  var getResults = function(basePath, suite, data){

    if (!data) data = [];

    if (suite.tests){

      suite.tests.forEach(function(result){

        var metric = {
          name:basePath + '/' + result.test.title,
          status:result.test.status?result.test.status:'skipped',
          duration:result.test.duration==null?0:result.test.duration
        };

        data.push(metric);
        _this.runMetrics.push(metric);
      });
    }

    if (suite && suite.length > 0){

      suite.forEach(function(childSuite){
        getResults(basePath + '/' + childSuite.suite, childSuite, data);
      });
    }

    if (suite.suites && suite.suites.length > 0){

      suite.suites.forEach(function(childSuite){

        getResults(basePath + '/' + childSuite.suite, childSuite, data);
      });
    }
  };

  rolledUp.metrics = [];

  getResults(path.basename(results.results.file), results.results.suites, rolledUp.metrics);

  return rolledUp;
};

SerialMocha.prototype.on = function(evt, handler){
  return this.__events.on(evt, handler);
};

SerialMocha.prototype.offEvent = function(handle){
  return this.__events.offEvent(handle);
};

SerialMocha.prototype.__emit = function(evt, message){
  return this.__events.emit(evt, message);
};

SerialMocha.prototype.getTestFiles = function(testFolder){
  try{

    var returnFiles = [];

    fs.readdirSync(testFolder).forEach(function (filename) {

      var filePath = testFolder + path.sep + filename;
      var file = fs.statSync(filePath);

      if (!file.isDirectory() && filename.indexOf('.js') > -1) returnFiles.push(filePath);
    });

    return returnFiles;

  }catch(e){
    throw new Error('unable to fetch test files from folder: ' + testFolder, e);
  }
};

SerialMocha.prototype.aggregateResults = function(obj, level, aggregatedResults) {

  var theIndent="";
  var _this = this;

  if (!aggregatedResults.prepared){

    aggregatedResults.files = 0;
    aggregatedResults.suites = 0;

    aggregatedResults.failed = {};

    aggregatedResults.tests = {
      count:0,
      statuses:{}
    };

    aggregatedResults.prepared = true;
  }

  for(var i=0;i<level;i++) {
    theIndent += indent;
  }

  if (obj.file) aggregatedResults.files++;//console.log(theIndent+"File: "+ obj.file);

  if (obj.suite) aggregatedResults.suites++; //console.log(theIndent+"Suite: "+ obj.suite);

  if (obj.tests) {

    _this.currentAggregatedSuite = obj.suite;

    obj.tests.forEach(function(result){

      aggregatedResults.tests.count++;

      if (result.test.pending) result.test.status = 'skipped';

      if (aggregatedResults.tests.statuses[result.test.status] == null) aggregatedResults.tests.statuses[result.test.status] = 0;
      aggregatedResults.tests.statuses[result.test.status]++;

      if (result.test.status === 'failed') {

        if (!aggregatedResults.failed[ _this.currentAggregatedSuite]) aggregatedResults.failed[ _this.currentAggregatedSuite] = [];

        aggregatedResults.failed[ _this.currentAggregatedSuite].push({title:result.test.title, reason:result.error});
      }
    })
  }

  if (obj.suites) {

    obj.suites.forEach(function(suite) {
      //if(obj.suite){
      //	console.log(obj.suite +" Nested Suites:");
      //}
      _this.aggregateResults(suite, level+1, aggregatedResults);
    });
  }
};

SerialMocha.prototype.runTasks = function(theTasks, theReporterPath, theReporterDirectory) {

  var _this = this;

  var duration = Date.now();

  _this.runMetrics = [];

  if (typeof theTasks === 'string') theTasks = _this.getTestFiles(theTasks);//passed a folder in

  _this.__emit('run-started', {timestamp:duration, tasks:theTasks});

  return new Promise(function (resolve, reject) {

    if (!theReporterPath) theReporterPath = __dirname + path.sep + 'serialReporter';

    if (theReporterDirectory){
      theReporterDirectory = path.resolve(theReporterDirectory);
      fs.ensureDirSync(theReporterDirectory);
    }

    theTasks = theTasks || theArgs._;

    var tasks = [];

    theTasks.forEach(function (test) {
      tasks.push({
        name: test,
        args: [test, theReporterPath],
        funct: require("./runFork")
      });
    });

    var spr = new SPR(tasks);

    spr.on('task-started', _this.__handleTaskStarted.bind(_this));
    spr.on('task-ended', _this.__handleTaskEnded.bind(_this));

    spr.runTasks()

      .then(function (res) {

        var now = Date.now();

        duration = now - duration;

        var aggregatedResults = {};

        if (res) {

          for (var file in res) _this.aggregateResults(res[file].results, 0, aggregatedResults);

          aggregatedResults.duration = duration;

          _this.__emit('run-ended', {timestamp:now, duration:duration, results:aggregatedResults, metrics:_this.runMetrics});

          console.log(colors.green.bold('\r\nTEST RUN COMPLETE'));
          console.log(colors.green.bold('-----------------'));
          console.log('\r\n');

          if (!aggregatedResults.files) aggregatedResults.files = 0;
          if (!aggregatedResults.suites) aggregatedResults.suites = 0;

          console.log(colors.blue('files: '), colors.blue.bold(aggregatedResults.files));
          console.log(colors.blue(' L suites: '), colors.blue.bold(aggregatedResults.suites));

          if (aggregatedResults.tests) {
            console.log(colors.blue('   L tests: '), colors.blue.bold(aggregatedResults.tests.count));

            for (var status in aggregatedResults.tests.statuses){

              var __colors = colors.blue;

              if (status === 'failed') __colors = colors.red;
              if (status === 'passed') __colors = colors.green;
              if (status === 'skipped') __colors = colors.gray;

              console.log(__colors('      L ' + status + ': ' + aggregatedResults.tests.statuses[status]));
            }
          }

          if (aggregatedResults.failed){

            var failedSuites = Object.keys(aggregatedResults.failed);

            if (failedSuites.length > 0){

              console.error('\r\n');
              console.error(colors.red('----------'));
              console.error(colors.red('failures:'));
              console.error(colors.red('----------'));

              failedSuites.forEach(function(suite){
                console.warn(colors.red('failed suite: ' + suite));

                aggregatedResults.failed[suite].forEach(function(test){
                  console.warn(colors.red('   L test: ' + test.title));
                  console.warn(colors.red('      L reason: ' + test.reason));
                });
              });
            }
          }

          if (theReporterDirectory != null){

            var reportFile = theReporterDirectory + path.sep + Date.now() + '.json';

            try{
              fs.writeFileSync(reportFile, JSON.stringify(res, null, 2));
            }catch(e){
              console.log(colors.red('failed writing to report file:' + reportFile));
            }
          }
        }

        resolve({aggregated:aggregatedResults, detail:res});
      })

      .catch(reject)

      .finally(function () {
          spr = undefined;
        }
      )
  });
};

module.exports = SerialMocha;
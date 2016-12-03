/**
 * module index
 *
 */
var Promise = require("bluebird"),
	fs = Promise.promisifyAll(require("fs")),
	child_process = Promise.promisifyAll(require("child_process")),
	util = require("util"),
	argv = require("minimist")(process.argv),
	SPR = require("./lib/serialPromiseRunner"),
	minimist = require("minimist"),
	path = require("path"),
	colors = require("colors/safe"),
	fs = require("fs-extra");
indent="\t";

var currentSuite;
var currentTest;

var aggregateResults = function(obj, level, aggregatedResults) {

	var theIndent="";

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

		currentSuite = obj.suite;

		obj.tests.forEach(function(result){

			aggregatedResults.tests.count++;

			if (result.test.pending) result.test.status = 'skipped';

			if (aggregatedResults.tests.statuses[result.test.status] == null) aggregatedResults.tests.statuses[result.test.status] = 0;
			aggregatedResults.tests.statuses[result.test.status]++;

			if (result.test.status === 'failed') {

				if (!aggregatedResults.failed[currentSuite]) aggregatedResults.failed[currentSuite] = [];

				aggregatedResults.failed[currentSuite].push({title:result.test.title, reason:result.error});
			}


			//console.log(test.test.title);
			//console.log(test.test.status);
			//console.log(test.error);
			//console.log(theIndent+indent+"Test: "+test.test.title+ "  "+test.test.status + ((test.error)?" Reason: "+test.error:""));
		})
	}

	if (obj.suites) {

		obj.suites.forEach(function(suite) {
			//if(obj.suite){
			//	console.log(obj.suite +" Nested Suites:");
			//}
			aggregateResults(suite, level+1, aggregatedResults);
		});
	}
};

module.exports.runTasks = function(theTasks, theReporter, saveData, theReporterDirectory) {

	var duration = Date.now();

	return new Promise(function (resolve, reject) {

		var theArgs = minimist(process.argv.slice(2));

		if (!theArgs) theArgs = {};

		var defaultReporter = path.dirname(__filename) + path.sep  + 'lib' + path.sep + 'serialReporter';

		if (theReporter === true) theArgs.r = defaultReporter;

		if (theArgs.r == 'y')  theArgs.r = defaultReporter;

		if (theArgs.r) {

			try{ theReporter = path.resolve(theArgs.r); }
			catch(e){}
		}

		if (theArgs.d) theReporterDirectory = path.resolve(theArgs.d);

		if (theReporterDirectory) fs.ensureDirSync(theReporterDirectory);

		if (!theReporter) theReporter = null;

		theTasks = theTasks || theArgs._;

		if (theArgs.sm == 'y') saveData = true;
		else saveData = false;

		var tasks = [];

		theTasks.forEach(function (test) {
			tasks.push({
				name: test,
				args: [test, theReporter, saveData],
				funct: require("./lib/runFork")
			});
		});

		var spr = new SPR(tasks);

		spr.runTasks()

			.then(function (res) {

				duration = Date.now() - duration;

				var aggregatedResults = {};

				if (res) {

					for (var file in res) aggregateResults(res[file].results, 0, aggregatedResults);

					aggregatedResults.duration = duration;

					console.log(colors.green.bold('\r\nTEST RUN COMPLETE'));
					console.log(colors.green.bold('-----------------'));
					console.log('\r\n');
					console.log(colors.blue('files: '), colors.blue.bold(aggregatedResults.files));
					console.log(colors.blue(' L suites: '), colors.blue.bold(aggregatedResults.suites));
					console.log(colors.blue('   L tests: '), colors.blue.bold(aggregatedResults.tests.count));

					for (var status in aggregatedResults.tests.statuses){

						var __colors = colors.blue;

						if (status === 'failed') __colors = colors.red;
						if (status === 'passed') __colors = colors.green;
						if (status === 'skipped') __colors = colors.gray;

						console.log(__colors('      L ' + status + ': ' + aggregatedResults.tests.statuses[status]));
					}

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

if ((argv._.length > 1) && argv._[1].indexOf("index.js") !== -1) {

	module.exports.runTasks()
		.then(function(results){
			console.log(colors.green("\r\nrun ok, duration: " + results.aggregated.duration ));
		})
		.catch(function(err){console.log(err, err.stack)});
}

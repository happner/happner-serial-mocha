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
	fs = require("fs-extra")
	indent="\t";

var duration = 0;

var aggregateResults = function(obj, level, aggregatedResults) {

	var theIndent="";

	if (!aggregatedResults.prepared){

		aggregatedResults.files = 0;
		aggregatedResults.suites = 0;
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

		obj.tests.forEach(function(test){

			aggregatedResults.tests.count++;

			if (aggregatedResults.tests.statuses[test.test.status] == null) aggregatedResults.tests.statuses[test.test.status] = 0;
			aggregatedResults.tests.statuses[test.test.status]++;

			duration += test.test.duration;

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

	duration = 0;

	return new Promise(function (resolve, reject) {

		var theArgs = minimist(process.argv.slice(2));

		if (!theArgs) theArgs = {};

		if (theReporter === true) theArgs.r = './serialReporter';

		if (theArgs.r == 'y')  theArgs.r = './serialReporter';

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

			var aggregatedResults = {};

			if (res) {

				for (var file in res) aggregateResults(res[file].results, 0, aggregatedResults);

				console.log('files: ', aggregatedResults.files);
				console.log(' L suites: ', aggregatedResults.suites);
				console.log('   L tests: ', aggregatedResults.tests.count);

				for (var status in aggregatedResults.tests.statuses){
					console.log('      L ' + status + ': ', aggregatedResults.tests.statuses[status]);
				}

				if (theReporterDirectory != null){

					var reportFile = theReporterDirectory + path.sep + Date.now() + '.json';

					try{
						fs.writeFileSync(reportFile, JSON.stringify(res, null, 2));
					}catch(e){
						console.log('failed writing to report file:', reportFile);
					}
				}
			}

			resolve(res);
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
		console.log("duration: ", duration )})
		.catch(function(err){console.log(err, err.stack)});
}
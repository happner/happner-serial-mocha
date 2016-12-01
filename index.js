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
	indent="\t";

var walkObject = function(obj, level) {

	var theIndent="";

	for(var i=0;i<level;i++) {
		theIndent += indent;
	}

	if (obj.file) console.log(theIndent+"File: "+ obj.file);

	if (obj.suite) console.log(theIndent+"Suite: "+ obj.suite);

	if (obj.tests) {
		obj.tests.forEach(function(test){
			//console.log(test.test.title);
			//console.log(test.test.status);
			//console.log(test.error);
			console.log(theIndent+indent+"Test: "+test.test.title+ "  "+test.test.status + ((test.error)?" Reason: "+test.error:""));
		})
	}

	if (obj.suites) {
		obj.suites.forEach(function(suite) {
			//if(obj.suite){
			//	console.log(obj.suite +" Nested Suites:");
			//}
			walkObject(suite,level+1);
		});
	}
};

module.exports.runTasks = function(theTasks, theReporter, saveData, theReporterDirectory) {

	console.log('in runTasks:::', theTasks, theReporter, saveData, theReporterDirectory);

	return new Promise(function (resolve, reject) {

		var theArgs = minimist(process.argv.slice(2));


		if (theArgs.r) {
			try {
				theReporter = path.resolve(theArgs.r);
			} catch (ex) {
				//purposely silent
			}
		}

		if (theArgs.d) {
			try {
				theReporterDirectory = path.resolve(theArgs.d);
			} catch (ex) {
				//purposely silent
			}
		}

		if (!theReporter) theReporter = null;

		theTasks = theTasks || theArgs._;

		if (saveData === undefined) {

			if (theArgs.sm !== undefined) {
				if (typeof theArgs.sm === 'boolean') {
					saveData = theArgs.sm;
				} else if (typeof theArgs.sm === 'string') {
					saveData = (theArgs.sm.toLowerCase() === 'true') || (theArgs.sm.toLowerCase() === 't') || (theArgs.sm.toLowerCase() === 'yes') || (theArgs.sm.toLowerCase() === 'y')
				}
			}
			if (saveData === undefined) saveData = false;
		}
		var tasks = [];
		var results = {};

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

				for (var file in res) walkObject(res[file].results, 0);

				if (theReporterDirectory != null && res){

					var reportFile = theReporterDirectory + path.sep + Date.now() + '.json';

					try{
						var fs = require('fs');
						fs.writeFileSync(reportFile, JSON.stringify(res, null, 2));
					}catch(e){
						console.log('failed writing to report file:', reportFile);
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
		console.log("finished with",results )})
		.catch(function(err){console.log(err, err.stack)});
}
/**
 * module serialReporter
 *
 */
'use strict';
var fixTest = function(test){

	var include = ["title",
		"async",
		"sync",
		"timedOut",
		"pending",
		"type",
		"file",
		"duration"
	];

	try {
		var o = {};
		for (var prop in test) {

			if (include.indexOf(prop) !== -1) {
				o[prop] = test[prop];
			}
		}
		o.status = test.state;
		return o;
	} catch (ex) {
		console.log(ex, ex.stack);
	}
};

var findTheSuite = function(suiteName, theSuite) {

	try {
		var foundValue = null;
		if (suiteName === theSuite.suite) {
			foundValue = theSuite;
		}
		else {
			if (theSuite.suites) {
				theSuite.suites.forEach(function(value, key){
					//console.log(key,"in find the suite");
					if (!foundValue) {
						foundValue = findTheSuite(suiteName, value);
					}
				})
			}
		}
		return foundValue;
	} catch (ex) {
		console.log(ex, ex.stack);
	}
};

function Reporter(runner) {

	var currentSuite = null;
	var parentSuite = null;
	var out = {file: null, suites: []};

	runner.on("suite", function(suite){
		if (suite.root) {
			suite.suites.forEach(function(item){
				out.suites.push({suite: item.title, suites: [], tests: []});
				out.file = item.file;
			})
		}
		if (!suite.root) {
			parentSuite = currentSuite;
			if (parentSuite && !(parentSuite === 'rootSuite')) {
				var _temp = findTheSuite(suite.title, out);
				if (!_temp) {
					var _parent = findTheSuite(parentSuite, out);
					if (_parent) {
						_parent.suites.push({suite: suite.title, suites: [], tests: []})
					}
				}
			}
		}
		currentSuite = suite.title || "rootSuite";
	});

	runner.on("pending", function(test){
		var found = findTheSuite(currentSuite, out);
		//console.log("foundthesuite",found ===null,found instanceof Map);
		if (found && found.tests) {
			found.tests.push({test: fixTest(test), error: null});
		}
	});
	runner.on("pass", function(test){
		var found = findTheSuite(currentSuite, out);
		if (found && found.tests) {
			found.tests.push({test: fixTest(test), error: null});
		}
	});
	runner.on("fail", function(test, err){
		var found = findTheSuite(currentSuite, out);
		if (found && found.tests) {
			found.tests.push({test: fixTest(test), error: err.message});
		}
	});
	runner.on("end", function() {
		if (process.send) {
			process.send({type: "mochaDone", message: JSON.stringify(out)})
		}
	});
}
module.exports = Reporter;
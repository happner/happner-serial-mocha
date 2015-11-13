/**
 * module serialReporter
 *
 */
'use strict';
let fixTest = (test)=> {
	let include = ["title",
		"async",
		"sync",
		"timedOut",
		"pending",
		"type",
		"file",
		"duration"
	];

	try {
		let o = {};
		for (let prop in test) {

			if (include.indexOf(prop) !== -1) {
				o[prop] = test[prop];
			}
		}
		o.status = test.state;
		return o;
	} catch (ex) {
		console.log(ex, ex.stack);
	}
}
let findTheSuite = (suiteName, theSuite)=> {
	try {
		let foundValue = null;
		if (suiteName === theSuite.suite) {
			foundValue = theSuite;
		}
		else {
			if (theSuite.suites) {
				theSuite.suites.forEach((value, key)=> {
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
}
class Reporter {
	constructor(runner) {

		let currentSuite = null;
		let parentSuite = null;
		let out = {file: null, suites: []};
		runner.on("suite", (suite)=> {
			if (suite.root) {
				suite.suites.forEach((item)=> {
					out.suites.push({suite: item.title, suites: [], tests: []});
					out.file = item.file;
				})
			}
			if (!suite.root) {
				parentSuite = currentSuite;
				if (parentSuite && !(parentSuite === 'rootSuite')) {
					let _temp = findTheSuite(suite.title, out);
					if (!_temp) {
						let _parent = findTheSuite(parentSuite, out);
						if (_parent) {
							_parent.suites.push({suite: suite.title, suites: [], tests: []})
						}
					}
				}
			}
			currentSuite = suite.title || "rootSuite";
		});
		runner.on("pending", (test)=> {
			let found = findTheSuite(currentSuite, out);
			//console.log("foundthesuite",found ===null,found instanceof Map);
			if (found && found.tests) {
				found.tests.push({test: fixTest(test), error: null});
			}
		});
		runner.on("pass", (test)=> {
			let found = findTheSuite(currentSuite, out);
			if (found && found.tests) {
				found.tests.push({test: fixTest(test), error: null});
			}
		});
		runner.on("fail", (test, err)=> {
			let found = findTheSuite(currentSuite, out);
			if (found && found.tests) {
				found.tests.push({test: fixTest(test), error: err.message});
			}
		});
		runner.on("end", ()=> {
			if (process.send) {
				process.send({type: "mochaDone", message: JSON.stringify(out)})
			}
		});
	}
}
module.exports = Reporter;
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
let walkObject = (obj)=> {
	if (obj.file) {
		console.log("File", obj.file);
	}
	if (obj.suite) {
		console.log("Suite", obj.suite);
	}
	if (obj.tests) {
		obj.tests.forEach((test)=>console.log(test));
	}
	if (obj.suites) {
		obj.suites.forEach((suite)=> {
			//if(obj.suite){
			//	console.log(obj.suite +" Nested Suites:");
			//}
			walkObject(suite)
		});
	}
}
let findTheSuite = (suiteName, theSuite)=> {
	try {
		let foundValue = null;
		if (suiteName === theSuite.suite) {
			foundValue = theSuite;
			//console.log("found in main loop",foundValue.suite)
		}
		else {
			if (theSuite.suites) {
				theSuite.suites.forEach((value, key)=> {
					//console.log(key,"in find the suite");
					if (!foundValue) {
						foundValue = findTheSuite(suiteName, value);
						//console.log("after recursion",foundValue===null?"notfound":foundValue.suite);
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
		let level = 0;
		let levelType = "";
		let currentSuite = null;
		let parentSuite = null;
		let out = {file: null, suites: []};
		if (process.send) {
			//runner.on("start", ()=> {
			//	process.send({
			//		type   : "mochaStarted",
			//		message: {"mochaStarted": "mochaStarted", time: new Date()}
			//	});
				level++;
				levelType = "root start";
				//console.log(level, levelType);
			//});
			runner.on("suite", (suite)=> {
				if (suite.root) {
					suite.suites.forEach((item)=> {
						out.suites.push({suite: item.title, suites: [], tests: []});
						out.file = item.file;
					})
					//console.log(out);
				}
				//if (suite.title) {
				//	process.send({type: "suiteStarted", message: {title: suite.title}})
				//}

				if (!suite.root) {
					parentSuite = currentSuite;
					if (parentSuite && !(parentSuite === 'rootSuite')) {
						let _temp = findTheSuite(suite.title, out);
						//console.log(_temp, suite.title, parentSuite);
						if (!_temp) {
							let _parent = findTheSuite(parentSuite, out);
							if (_parent) {
								_parent.suites.push({suite: suite.title, suites: [], tests: []})
							}
						}//let _tmpHash={suite:currentSuite,suites:new Map(),tests:new Map()};
						//_temp.suites.set(currentSuite,_tmpHash );
						//out.suites.set(parentSuite, _temp);
					}
					//console.log(out)
				}

				//level++;
				//levelType = "suite start";
				currentSuite = suite.title || "rootSuite";
				//console.log("suite start",suite);
				//console.log(level, levelType, suite.title || "rootSuite", parentSuite);
			});
			//runner.on("suite end", (suite)=> {
				//if (suite.title) {
				//	process.send({
				//		type   : "suiteDone",
				//		message: {"suiteDone": "suiteDone", time: new Date(), title: suite.title}
				//	})
				//}

				levelType = "suite end";
				//console.log(level, levelType, suite.title || "rootSuite", parentSuite);
				//console.log("suite end",suite);
				level--;
			//});
			runner.on("pending", (test)=> {
				//process.send({type: "specDone", message: {title: test.title, status: "pending"}})
				//levelType = "test";
				//console.log(level, leveltype, test.title, currentSuite, parentSuite);
				let found = findTheSuite(currentSuite, out);
				//console.log("foundthesuite",found ===null,found instanceof Map);
				if (found && found.tests) {
					found.tests.push({test:fixTest(test),error:null});
				}
			});
			runner.on("pass", (test)=> {
				//process.send({type: "specDone", message: {title: test.title, status: "passed"}})
				//levelType = "test";
				//console.log(level, levelType, test.title, currentSuite, parentSuite);
				let found = findTheSuite(currentSuite, out);
				//console.log("foundthesuite",found ===null,found instanceof Map);
				//console.log("passed found",found);
				if (found && found.tests) {
					found.tests.push({test:fixTest(test),error:null});
				}
				//console.log("passed found after",found);
				//console.log(out);
			});
			runner.on("fail", (test, err)=> {
				//process.send({
				//	type   : "specDone",
				//	message: {title: test.title, status: "failed", error: err}
				//});
				//levelType = "test";
				//console.log(level, levelType, test.title, currentSuite, parentSuite);
				let found = findTheSuite(currentSuite, out);
				//console.log("foundthesuite",found ===null,found instanceof Map);
				if (found && found.tests) {
					found.tests.push({test: fixTest(test), error: err.message});
				}
			});
			runner.on("end", ()=> {
				process.send({type: "mochaDone", message: JSON.stringify(out)})
			console.log("sending",JSON.serialize(out));
				levelType = "root end";
				//console.log(level, levelType);
				level--;
				//walkObject(out);
				//console.log("out",JSON.stringify(out));
			});
		} else {
			runner.on("start", ()=> {
				console.log({
					type   : "mochaStarted",
					message: {"mochaStarted": "mochaStarted", time: new Date()}
				});
				level++;
				levelType = "root";
				console.log(level, levelType);
			});
			runner.on("suite", (suite)=> {
				if (suite.title) {
					console.log({type: "suiteStarted", message: {title: suite.title}})
				}
				level++;
				levelType = "suite";
				console.log(level, levelType, suite.title);
			});
			runner.on("suite end", (suite)=> {
				if (suite.title) {
					console.log({
						type   : "suiteDone",
						message: {"suiteDone": "suiteDone", time: new Date(), title: suite.title}
					})
				}

				levelType = "suite";
				console.log(level, levelType, suite.title);
				level--;
			});
			runner.on("pending", (test)=> {
				console.log({type: "specDone", message: {title: test.title, status: "pending"}})
				levelType = "test";
				console.log(level, levelType, test.title);
			});
			runner.on("pass", (test)=> {
				console.log({type: "specDone", message: {title: test.title, status: "passed"}})
				levelType = "test";
				console.log(level, levelType, test.title);
			});
			runner.on("fail", (test, err)=> {
				console.log({
					type   : "specDone",
					message: {title: test.title, status: "failed", error: err}
				});
				levelType = "test";
				console.log(level, levelType, test.title);
			});
			runner.on("end", ()=> {
				console.log({type: "mochaDone", message: {"mochaDone": "mochadone", time: new Date()}})
				levelType = "root";
				console.log(level, levelType);
				level--;

			});
		}
	}
}
module.exports = Reporter;
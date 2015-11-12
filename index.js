/**
 * module index
 *
 */
'use strict';
var Promise = require("bluebird"),
	fs = Promise.promisifyAll(require("fs")),
	child_process = Promise.promisifyAll(require("child_process")),
	util = require("util"),
	argv = require("minimist")(process.argv),
	SPR = require("./lib/serialPromiseRunner"),
	minimist = require("minimist"),
	path = require("path"),
	colors = require("colors/safe");

var writeResults = (results)=> {
	let out = [];
	for (let testFile in results) {
					let _tmp = {};
			_tmp.testFile = path.resolve(testFile);
			_tmp.tests = [];
			var item = results[testFile].results.specDone;
			item.forEach(function (value, key) {
				_tmp.tests.push({testName: value.testName, status: value.status, reason: value.reason});
			});
			out.push(_tmp);
	}
	return out;
}
module.exports.runTasks = (theTasks, theReporter, saveData)=> new Promise((resolve, reject)=> {
	let theArgs = minimist(process.argv.slice(2));
	if(theArgs.reporter){
		try{
			let _t= require(path.resolve(theArgs.reporter));
			theReporter=path.resolve(theArgs.reporter);
		}catch(ex){
			//purposely silent

		}
	}
	if (!theReporter) {
		theReporter = void(0);
	}
	theTasks = theTasks || theArgs._;
	if (saveData === void(0)) {
		if (theArgs.sm !== void(0)) {
			if (typeof theArgs.sm === 'boolean') {
				saveData = theArgs.sm;
			} else if (typeof theArgs.sm === 'string') {
				saveData = (theArgs.sm.toLowerCase() === 'true') || (theArgs.sm.toLowerCase() === 't') || (theArgs.sm.toLowerCase() === 'yes') || (theArgs.sm.toLowerCase() === 'y')
			}
		}
		if (saveData === void(0)) {
			saveData = false;
		}
	}
	let tasks = [];
	let results = {
	}
	theTasks.forEach((test)=> {
		tasks.push({
			name : test,
			args : [test, theReporter, saveData],
			funct: require("./lib/runFork")
		});
	});
	let spr = new SPR(tasks);
	spr.runTasks()
		.then((res)=> {

			//console.log(util.inspect(res,{depth:null}));
			if(saveData){
				res=writeResults(res);
			}else{
				res=null;
			}
			if(res && !theReporter){
				console.log(util.inspect(res,{depth:null}));
			}
			resolve(res);
		})
		.catch(reject)
		.finally(()=>spr = void(0));
})

if ((argv._.length > 1) && argv._[1].indexOf("index.js") !== -1) {
	module.exports.runTasks()
		.then((results)=> {
		})
		.catch((err)=>console.log(err, err.stack));
}
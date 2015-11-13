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
	colors = require("colors/safe"),
		level=0,
		indent="\t";

	var walkObject = (obj,level)=> {
		let theIndent="";
		for(let i=0;i<level;i++) {
			theIndent += indent;
		}
		if (obj.file) {
				console.log(theIndent+"File: "+ obj.file);
			}
		if (obj.suite) {
			console.log(theIndent+"Suite: "+ obj.suite);
		}
		if (obj.tests) {
			obj.tests.forEach((test)=>{
				//console.log(test.test.title);
				//console.log(test.test.status);
				//console.log(test.error);
				console.log(theIndent+indent+"Test: "+test.test.title+ "  "+test.test.status + ((test.error)?" Reason: "+test.error:""));
			})
		}
		if (obj.suites) {
			obj.suites.forEach((suite)=> {
				//if(obj.suite){
				//	console.log(obj.suite +" Nested Suites:");
				//}
				walkObject(suite,level+1);
			});
		}
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
			if(!saveData){
				res=null;
			}
			if(res && !theReporter){
				for (let file in res){
				walkObject(res[file].results,0);
				}
				//console.log(walkObject(res.results));
			}
			resolve(res);
		})
		.catch(reject)
		.finally(()=>spr = void(0));
})

if ((argv._.length > 1) && argv._[1].indexOf("index.js") !== -1) {
	module.exports.runTasks()
		.then((results)=> {
		console.log("finished with",results )})
		.catch((err)=>console.log(err, err.stack));
}
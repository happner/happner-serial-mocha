/**
 * module runFork
 *
 */
'use strict';
var Promise = require("bluebird"),
	fs = Promise.promisifyAll(require("fs")),
	child_process = require("child_process"),
	util = require("util"),
	EventEmitter = require("events").EventEmitter;
module.exports = (file,theReporter,saveData)=> new Promise((resolve, reject)=> {
	 saveData=saveData?"TRUE":"FALSE";
	"use strict";
	let results = {
		mochaStarted: [],
		suiteStarted: new Map(),
		specStarted : new Map(),
		specDone    : new Map(),
		suiteDone   : [],
		mochaDone   : []

	}
	let child = child_process.fork(__dirname+"/runMocha", [ file,theReporter,saveData], {silent: false});
	child.on("exit", (signal)=>{
			resolve(results)}
	);
	child.on("message", (messageObj)=>{
		switch (messageObj.type){
			case "mochaStarted":{
				results.mochaStarted.push(messageObj.message);
				break;
			}
			case "suiteStarted": {
					results.suiteStarted.set(messageObj.message.title, messageObj.message);
				break;
				}case "specDone": {
					results.specDone.set(messageObj.message.title, {testName:messageObj.message.title,status:messageObj.message.status,reason:messageObj.message.error?messageObj.message.error:""});
				break;
				}
		case "suiteDone": {
			results.suiteDone.push(messageObj.message);
				break;
				}
		}
	});
	child.on("error",(error)=>console.log(error));
})




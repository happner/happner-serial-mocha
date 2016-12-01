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

module.exports = function(file, theReporter, saveData){

	return new Promise(function(resolve, reject){

		var saveData=saveData?"TRUE":"FALSE";

		var results = {
			//mochaStarted: [],
			//suiteStarted: new Map(),
			//specStarted : new Map(),
			//specDone    : new Map(),
			//suiteDone   : [],
			//mochaDone   : []

		};

		console.log('forking:::', file, theReporter, saveData);

		var child = child_process.fork(__dirname+"/runMocha", [ file, theReporter, saveData], {silent: false});

		console.log('have child:::');

		child.on("exit", function(signal){
			//console.log("got exit",results);
			resolve(results)}
		);

		child.on("message", function(messageObj){

			console.log('message:::', messageObj);

			//console.log("got message",messageObj);
			//switch (messageObj.type){
			//	case "mochaStarted":{
			//		results.mochaStarted.push(messageObj.message);
			//		break;
			//	}
			//	case "suiteStarted": {
			//			results.suiteStarted.set(messageObj.message.title, messageObj.message);
			//		break;
			//		}case "specDone": {
			//			results.specDone.set(messageObj.message.title, {testName:messageObj.message.title,status:messageObj.message.status,reason:messageObj.message.error?messageObj.message.error:""});
			//		break;
			//		}
			//case "suiteDone": {
			//	results.suiteDone.push(messageObj.message);
			//		break;
			//		}
			if(messageObj.type==='mochaDone'){
				console.log('mocha done:::', messageObj);
				//console.log("got message",messageObj);
				results=JSON.parse(messageObj.message);
			}
		});

		child.on("error",
			function(error){
				console.log(error);
				reject(error);
			});

	});
};




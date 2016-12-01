/**
 * module runFork
 *
 */
'use strict';
var Promise = require("bluebird"),
	fs = Promise.promisifyAll(require("fs")),
	child_process = require("child_process"),
	util = require("util");

module.exports = function(file, theReporter, saveData){

	return new Promise(function(resolve, reject){

		var saveData=saveData?"TRUE":"FALSE";

		var results = {};

		var child = child_process.fork(__dirname+"/runMocha", [ file, theReporter, saveData], {silent: false});

		child.on("exit", function(){
			resolve(results)}
		);

		child.on("message", function(messageObj){
			if(messageObj.type==='mochaDone') results = JSON.parse(messageObj.message);
		});

		child.on("error",
			function(error){
				reject(error);
			});
	});
};




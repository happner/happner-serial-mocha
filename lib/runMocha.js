/**
 * module runMocha
 *
 */
var util = require("util"), Mocha = require("mocha");

function runMocha(file, theReporter, saveData) {
	"use strict";
	var mocha = new Mocha();

	var start = Date.now();

	if (process.send) process.send({type: "mochaStart", message: start});

	if (process.send) process.send({type: "reporter", message: theReporter});

	if (theReporter && theReporter !== 'null' && theReporter !== 'undefined') {
		var rep = require(theReporter);
		if (typeof rep === 'function') {

			mocha.reporter(rep);

			if (process.send) process.send({type: "reporter added", message: theReporter});
		}
	}
	if (saveData === 'TRUE') mocha.reporter(require(__dirname + "/serialReporter"));

	mocha.addFile(file);
	mocha.run(function(failures){

		if (process.send) process.send({type: "mochaEnd", message: Date.now() - start});

		process.exit(failures);
	});

}
module.exports = runMocha.apply(null, process.argv.splice(2));
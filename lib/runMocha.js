/**
 * module runJasmine
 *
 */
var util = require("util"),
	Mocha = require("mocha");
function runMocha(file, theReporter, saveData) {
	"use strict";
	let mocha = new Mocha();
	if (theReporter && theReporter !== 'null' && theReporter !== 'undefined') {
		let rep = require(theReporter);
		if (typeof rep === 'function') {
			mocha.reporter(rep);
		}
	}
	if (saveData === 'TRUE') {
		mocha.reporter(require(__dirname + "/serialReporter"));
	}
	mocha.addFile(file);
  mocha.run();

}
module.exports = runMocha.apply(null, process.argv.splice(2));
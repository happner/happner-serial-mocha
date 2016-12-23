/**
 * module runMocha
 *
 */
var util = require("util"), Mocha = require("mocha");

function runMocha(file, theReporterPath) {

	var reporter = require(theReporterPath);

	var mocha = new Mocha();

	var start = Date.now();

	if (process.send) process.send({type: "mochaStart", message: start});

	mocha.reporter(reporter);

	mocha.addFile(file);

	mocha.run(function(failures){

		if (process.send) process.send({type: "mochaEnd", message: Date.now() - start});

		process.exit(failures);
	});

}
module.exports = runMocha.apply(null, process.argv.splice(2));
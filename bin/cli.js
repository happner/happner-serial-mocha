var SerialMocha = require('../lib/serialMocha')
	, colors = require("colors/safe")
	, commander = require('commander')
	, path = require('path')
	;

var smInstance = new SerialMocha();

commander

	.version (JSON.parse(require('fs').readFileSync(path.resolve(__dirname, '..','package.json'))).version)

	.option ("-t, --folder <val>", "the folder the tests are in")

	.option ("-r, --reporter <val>", "the reporter")

	.option ("-d, --output <val>", "the folder the reports go to")

	.parse(process.argv);

var testFolder = commander.option('t').folder;
var reporter = commander.option('r').reporter?commander.option('r').reporter:'./serialReporter';
var reportsFolder = commander.option('d').output?commander.option('d').output:'../test/reports';

if (testFolder) {

	return smInstance.runTasks(testFolder, reporter, reportsFolder)

		.then(function (results) {
			console.log(colors.green("\r\nrun ok, duration: " + results.aggregated.duration));
		})

		.catch(function (err) {
			console.log(err, err.stack)
		});
}

console.log('run failed: you need to configure a folder containing your test files to do a run');


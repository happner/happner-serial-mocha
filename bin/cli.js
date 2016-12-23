var SerialMocha = require('../lib/serialMocha')
	, colors = require("colors/safe")
	, commander = require('commander')
	, path = require('path')
	;

var smInstance = new SerialMocha();

commander

	.version (JSON.parse(require('fs').readFileSync(path.resolve(__dirname, '..','package.json'))).version)

	.option ("-f, --folder <val>", "the folder")

	.parse(process.argv);

var testFolder = commander.option('f').folder;

if (testFolder) {

	if (!path.isAbsolute(testFolder)) testFolder = path.resolve(__dirname, testFolder);

	return smInstance.runTasks(testFolder)

		.then(function (results) {
			console.log(colors.green("\r\nrun ok, duration: " + results.aggregated.duration));
		})

		.catch(function (err) {
			console.log(err, err.stack)
		});
}

console.log('run failed: you need to configure a folder containing your test files to do a run');


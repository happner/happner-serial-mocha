var argv = require("minimist")(process.argv)
	, SerialMocha = require('./lib/serialMocha')
	, colors = require("colors/safe")
;

if ((argv._.length > 1) && argv._[1].indexOf("index.js") !== -1) {

	var instanceSerialMocha = new SerialMocha();

	instanceSerialMocha.runTasks()
		.then(function(results){
			console.log(colors.green("\r\nrun ok, duration: " + results.aggregated.duration ));
		})
		.catch(function(err){console.log(err, err.stack)});
}

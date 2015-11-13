#!/usr/bin/env node

var argv=require("minimist")(process.argv.splice(2));
var tasks=argv._;
var reporter=argv.reporter;
var savedata=argv.sm;
var sh=require("../index.js");

sh.runTasks(tasks,reporter,savedata)
	.then(function(results){})
	.catch(function(error){console.log(error,error.stack)});


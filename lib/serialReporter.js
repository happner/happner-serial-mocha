/**
 * module serialReporter
 *
 */
'use strict';
class Reporter{
	constructor(runner){
		if(process.send) {
			runner.on("start", ()=>process.send({
				type   : "mochaStarted",
				message: {"mochaStarted": "mochaStarted", time: new Date()}
			}));
			runner.on("suite", (suite)=>{
				if(suite.title){
					process.send({type: "suiteStarted", message: {title:suite.title}})
				}
			});
			runner.on("suite end", (suite)=>{
				if(suite.title) {
					process.send({
						type   : "suiteDone",
						message: {"suiteDone": "suiteDone", time: new Date(), title: suite.title}
					})
				}
			});
			runner.on("pending", (test)=>process.send({type: "specDone", message: {title: test.title, status: "pending"}}));
			runner.on("pass", (test)=>{
				process.send({type: "specDone", message: {title: test.title, status: "passed"}})
			});
			runner.on("fail", (test, err)=>{
								process.send({
					type   : "specDone",
					message: {title: test.title, status: "failed", error: err.message}
				})
			});
			runner.on("end", ()=>process.send({type: "mochaDone", message: {"mochaDone": "mochadone", time: new Date()}}));
		}else{
			runner.on("start", ()=>console.log({
				type   : "mochaStarted",
				message: {"mochaStarted": "mochaStarted", time: new Date()}
			}));
			runner.on("suite", (suite)=>{
				if(suite.title){
					console.log({type: "suiteStarted", message: {title:suite.title}})
				}
			});
			runner.on("suite end", (suite)=>{
				if(suite.title) {
					console.log({
						type   : "suiteDone",
						message: {"suiteDone": "suiteDone", time: new Date(), title: suite.title}
					})
				}
			});
			runner.on("pending", (test)=>console.log({type: "specDone", message: {title: test.title, status: "pending"}}));
			runner.on("pass", (test)=>{
				console.log({type: "specDone", message: {title: test.title, status: "passed"}})
			});
			runner.on("fail", (test, err)=>console.log({
				type   : "specDone",
				message: {title: test.title, status: "failed", error: err}
			}));
			runner.on("end", ()=>console.log({type: "mochaDone", message: {"mochaDone": "mochadone", time: new Date()}}));
		}
	}
}
module.exports=Reporter;
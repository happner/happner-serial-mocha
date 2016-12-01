/**
 * module testBasic.spec
 *
 */
'use strict';
var expect=require("expect");

describe("second test",function(){

	it("secondtestIt",function(done){

		expect(true).toBe(false);
		//console.log("threee");
		done();
	});
});
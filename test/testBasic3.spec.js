/**
 * module testBasic.spec
 *
 */
'use strict';
var expect=require("expect");

describe("third test Suite",function(){

	it("third test",function(done){

		expect(true).toBe(true);
		expect("one").toEqual("seven");

		done();
	})
});

describe("fourth test Suite",function(){

	it("fourth test",function(done){
		
		expect(true).toBe(false);
		expect("one").toEqual("seven");

		done();
	})
});
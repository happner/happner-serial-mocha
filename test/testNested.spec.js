/**
 * module testBasic.spec
 *
 */
'use strict';
var expect=require("expect");

describe("first test Suite",function(){

	it("first test",function(done){
		expect(true).toBe(true);
		expect("one").toEqual("seven");
	//console.log("four");
		done();
	})
});
describe("second test Suite",function(){

	it("second test",function(done){
		expect(true).toBe(false);
		expect("one").toEqual("seven");
	//console.log("four");
		done();
	});

	describe("nested suite",function(){

		it("third test",function(done){
			expect(true).toBe(true);
			expect("one").toEqual("one");
			//console.log("four");
			done();
		});

		it("fourth test",function(done){
			expect(true).toBe(true);
			expect("one").toEqual("six");
			//console.log("four");
			done();
		});
	})
});
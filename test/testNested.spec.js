/**
 * module testBasic.spec
 *
 */
'use strict';
let expect=require("expect");
describe("first test Suite",()=>{
	it("first test",(done)=>{
		expect(true).toBe(true);
		expect("one").toEqual("seven");
	//console.log("four");
		done();
	})



});
describe("second test Suite",()=>{
	it("second test",(done)=>{
		expect(true).toBe(false);
		expect("one").toEqual("seven");
	//console.log("four");
		done();
	});
	describe("nested suite",()=>{
		it("third test",(done)=>{
			expect(true).toBe(true);
			expect("one").toEqual("one");
			//console.log("four");
			done();
		});
		it("fourth test",(done)=>{
			expect(true).toBe(true);
			expect("one").toEqual("six");
			//console.log("four");
			done();
		});
	})



})
/**
 * module testBasic.spec
 *
 */
'use strict';
let expect=require("expect");
describe("third test Suite",()=>{
	it("third test",(done)=>{
		expect(true).toBe(true);
		expect("one").toEqual("seven");
	//console.log("four");
		done();
	})



});
describe("fourth test Suite",()=>{
	it("fourth test",(done)=>{
		expect(true).toBe(false);
		expect("one").toEqual("seven");
	//console.log("four");
		done();
	})



})
/**
 * module testBasic.spec
 *
 */
'use strict';
var expect=require("expect");

describe("first test",function() {

	it("firstTestIt",function(done) {
		expect(true).toBe(true);
		expect("one").toEqual("one");
		done();
		//console.log("one")
	})
})

describe("another test",function(){

	it("antotherTestI",function(done){

		expect(12).toBe(12);
		expect(null).toEqual(null);
		//console.log("two");
		setTimeout(done, 1000)
	})

})
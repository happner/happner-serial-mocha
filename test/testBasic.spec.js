/**
 * module testBasic.spec
 *
 */
'use strict';
let expect=require("expect");
describe("first test",()=> {
	it("firstTestIt", (done)=> {
		expect(true).toBe(true);
		expect("one").toEqual("one");
		done();
		//console.log("one")
	})
})
	describe("another test",(done)=>{
	it("antotherTestI",(done)=>{
		expect(12).toBe(12);
		expect(null).toEqual(null);
		//console.log("two");
		setTimeout(()=>done(),1000)
	})

})
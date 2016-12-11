/**
 * module testBasic.spec
 *
 */
'use strict';

describe("programmatic test1",function() {

  it("a passing test1",function(done) {
    done();
  });

  context('a test context', function(){

    it("a failing test in context",function(done) {
      done(new Error('test error'));
    });

    xit("a skipped test in context",function(done) {
      done();
    });

    it("a passing test in context",function(done) {
      done();
    });

    context('a deeper test context', function(){

      it("a passing test in a deeper context",function(done) {
        setTimeout(done, 1000);
      });
    });
  });
});
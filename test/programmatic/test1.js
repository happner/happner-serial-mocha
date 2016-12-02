/**
 * module testBasic.spec
 *
 */
'use strict';

describe("programmatic test1",function() {

  it("a passing test1",function(done) {
    done();
  });

  it("a failing test1",function(done) {
    done(new Error('test error'));
  });

  xit("a skipped test1",function(done) {
    done();
  });
});
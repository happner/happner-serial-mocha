/**
 * module testBasic.spec
 *
 */
'use strict';

describe("programmatic test",function() {

  it("a passing test",function(done) {
    done();
  });

  it("a failing test",function(done) {
    done(new Error('test error'));
  });

  xit("a skipped test",function(done) {
    done();
  });
});
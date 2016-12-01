/**
 * @module serialPromiseRunner
 *This module runs promises serially.
 * Multiple instances can be instantiated
 * It has two modes: run all tasks and stop on error
 **/
'use strict';
var Promise = require("bluebird"), serialRunner;

module.exports = serialRunner = function (tasks) {

  if (!(this instanceof serialRunner)) {
    return new serialRunner(tasks);
  }

  var _tasks = [];
  if (tasks) {
    _tasks = tasks;
  }

  this.results = {};

  this.addTask = function (task) {
    _tasks.push(task);
  };

  this.getTasks = function () {
    return _tasks;
  }
};
/**
 * Runs all tasks will stop on error.
 * A task is represented by a hash:
 * {name: The namespace upon which to hang the results,
 *  funct: a function which returns a promise (actual function not a string
 *  args: an array of arguments to be passed to the function
 *  Note that when the function is run it will include results as the last argument which contains a hash of
 *  the results run prior to its being called
 *  the results argument is a hash. Each namespace is an element of the hash e.g.
 *  results = {
 *    namespace1:{success:true, results:xxx},
 *    namespace2:{success:false, error:yyy}
 *    }
 *
 * @returns {bluebird}
 */
serialRunner.prototype.runTasks = Promise.promisify(function(callback) {

  var self = this;

  var aTasks = self.getTasks();

  var async = require('async');

  async.eachSeries(aTasks, function(task, taskCB){

    task.args.push(self.results);

    task.funct.apply(null, task.args)

      .then(function(res){
        self.results[task.name] = {success: true, results: res};
        taskCB();
      })

      .catch(taskCB);

  }, function(e){

    if (e) return callback(e);

    callback(null, self.results);
  });
});

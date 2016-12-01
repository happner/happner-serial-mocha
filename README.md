#Serial Mocha
A simple module which allows you to run mocha tests serially.

Mocha normally runs spec files in parallel. If you have a use case where you would like to ensure that the files are run one at a time, in sequence, you can use serial-mocha.

Normal usage is from the command line but it can also be used programatically which allows you to capture information about the tests if you want to further process that information. This is useful if you want to create a dashboard for checking health status.

The module exposes one method, runTasks, which returns a promise. That promise is resolved when __all tests__ are complete. It does not reject if a test fails. You can determine the status of an individual test by examining
the data in the resolved promise. 

Because of a deficiency in mocha, __mocha.run cannot be called multiple times. It does not clean up after itself and residual information from previous calls corrupts subsequent runs. In order to overcome this we fork a new process for each test. The implications of that are that it requires about 30 msec to spin up the process and uses about 10mb of memory. Therefor this module is not designed to run 1000's of tests sequentially.

##Installation

```
npm install happner-serial-mocha --save-dev (or -g if you are going to run from command line)

npm test

```

##Usage##
1. from the command line (requires a global install):

```
serial-mocha [-r <path to custom reporter>] [-d <path to report file output directory>] [--sm --] <path to test files may be a glob>
```
1. r - we will forward that to mocha following the usual mocha rules.
1. d - report file ourput directory
1. sm   if present we use the default serial-mocha reporter. If absent we use the mocha default.

NOTE: The -- after --sm is not a typo. If you don't add it your first test file will be assigned to sm which I am sure you don't want.

If you just want the default mocha reporter but want you tests run serially just use this:
```
serial-mocha <path to test files>

//NB you can use wildcards: serial-mocha test/*.js -r lib/serialReporter -d test/reports
```

##Programatically##

```

var sm=require("serial-mocha');
var taskFiles=["./test/foo.spec.js","./test/bar.spec.js"];
sm.runTasks(taskFiles,null,true, "/my/test/reports")
	.then((results)=>{
   		//Do what you want with data
	})
	.catch((err)=>console.log(err));
```
The parameters for runTasks:

1. taskFiles - array of file names of task files.
1. reporter -- path to a custom reporter use null to use mocha default
1. saveData - if true information on tests will be returned in resolved promise. (See information below).
1. test report directory

If saveData is true and no custom reporter is provided the serial-mocha default reporter will be used.
If saveData is true and a custom reporter is provided that reporter will be used
If saveData is false and no customer reporter is provided the default mocha reporter will be used but no useful information will be returned on promise resolution. I have trouble imagining why you would be doing things programatically and not want the data back though.

##Sample output (command line usage)
```
> serial-mocha --sm -- test/*.spec.js 
File: /Volumes/DataDrive/donnievbitbucket/serial-mocha/dist/test/testBasic.spec.js
        Suite: first test
                Test: firstTestIt  passed
        Suite: another test
                Test: antotherTestI  passed
File: /Volumes/DataDrive/donnievbitbucket/serial-mocha/dist/test/testBasic2.spec.js
        Suite: second test
                Test: secondtestIt  failed Reason: Expected true to be false
File: /Volumes/DataDrive/donnievbitbucket/serial-mocha/dist/test/testBasic3.spec.js
        Suite: third test Suite
                Test: third test  failed Reason: Expected 'one' to equal 'seven'
        Suite: fourth test Suite
                Test: fourth test  failed Reason: Expected true to be false
File: /Volumes/DataDrive/donnievbitbucket/serial-mocha/dist/test/testNested.spec.js
        Suite: first test Suite
                Test: first test  failed Reason: Expected 'one' to equal 'seven'
        Suite: second test Suite
                Test: second test  failed Reason: Expected true to be false
                Suite: nested suite
                        Test: third test  passed
                        Test: fourth test  failed Reason: Expected 'one' to equal 'six'

$> serial-mocha    -- test/*.spec.js 
 

  first test
    ✓ firstTestIt

  another test
    ✓ antotherTestI (1002ms)


  2 passing (1s)



  second test
    1) secondtestIt


  0 passing (19ms)
  1 failing

  1) second test secondtestIt:
     Error: Expected true to be false
      at Object.assert [as default] (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/assert.js:20:9)
      at Expectation.toBe (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/Expectation.js:76:24)
      at Context.<anonymous> (test/testBasic2.spec.js:9:16)





  third test Suite
    1) third test

  fourth test Suite
    2) fourth test


  0 passing (22ms)
  2 failing

  1) third test Suite third test:

      Error: Expected 'one' to equal 'seven'
      + expected - actual

      -one
      +seven
      
      at Object.assert [as default] (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/assert.js:20:9)
      at Expectation.toEqual (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/Expectation.js:89:26)
      at Context.<anonymous> (test/testBasic3.spec.js:10:17)

  2) fourth test Suite fourth test:
     Error: Expected true to be false
      at Object.assert [as default] (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/assert.js:20:9)
      at Expectation.toBe (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/Expectation.js:76:24)
      at Context.<anonymous> (test/testBasic3.spec.js:17:16)





  first test Suite
    1) first test

  second test Suite
    2) second test
    nested suite
      ✓ third test
      3) fourth test


  1 passing (22ms)
  3 failing

  1) first test Suite first test:

      Error: Expected 'one' to equal 'seven'
      + expected - actual

      -one
      +seven
      
      at Object.assert [as default] (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/assert.js:20:9)
      at Expectation.toEqual (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/Expectation.js:89:26)
      at Context.<anonymous> (test/testNested.spec.js:10:17)

  2) second test Suite second test:
     Error: Expected true to be false
      at Object.assert [as default] (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/assert.js:20:9)
      at Expectation.toBe (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/Expectation.js:76:24)
      at Context.<anonymous> (test/testNested.spec.js:17:16)

  3) second test Suite nested suite fourth test:

      Error: Expected 'one' to equal 'six'
      + expected - actual

      -one
      +six
      
      at Object.assert [as default] (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/assert.js:20:9)
      at Expectation.toEqual (/Volumes/DataDrive/donnievbitbucket/serial-mocha/node_modules/expect/lib/Expectation.js:89:26)
      at Context.<anonymous> (test/testNested.spec.js:31:18)




   

```

##Test information returned on promise resolution

```
{
	test:{
		async: 1
		duration: 3
		file: "/Volumes/DataDrive/test_worker/dist/test/testBasic2.spec.js"
		pending: false
		status: "failed"
		sync: false
		timedOut: false
		title: "secondtestIt"
		type: "test
  	},
  	error:"error Message"
}        
```
For at given test file the information is in the form:

```
{file:xxxx,
 suites:[
    {
     suite:"suitename",
     suites:[],  //array of nested suites
     tests:[]  //array of tests
     }
   ]
}
```

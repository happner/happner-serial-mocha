#Serial Mocha
A simple module which allows you to run mocha tests serially.

Mocha normally runs spec files in parallel. If you have a use case where you would like to ensure that the files are run one at a time, in sequence, you can use serial-mocha.

Normal usage is from the command line but it can also be used programatically which allows you to capture information about the tests if you want to further process that information. This is useful if you want to create a dashboard for checking health status.

The module exposes one method, runTasks, which returns a promise. That promise is resolved when __all tests__ are complete. It does not reject if a test fails. You can determine the status of an individual test by examining
the data in the resolved promise. 

Because of a deficiency in mocha, __mocha.run cannot be called multiple times. It does not clean up after itself and residual information from previous calls corrupts subsequent runs. In order to overcome this we fork a new process for each test. The implications of that are that it requires about 30 msec to spin up the process and uses about 10mb of memory. Therefor this module is not designed to run 1000's of tests sequentially.

Note: The module uses generators so works in node Argon or greater or with node v.12+ with the --harmony flag


##Installation

```
npm install serial-mocha --save-dev (or -g if you are going to run from command line)
```

##Usage##
1. from the command line (requires a global install):

```
serial-mocha [--reporter <path to custom reporter>] [--sm --] <path to test files may be a glob>
```
1. reporter - we will forward that to mocha following the usual mocha rules. 
1. sm   if present we use the default serial-mocha reporter. If absent we use the mocha default.

NOTE: The -- after --sm is not a typo. If you don't add it your first test file will be assigned to sm which I am sure you don't want.

If you just want the default mocha reporter but want you tests run serially just use this:
```
serial-mocha <path to test files>
```

##Programatically##

```

var sm=require("serial-mocha');
var taskFiles=["./test/foo.spec.js","./test/bar.spec.js"];
sm.runTasks(taskFiles,null,true)
	.then((results)=>{
   		//Do what you want with data
	})
	.catch((err)=>console.log(err));
```
The parameters for runTasks:

1. taskFiles - array of file names of task files.
1. reporter -- path to a custom reporter use null to use mocha default
1. saveData - if true information on tests will be returned in resolved promise. (See information below).

If saveData is true and no custom reporter is provided the serial-mocha default reporter will be used.
If saveData is true and a custom reporter is provided that reporter will be used
If saveData is false and no customer reporter is provided the default mocha reporter will be used but no useful information will be returned on promise resolution. I have trouble imagining why you would be doing things programatically and not want the data back though.

##Sample output (command line usage)
```
> serial-mocha  --sm  -- test/*.spec.js 
[ { testFile: '/Volumes/DataDrive/donnievbitbucket/serial-mocha/test/testBasic.spec.js',
    tests: 
     [ { testName: 'firstTestIt', status: 'passed', reason: '' },
       { testName: 'antotherTestI', status: 'passed', reason: '' } ] },
  { testFile: '/Volumes/DataDrive/donnievbitbucket/serial-mocha/test/testBasic2.spec.js',
    tests: 
     [ { testName: 'secondtestIt',
         status: 'failed',
         reason: 'Expected true to be false' } ] },
  { testFile: '/Volumes/DataDrive/donnievbitbucket/serial-mocha/test/testBasic3.spec.js',
    tests: 
     [ { testName: 'third test',
         status: 'failed',
         reason: 'Expected \'one\' to equal \'seven\'' },
       { testName: 'fourth test',
         status: 'failed',
         reason: 'Expected true to be false' } ] } ]

        
$> serial-mocha    -- test/*.spec.js 
   
   
     first test
       ✓ firstTestIt
   
     another test
       ✓ antotherTestI (1002ms)
   
   
     2 passing (1s)
   
   
   
     second test
       1) secondtestIt
   
   
     0 passing (18ms)
     1 failing
   
     1) second test secondtestIt:
        Error: Expected true to be false
         at Object.assert [as default] (node_modules/expect/lib/assert.js:20:9)
         at Expectation.toBe (node_modules/expect/lib/Expectation.js:76:24)
         at Context.<anonymous> (test/testBasic2.spec.js:9:16)
   
   
   
   
   
     third test Suite
       1) third test
   
     fourth test Suite
       2) fourth test
   
   
     0 passing (21ms)
     2 failing
   
     1) third test Suite third test:
   
         Error: Expected 'one' to equal 'seven'
         + expected - actual
   
         -one
         +seven
         
         at Object.assert [as default] (node_modules/expect/lib/assert.js:20:9)
         at Expectation.toEqual (node_modules/expect/lib/Expectation.js:89:26)
         at Context.<anonymous> (test/testBasic3.spec.js:10:17)
   
     2) fourth test Suite fourth test:
        Error: Expected true to be false
         at Object.assert [as default] (node_modules/expect/lib/assert.js:20:9)
         at Expectation.toBe (node_modules/expect/lib/Expectation.js:76:24)
         at Context.<anonymous> (test/testBasic3.spec.js:20:16)
   
   

```

##Data returned on promise resolution

```
[ { testFile: '/Volumes/DataDrive/donnievbitbucket/serial-mocha/test/testBasic.spec.js',
    tests: 
     [ { testName: 'firstTestIt', status: 'passed', reason: '' },
       { testName: 'antotherTestI', status: 'passed', reason: '' } ] },
  { testFile: '/Volumes/DataDrive/donnievbitbucket/serial-mocha/test/testBasic2.spec.js',
    tests: 
     [ { testName: 'secondtestIt',
         status: 'failed',
         reason: 'Expected true to be false' } ] },
  { testFile: '/Volumes/DataDrive/donnievbitbucket/serial-mocha/test/testBasic3.spec.js',
    tests: 
     [ { testName: 'third test',
         status: 'failed',
         reason: 'Expected \'one\' to equal \'seven\'' },
       { testName: 'fourth test',
         status: 'failed',
         reason: 'Expected true to be false' } ] } ]

        
```




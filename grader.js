#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtml = function(program) {
    if (program.file) {
        return cheerio.load(fs.readFileSync(program.file));
    } else if (program.url) {
        var buf;
        
        rest.get(program.url).on('complete', function(result) { 
            if (result instanceof Error) {
                console.error("Error: " + result.message);
            } else {
                buf = result;
            }
        });
        
        return cheerio.load(buf)
    }
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtml = function(program, checksfile) {
    var $ = cheerioHtml(program);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

if(require.main == module) {
    program
        .option('-c, --checks <checks-file>', 'Path to checks.json', assertFileExists, CHECKSFILE_DEFAULT)
        .option('-f, --file <file>', 'Path to index.html', assertFileExists, HTMLFILE_DEFAULT)
        .option('-u, --url <url>', 'URL to index.html')
        .parse(process.argv);
    //console.log("program", program);
    var checkJson = checkHtml(program, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
} else {
    exports.checkHtml = checkHtml;
}
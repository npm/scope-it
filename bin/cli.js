var cp = require('child_process')
var fs = require('fs')
var path = require('path')
var walkdir = require('walkdir')



var scope = "@taco"
var modules = ['a','b','c']
var dir = path.resolve(process.cwd(),'./')

var dryRun = true;

var pkg = require(path.join(dir,'package.json'))

pkg.name = (scope.length?scope+'/':'')+pkg.name.split('/').pop();

if(){

}








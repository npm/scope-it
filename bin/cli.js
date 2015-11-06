#!/usr/bin/env node
var yargs = require('yargs')
  .usage('$0 [options] [modules to scope]')
  .option('scope', {
    alias: 's',
    describe: 'the scope name or an empty scope to remove the scopes from matching require statements',
    required: true
  })
  .option('dry', {
    default: true,
    describe: 'set --dry 0 to save result'
  })
  .help('h')
  .alias('h', 'help')
  .version(require('../package.json').version)

var argv = yargs.argv


var cp = require('child_process')
var fs = require('fs')
var path = require('path')
var walkdir = require('walkdir')
var writeAtomic = require('write-file-atomic')

var rewriteBin = path.join(path.dirname(require.resolve('rewrite-js')),'bin','rewrite-js')

var scope = argv.scope
var modules = argv._
var dir = path.resolve(process.cwd(),'./')

var dryRun = argv.dry;
var jsonPath = path.join(dir,'package.json');
var pkg = require(jsonPath)

if(dryRun) console.log("--- DRY RUN ---")

// scope or unscope
var origName = pkg.name
pkg.name = (scope.length?scope+'/':'')+pkg.name.split('/').pop();

console.log('updating package.json from ',origName,'to',pkg.name)
if(!dryRun){
  writeAtomic(jsonPath,JSON.stringify(pkg,null,'  '))
}

var files = {}

rewrite(function(){
  if(dryRun) {
    console.log('dryrun complete.')
    process.exit(1)
  }
})

function rewrite(cb){
  var todo = []
  walkdir(dir,function(p,stat){
    if(p.substr(p.length-3) !== '.js') return
    if(~p.indexOf('.git') || ~p.indexOf('node_modules')) return
    if(!stat.isFile()) return
    todo.push([p,stat])
  }).on('end',function(){
    work()
  })

  function work(){
    var w = todo.shift();
    if(!w) return cb() 
    spawn(w,function(err){
      if(err) throw err;
      work()
    })
  }

}

function spawn(a,cb){

  var args = ['transform.js','--',scope]
  args.push.apply(args,modules,{cwd:__dirname})

  console.log('rewriting ',a[0])
  console.log('spawn',rewriteBin,args)

  var proc = cp.spawn(rewriteBin,args)

  var rs = fs.createReadStream(a[0])

  var file = []
  proc.stdout.on('data',function(buf){
    file.push(buf)
    console.log(buf+'')
  })
  proc.stdout.on('end',function(){
    var buf = Buffer.concat(file);
    //files[a[0]] = {file:a[0],stat:a[1],data:buf}

    if(buf.length) {
      console.log('saving ',a[0])
      writeAtomic(a[0],buf,{mode:a[1].mode},function(err){
        cb(err) 
      })   
    } else cb()
  })

  proc.stderr.on('data',function(buf){
    console.error(buf+'')
  })

  rs.pipe(proc.stdin)

}


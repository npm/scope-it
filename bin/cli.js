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
  .option('colors',{
    alias:"c",
    default:true,
    describe:"if code output should not be highlighted set this to 0"
  })
  .option('dir',{
    alias:"d",
    default:process.cwd(),
    describe:"specify a module directory. defaults to your current working directory"
  })
  .option('name',{
    describe:"set this to 0 if you do not want to also update this module's scope",
    default:true
  })
  .option('ignorePaths', {
    describe: "specify a comma separated list of paths within [dir] to ignore",
    default:""
  })
  .help('h')
  .alias('h', 'help')
  .version(require('../package.json').version)

var argv = yargs.argv


var cp = require('child_process')
var fs = require('fs')
var path = require('path')
var ui = require('../ui')(argv.colors)
var walkdir = require('walkdir')
var writeAtomic = require('write-file-atomic')

var rewriteBin = path.join(path.dirname(require.resolve('rewrite-js')),'bin','rewrite-js')

var scope = argv.scope
var modules = argv._
var dir = path.resolve(process.cwd(),argv.dir)

var ignorePaths = [];
if (argv.ignorePaths.length !== 0){
  ignorePaths = argv.ignorePaths.split(",");
  for (var i = 0; i < ignorePaths.length; i++){
    if (ignorePaths[i].length){
      // path.join removes extra "/" between paths it's joining
      ignorePaths[i] = path.join(dir, ignorePaths[i])
    }
  }
}

var scopeName = argv.name
var dryRun = argv.dry
var jsonPath = path.join(dir,'package.json')
var pkg

// make package.json optional
if(!fs.existsSync(jsonPath)) {
  pkg = {name:"package"}
} else {
  pkg = require(jsonPath)
}

if(dryRun) ui.banner("     DRY RUN")

// scope or unscope
if (scopeName){
  pkg.name = (scope.length?scope+'/':'')+pkg.name.split('/').pop();
}
// dependencies
pkg.dependencies = updateDeps(scope,pkg.dependencies||{},modules)
// devDependencies
pkg.devDependencies = updateDeps(scope,pkg.devDependencies||{},modules)

ui.banner('updating package.json name and deps')

ui.hl(JSON.stringify(pkg,null,'  '),'json')

if(!dryRun){
  writeAtomic(jsonPath,JSON.stringify(pkg,null,'  ')+'\n', function(err){if (err){throw err;}});
}

var files = {}

rewrite(function(){
  if(dryRun) {
    console.log('dryrun complete. --dry 0 to make these changes permanent\n')
  } else {
    console.log('changes have been saved.')
  }
})

function rewrite(cb){
  var todo = []
  walkdir(dir,function(p,stat){
    if(p.substr(p.length-3) !== '.js') return
    if(~p.indexOf('.git') || ~p.indexOf('node_modules')) return

    for (var i = 0; i < ignorePaths.length; i++){
      if (p.indexOf(ignorePaths[i]) === 0){
        return;
      }
    }
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
  args.push.apply(args,modules)

  var proc = cp.spawn(rewriteBin,args,{cwd:path.resolve(__dirname,'..')})


  var file = []
  // wait for stdout end and exit code.
  var c = 2;
  var finish = function(err){
    if(err) throw err;
    if(--c) return;

    var buf = Buffer.concat(file);

    ui.banner(a[0])
    ui.hl(buf)

    if(buf.length && !dryRun) {
      console.log('saving: ',a[0])
      writeAtomic(a[0],buf,{mode:a[1].mode},function(err){
        cb(err)
      })
    } else cb()
  }

  var rs = fs.createReadStream(a[0])

  proc.on('exit',function(code){
    var err
    if(code) err = new Error('bad exit code transforming js: '+code)
    finish(err)
  })

  proc.stdout.on('data',function(buf){
    file.push(buf)
  })

  proc.stdout.on('end',function(){
    finish()
  })

  proc.stderr.on('data',function(buf){
    console.error(buf+'')
  })

  rs.pipe(proc.stdin)

}

function updateDeps(scope,deps,modules){
  var out = {}
  Object.keys(deps).forEach(function(_k){
    var k = _k
    unscoped = unscope(k)
    if(~modules.indexOf(unscoped)) k = (scope.length?scope+'/':'')+unscoped
    out[k] = deps[_k]
  })
  return out
}

function unscope(name){
  var value = name.split('/')
  if(value[0].indexOf('@') === 0) {
    value.shift();
  }
  return value.join('/')
}

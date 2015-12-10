var cpr = require('cpr')
var rimraf = require('rimraf')
var spawn = require('child_process').spawn
var path = require('path')
var ts = require('monotonic-timestamp')


module.exports = {
  makeTest:function(cb){
    var from  = path.resolve(__dirname,'..','fixtures','package')
    var dest = path.resolve(__dirname,'..',ts())
    cpr(from,dest,function(){
      if(err) return cb(err)
      cb(false,dest)
    })
  },
  scopeIt:function(args,cb){
    var proc = spawn(path.resolve(__dirname,'..','bin','cli.js'),args)

    var out = []
    var err = []
    proc.stdout.on('data',function(buf){
      out.push(buf)
    })
    proc.stderr.on('data',function(buf){
      err.push(buf)
    })

    proc.on('exit',function(code){
      cb(false,{
        exit:code,
        out:Buffer.concat(out),
        err:Buffer.concat(err)
      })
    })

  },
  clean:function(){
    var files = []
    function clean (err) {
      var start = files.length;
      while(files.length) {
        try {
          rimraf.sync(files.shift())
        } catch(e) {
          if(files.length === start) throw e    
        }
      }
      if (err) process.emit('error', err)
    }

    clean.push = function(){
      files.push.apply(files,arguments)
    }

    process.once('uncaughtException', clean)
    process.once('exit', clean)

    return clean
  }
}

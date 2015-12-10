var test = require('tape')
var helper = require('./common/helper')
var fs = require('fs')
var path = require('path')


var clean = helper.clean()
test('can',function(t){
  helper.makeTest(function(err,dest){
    t.ok(!err,'should not have error making fixture')

    if(err) throw err


    clean.push(dest)

    helper.scopeIt(dest,['--dry', '0', '-s','@taco', '@test/a', '@soldair/c','d'],function(err,data){
      t.ok(!err,'should not have error running command')
      t.ok(data,'should have data')

      var json = fs.readFileSync(path.join(dest,'package.json'))
      var index = fs.readFileSync(path.join(dest,'index.js'))


      console.log(json+'')

      console.log(index+'')

      t.end()
      clean()
    })

  })
})

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

    helper.scopeIt(dest,['--dry', '0', '-s','@taco', 'a', 'c','d'],function(err,data){
      t.ok(!err,'should not have error running command')
      t.ok(data,'should have data')

      var json = fs.readFileSync(path.join(dest,'package.json'))
      var index = fs.readFileSync(path.join(dest,'index.js'))


      var obj = JSON.parse(json+'')

      var deps = obj.dependencies
      t.ok(deps['@taco/a'],'should have @taco/a')
      t.ok(deps.b,'should have not changed b')
      t.ok(deps['@taco/c'],'should have @taco/c')
      t.ok(deps['@taco/d'],'should have @taco/d')
      
      index = index+''

      t.ok(~index.indexOf('@taco/c/lib/index.js'),'require @soldair/c/lib/index.js -> @taco/c/lib/index.js')
      t.ok(~index.indexOf('@taco/d/test'),'require d/test -> @taco/d/test')
      t.ok(~index.indexOf('@taco/a'),'require @test/a -> @taco/a')

      t.end()
      clean()
    })

  })
})

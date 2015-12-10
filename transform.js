
var sep = process.argv.indexOf('--')
if(sep === -1) throw "pass argument -- to separate module names from rewrite-js arguments"

var moduleList = process.argv.slice(sep+1)

var scope = moduleList.shift()

if(!scope || (scope.indexOf('@') !== 0 && scope !== "")) {
  throw "please pass your desired scope as the first argument after `--`. `-- @scope foomodule boomodule`"
}

module.exports = {
  "call > .callee[name=require] + literal":scopeRequire
}


function scopeRequire(node){
  var value = unquote(node.source())
  unscoped = unscope(value)
  moduleName = unscoped.split('/')[0]
  if(moduleList.indexOf(moduleName) > -1) node.update("'"+(scope.length?scope+'/':'')+unscoped+"'")
}

function unscope(name){
  var value = name.split('/')
  if(value[0].indexOf('@') === 0) {
    value.shift();
  }
  return value.join('/')
}

function unquote(name){
  return name.replace(/^['"]|['"]$/g,'')
}

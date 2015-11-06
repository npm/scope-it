
var sep = process.argv.indexOf('--') 
if(sep === -1) throw "pass argument -- to separate module names from rewrite-js arguments"

var moduleList = process.argv.slice(sep+1)

var scope = moduleList.shift()

if(!scope || (scope.indexOf('@') !== 0 || scope !== "")) {
  throw "please pass your desired scope as the first argument after `--`. `-- @scope foomodule boomodule`"
}

module.exports = {
  "call > .callee[name=require] + literal":scopeRequire
}


function scopeRequire(node){
  var value = unquote(node.source())
  if(moduleList.indexOf(value) > -1) node.update("'"+scope+'/'+value+"'")
}


function unquote(name){
  return name.replace(/^['"]|['"]$/g,'')
}

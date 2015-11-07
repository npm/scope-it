
var hl = require('hl')

module.exports = function(colors) {
  var o = {
    banner:function(text){
      console.log('-------------------------------------------')
      console.log(text) 
      console.log('-------------------------------------------')
    },
    hl:function(buf){
      if(!colors) return cnsole.log(buf+'')
      process.stdout.write(hl(buf+'','js')+"\n")
    }
  }
  return o
}

var winston = require('winston');
var L8 = require("l8smartlight").L8;
var l8 = false;

var PNG = require('png-js');
var matrices = {};

exports.init = function(SARAH){
  if (l8) return;
  
  var config = SARAH.ConfigManager.getConfig();
      config = config.modules.l8smartlight;
  
  // Load icons
  var fs   = require('fs');
  var path = require('path');
  var icons = fs.readdirSync('plugins/l8smartlight/icons/');
  for (var i in icons){
    loadIcon(path.basename(icons[i],'.png'), 'plugins/l8smartlight/icons/'+icons[i]);
  }
  
  // Load L8
  l8 = new L8();
  l8.open(config.port, null, function(err) {
    if (err) { l8 = false;
      throw new Error("Error occurred: " + err);
    }
    console.log('L8 is ready');  
  });
} 

exports.action = function(data, callback, config, SARAH){
  config = config.modules.l8smartlight;
  log('L8 Icon: ', data.name);
  if (!config){
  	return callback({'tts' : 'Paramètre l8smartlight invalide'});
  }
  
  if (!l8){ return callback({'tts' : 'L8 not ready'}); }
  if (!data.name){ return callback({'tts' : 'No L8 icon name'}); }
  
  var name = data.name.toLowerCase().replace(' ','-'); 
  if (!matrices[name]){ name = 'unknow'; }
  blinkIcon(matrices[name], 3);
  callback({});
}

// ------------------------------------------
//  UTILITY
// ------------------------------------------

// https://github.com/jakobwesthoff/node-l8smartlight
var blinkIcon = function(matrix, cpt, off){
  if (cpt == 0) return;
  
  if (off){ l8.clearMatrix();  } 
  else    { l8.setMatrix(matrix, function(err, res) { }); }
  
  setTimeout(function(){
    blinkIcon(matrix, off ? cpt-1 : cpt, !off);  
  }, 400);
}

// https://github.com/devongovett/png.js
var loadIcon = function(name, path){
  log('loadIcon: ' + name);
  matrices[name] = new Array(8*8); 
  PNG.decode(path, function(pixels) {
    for (var i = 0 ; i < 64 ; i++){
      matrices[name][i] = { 
        r: pixels[i*4]*15/255, 
        g: pixels[i*4+1]*15/255,
        b: pixels[i*4+2]*15/255 
      }
    }
  });
}


var log = function(msg){
  winston.log('info', '[L8] ' + msg);
}

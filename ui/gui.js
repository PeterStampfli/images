/**
 * emulator of  https://github.com/dataarts/dat.gui
 * 
 * @namespace dat
 */

/* jshint esversion:6 */

dat = {};





dat.GUI = function() {};
dat.GUI.prototype.say = function() {
    console.log("hallo");
}


new dat.GUI().say()

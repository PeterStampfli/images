/* jshint esversion: 6 */

/**
* detect if special characters are pressed
* is it simpler to do for the entire window ?
* (one single instance, actions do not depend on the mouse position at the time the key is pressed)
* @namespace keyboard
*/

export const keyboard={};

keyboard.shiftPressed=false;
keyboard.ctrlPressed=false;

document.addEventListener('keydown', function(event){
	if (event.key==='Shift'){
		keyboard.shiftPressed=true;
	} else if (event.key==='Control'){
		keyboard.ctrlPressed=true;
	}
}, false);

document.addEventListener('keyup', function(event){
	if (event.key==='Shift'){
		keyboard.shiftPressed=false;
	} else if (event.key==='Control'){
		keyboard.ctrlPressed=false;
	}
}, false);

/**
* representing an input button and adding actions
*
* @constructor Button
* @param {String} idName name (id) of the button in the HTML page
*/

/*
idName String, name of id in html document
*/
function Button(idName){
	"use strict";
	this.button=document.getElementById(idName);
}


(function(){
	"use strict";

/**
* add a click event listener for a button of type="button" 
*
* @method Button#onClick
* @param {function} action function without parameters, will be called upon a click event
*/
Button.prototype.onClick=function(action){
	this.button.addEventListener('click',action,false);
}

/**
* add a change event listener for a button of type="text"
*
* @method Button#onChange
* @param {function} action function without parameters, will be called upon a change event
*/
Button.prototype.onChange=function(action){
	this.button.addEventListener('change',action,false);
}

/**
* read the integer value of the text of a button of type="text"
* @method Button#getValue
* @returns {integer} value resulting from parsing the button text
*/

//	<input type="text" class="numbers" id="outputWidthChooser" maxlength="4" />

Button.prototype.getValue=function(){
	return parseInt(this.button.value,10);
}

/**
* set the text of a button of type="text" according to a given number
* @method Button#setValue
* @param {number} number the number value to show in the button
*/
Button.prototype.setValue=function(number){
	this.button.value=number.toString();
}
}())
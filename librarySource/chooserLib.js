"use strict";

/*
object to simplify radio-button chooser
*/

/*
<form action="">
				Choose image smoothing:
				<input type="radio" name="smoothing" class='smoothing' checked>none
				<input type="radio" name="smoothing" class='smoothing'>2x2
			</form>
*/

/*
className String, name of class in html document
*/
function Chooser(className) {
    this.index = 0;
    this.buttons = document.getElementsByClassName(className);
}

/*
action function(), what to do at click event
*/
Chooser.prototype.add = function(action) {
    this.buttons[this.index++].addEventListener('click', action, false);
}

/*
set n-th button to checked
*/
Chooser.prototype.setChecked = function(n) {
    this.buttons[n].checked = true;
}

/*
set first button to checked
*/
Chooser.prototype.setCheckedFirst = function() {
    this.buttons[0].checked = true;
}

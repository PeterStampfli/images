/**
 * a single touch with position data of last and current touch
 * @constructor SingleTouch
 * @param {Touch} touch - browser touch object, at touchstart, its target is the element
 */

/* jshint esversion:6 */

function SingleTouch(touch) {
    "use strict";
    this.identifier = touch.identifier;
    this.update(touch);
}




(function() {
    "use strict";

    /**
     * update the position
     * @method SingleTouch#update
     * @param {Touch} touch
     */
    SingleTouch.prototype.update = function(touch) {
        [this.x, this.y] = MouseAndTouch.relativePosition(touch, touch.target);
    };



}());


/**
 * attaches (multi) touch events to a html element
 * organizes the data of the touches, calls single touch and double touch event functions
 * @constructor TouchEvents
 * @param {String} idName - of the HTML element
 */


function TouchEvents(idName) {
    "use strict";
    this.element = document.getElementById(idName);
    // switch events off or on, default is on, switching from outside (eg presentation)
    this.isActive = true;
    // the list of touches relevant to this element
    this.touches = [];

    // for simplicity: here we need only a move action because there are only touch events related to canvases
    this.moveAction = function(touchEvents) {};
    // the data for moves, derived from single and double touches
    // position: for double touch this is the average position
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.dx = 0;
    this.dy = 0;
    // angle: from first to second touch, zero for single touch
    this.lastAngle = 0;
    this.angle = 0;
    this.dAngle = 0;
    // distance between touches, zero for single touch
    this.lastDistance = 0;
    this.distance = 0;
    this.dDistance = 0;

    this.element.addEventListener("touchstart", startHandler, false);
    this.element.addEventListener("touchmove", moveHandler, false);
    this.element.addEventListener("touchend", endHandler, false);
    this.element.addEventListener("touchcancel", cancelHandler, false);

    var touchEvents = this;

    function startHandler(event) {
        MouseAndTouch.preventDefault(event);
        const changedTouches = event.changedTouches;
        const length = changedTouches.length;
        var touch;
        console.log(length);
        for (var i = 0; i < length; i++) {
            console.log(changedTouches[i]);
            touch = changedTouches[i];
            if (touch.target == touchEvents.element) {
                touchEvents.touches.push(new SingleTouch(touch));
                console.log(touchEvents.touches.length);
            }
        }

        console.log("start " + event.changedTouches);
    }


    function moveHandler(event) {
        MouseAndTouch.preventDefault(event);

        console.log("move " + event.changedTouches);
    }


    function endHandler(event) {
        MouseAndTouch.preventDefault(event);

        console.log("end " + event.changedTouches);
    }


    function cancelHandler(event) {
        MouseAndTouch.preventDefault(event);

        console.log("cancel " + event.changedTouches);
    }





}




(function() {
    "use strict";

    /**
     * switch mouse events on or off 
     * @method MouseEvents.setIsActive
     * @param {boolean} on - if false there will be no mouse events
     */
    TouchEvents.prototype.setIsActive = function(on) {
        this.isActive = on;
    };

    /**
     * find index of a touch in the touches list using identifier
     * @method TouchEvents#findIndex
     * @param {Touch} touch - with touch.identifier field
     * @return integer index >=0 if found, -1 if not found
     */

    TouchEvents.prototype.findIndex = function(touch) {
        for (var i = 0; i < this.touches.length; i++) {
            if (touch.identifier == this.touches[i].identifier) {
                return i;
            }
        }
        return -1;
    };

}());

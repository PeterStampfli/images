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

    // for debugging and whatever we might need start, cancel and end action
    this.startAction = function(touchEvents) {};
    this.endAction = function(touchEvents) {};
    this.cancelAction = function(touchEvents) {};

    // for simplicity: here we need only a move action because there are only touch events related to canvases
    this.moveAction = function(touchEvents) {};
    // the data for moves, derived from single and double touches
    // position: for double touch this is the average position
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.centerX = 0;
    this.centerY = 0;
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
    // adding the events, element.ontouchstart etc. does not do
    this.element.addEventListener("touchstart", startHandler, false);
    this.element.addEventListener("touchmove", moveHandler, false);
    this.element.addEventListener("touchend", endHandler, false);
    this.element.addEventListener("touchcancel", cancelHandler, false);
    console.log("eventhandlers");

    var touchEvents = this;


    /**
     * check if a single touch is inside a shape 
     * such as a complicated shape inside the canvases
     * add touch to list only if inside the shape
     * default: shape is same as the html-element
     * @method TouchEvents#isInsideShape
     * @param {SingleTouch} singleTouch
     * @return true if inside
     */
    this.isInsideShape = function(singleTouch) {
        return true;
    };

    // attention: browser reuses identifiers of touches that ended or cancelled
    // if there is only one touch, as in touch emulation, its identifier==0 always

    // start: add new touches to list, update touchEvents data, no action (waiting for touchMove)
    // add new touch only if its target is the element and it is inside the shape
    function startHandler(event) {
        console.log("start");
        MouseAndTouch.preventDefault(event);
        const changedTouches = event.changedTouches;
        const length = changedTouches.length;
        var touch;
        for (var i = 0; i < length; i++) {
            touch = changedTouches[i];
            if (touch.target == touchEvents.element) {
                const singleTouch = new SingleTouch(touch);
                if (touchEvents.isInsideShape(singleTouch)) {
                    touchEvents.touches.push(singleTouch);
                }
            }
        }
        // double touch simulation: new touch added in position 1 with position data
        // for both touches
        if (TouchEvents.doubleTouchDebug && (touchEvents.touches.length == 2)) {
            touchEvents.touches[0].x = touchEvents.touches[1].x;
            touchEvents.touches[0].y = touchEvents.touches[1].y;
        }
        touchEvents.update();
        touchEvents.setLast();
        touchEvents.getDifferences();
        touchEvents.startAction(touchEvents);
    }

    // move: touches with target==element: update touch, update touchEvents data
    // for double touch debug: delete touches if touch moves outside
    function moveHandler(event) {
        MouseAndTouch.preventDefault(event);
        const changedTouches = event.changedTouches;
        const length = changedTouches.length;
        var touch, index;
        for (var i = 0; i < length; i++) {
            touch = changedTouches[i];
            if (touch.target == touchEvents.element) {
                index = touchEvents.findIndex(touch);
                if (index >= 0) {
                    touchEvents.touches[index].update(touch);
                }
            }
        }
        if (TouchEvents.doubleTouchDebug && (touchEvents.touches.length > 0) && !touchEvents.isInside(touchEvents.touches[0])) {
            touchEvents.touches.length = 0;
            touchEvents.update();
            touchEvents.setLast();
            touchEvents.getDifferences();
            touchEvents.endAction(touchEvents);
        } else {
            touchEvents.setLast();
            touchEvents.update();
            touchEvents.getDifferences();
            touchEvents.moveAction(touchEvents);
        }
    }

    // delete touches
    function deleteTouches(event) {
        const changedTouches = event.changedTouches;
        const length = changedTouches.length;
        var touch, index;
        for (var i = 0; i < length; i++) {
            touch = changedTouches[i];
            if (touch.target == touchEvents.element) {
                index = touchEvents.findIndex(touch);
                if (index >= 0) {
                    touchEvents.touches.splice(index, 1);
                }
            }
        }
    }

    // touch end: delete touch if not double touch debugging or if there are more than one touch
    function endHandler(event) {
        MouseAndTouch.preventDefault(event);
        if (!TouchEvents.doubleTouchDebug || (touchEvents.touches.length > 1)) {
            deleteTouches(event);
        }
        touchEvents.update();
        touchEvents.setLast();
        touchEvents.getDifferences();
        touchEvents.endAction(touchEvents);
    }

    function cancelHandler(event) {
        if (!TouchEvents.doubleTouchDebug || (touchEvents.touches.length > 1)) {
            deleteTouches(event);
        }
        touchEvents.update();
        touchEvents.setLast();
        touchEvents.getDifferences();
    }
}

(function() {
    "use strict";

    // debugging double touch with the browser
    // a first touch gives a single touch , 
    //a second touch gives two touches at the same position, 
    //further touch moves move the first touch
    // double touch ends when moving out of the element
    TouchEvents.doubleTouchDebug = false;

    // logging data
    TouchEvents.log = false;

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

    /**
     * setting the last data equal to the new data
     * @method TouchEvents#setLast
     */
    TouchEvents.prototype.setLast = function() {
        this.lastX = this.x;
        this.lastY = this.y;
        this.lastAngle = this.angle;
        this.lastDistance = this.distance;
    };

    /**
     * setup of data for use in move action, for single and double touch
     * uses the touches array data
     * @method TouchEvents#update
     */
    TouchEvents.prototype.update = function() {
        var touches = this.touches;
        if (touches.length === 1) { // only the position changes
            this.x = this.touches[0].x;
            this.y = this.touches[0].y;
            this.angle = 0;
            this.distance = 1;
        } else if (touches.length >= 2) {
            this.x = (this.touches[0].x + this.touches[1].x) * 0.5;
            this.y = (this.touches[0].y + this.touches[1].y) * 0.5;
            var deltaX = this.touches[0].x - this.touches[1].x;
            var deltaY = this.touches[0].y - this.touches[1].y;
            this.distance = Math.hypot(deltaY, deltaX);
            this.angle = Fast.atan2(deltaY, deltaX);
        }
    };

    /**
     * get differences between last and new data
     * @method TouchEvents#getDifferences
     */

    TouchEvents.prototype.getDifferences = function() {
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.centerX = (this.x + this.lastX) * 0.5;
        this.centerY = (this.y + this.lastY) * 0.5;
        this.dAngle = this.angle - this.lastAngle;
        this.dDistance = this.distance - this.lastDistance;
    };


    /**
     * test if a single touch is inside the element
     * @method TouchEvents#isInside
     * @param {SingleTouch} singleTouch
     * @return boolean, true if touch is inside the element
     */
    TouchEvents.prototype.isInside = function(singleTouch) {
        return (singleTouch.x >= 0) && (singleTouch.x < this.element.width) && (singleTouch.y >= 0) && (singleTouch.y <= this.element.height);
    };
}());
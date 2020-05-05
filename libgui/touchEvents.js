/* jshint esversion: 6 */

/**
 * a single touch with position data of last and current touch
 * @constructor SingleTouch
 * @param {Touch} touch - browser touch object, at touchstart, its target is the element
 */

import {
    MouseAndTouch,
    Button
} from "./modules.js";

function SingleTouch(touch) {
    this.identifier = touch.identifier;
    this.update(touch);
}

/**
 * update the position
 * @method SingleTouch#update
 * @param {Touch} touch
 */
SingleTouch.prototype.update = function(touch) {
    [this.x, this.y] = MouseAndTouch.relativePosition(touch, touch.target);
};

/**
 * attaches (multi) touch events to a html element
 * organizes the data of the touches, calls single touch and double touch event functions
 * @constructor TouchEvents
 * @param {domElement} element - an HTML element
 */
export function TouchEvents(element) {
    this.element = element;
    // switch events off or on, default is on, switching from outside (eg presentation)
    this.active = true;

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

    var touchEvents = this;
    // attention: browser reuses identifiers of touches that ended or cancelled
    // if there is only one touch, as in touch emulation, its identifier==0 always

    // start: add new touches to list, update touchEvents data, no action (waiting for touchMove)
    // add new touch only if its target is the element and it is inside the shape

    // if there is a touch outside the shape, the client has to handle this
    function startHandler(event) {
        MouseAndTouch.preventDefault(event);
        if (touchEvents.active) {
            const changedTouches = event.changedTouches;
            const length = changedTouches.length;
            var touch;
            for (var i = 0; i < length; i++) {
                touch = changedTouches[i];
                if (touch.target == touchEvents.element) {
                    const singleTouch = new SingleTouch(touch);
                    touchEvents.touches.push(singleTouch);
                }
            }
            // double touch simulation: new touch added in position 1 
            if (TouchEvents.doubleTouchDebug && (touchEvents.touches.length == 2)) {
                // touchEvents.touches[0].x = touchEvents.touches[1].x;
                //  touchEvents.touches[0].y = touchEvents.touches[1].y;
            }
            touchEvents.update();
            touchEvents.setLast();
            touchEvents.getDifferences();
            touchEvents.startAction(touchEvents);
        }
    }

    // move: touches with target==element: update touch, update touchEvents data
    function moveHandler(event) {
        MouseAndTouch.preventDefault(event);
        if (touchEvents.active) {
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
            // for double touch debug: delete touches if touch moves outside
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
    }

    // delete touches that ended
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
        if (touchEvents.active) {
            if (!TouchEvents.doubleTouchDebug || (touchEvents.touches.length > 1)) {
                deleteTouches(event);
            }
            touchEvents.update();
            touchEvents.setLast();
            touchEvents.getDifferences();
            touchEvents.endAction(touchEvents);
        }
    }

    function cancelHandler(event) {
        MouseAndTouch.preventDefault(event);
        if (touchEvents.active) {
            if (!TouchEvents.doubleTouchDebug || (touchEvents.touches.length > 1)) {
                deleteTouches(event);
            }
            touchEvents.update();
            touchEvents.setLast();
            touchEvents.getDifferences();
        }
    }

    /**
     * destroy the touch events element, taking care of all references
     * maybe too careful
     * @method TouchEvents#destroy
     */
    this.destroy = function() {
        this.element.removeEventListener("touchstart", startHandler, false);
        this.element.removeEventListener("touchmove", moveHandler, false);
        this.element.removeEventListener("touchend", endHandler, false);
        this.element.removeEventListener("touchcancel", cancelHandler, false);
        this.startAction = null;
        this.endAction = null;
        this.cancelAction = null;
        this.moveAction = null;
    };

}

// debugging double touch with the browser
// a first touch gives a single touch , 
//a second touch gives two touches at the same position, 
//further touch moves move the first touch
// double touch ends when moving out of the element
TouchEvents.doubleTouchDebug = false;

// logging data
TouchEvents.log = false;

/**
 * switch touch events on or off 
 * @method TouchEvents.setIsActive
 * @param {boolean} on - if false there will be no mouse events
 */
TouchEvents.prototype.setIsActive = function(on) {
    this.active = on;
};

/**
 * delete all touches
 * @method TouchEvents#deleteAllTouches
 */
TouchEvents.prototype.deleteAllTouches = function() {
    this.touches.length = 0;
};

/**
 * find index of a touch in the touches list using identifier
 * counting down for tests with same ids
 * @method TouchEvents#findIndex
 * @param {Touch} touch - with touch.identifier field
 * @return integer index >=0 if found, -1 if not found
 */
TouchEvents.prototype.findIndex = function(touch) {
    for (var i = this.touches.length - 1; i >= 0; i--) {
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
        this.angle = Math.atan2(deltaY, deltaX);
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
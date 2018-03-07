/**
 * attaches mouse events to a html element and organizes basic mouse data
 * @constructor MouseEvents
 * @param {String} idName - of the HTML element
 */

/* jshint esversion:6 */

function MouseEvents(idName) {
    this.element = document.getElementById(idName);
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.dx = 0;
    this.dy = 0;
    this.pressed = false;
    this.wheelDelta = 0;
}


(function() {
    "use strict";

    // override default mouse actions, especially important for the mouse wheel
    // listeners for useCapture, acting in bottom down capturing phase
    //  they should return false to stop event propagation ...
    function stopEventPropagationAndDefaultAction(event) {
        event.stopPropagation();
        event.preventDefault();
    }

    /**
     * read the mouse position relative to element, calculate changes, update data
     * @method MouseEvents#update
     * @param {Event} event - object, containing event data
     */
    MouseEvents.prototype.update = function(event) {
        this.lastX = this.x;
        this.lastY = this.y;
        this.x = event.pageX - this.element.offsetLeft;
        this.y = event.pageY - this.element.offsetTop;
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.wheelDelta = event.deltaY;
        console.log(this);
    };

    /**
     * Add an event with given eventName and action callback.
     * @method MouseEvents#addAction
     * @param {String} eventName - name for the event
     * @param {function} action - callback action(mouseEvents) for doing something
     */
    MouseEvents.prototype.addAction = function(eventName, action) {
        var mouseEvents = this; // hook to this mouseEvents object
        this.element.addEventListener(eventName, function(event) {
            stopEventPropagationAndDefaultAction(event);
            mouseEvents.update(event);
            action(mouseEvents);
            return false;
        }, true);
    };

    // do nothing function as default
    var doNothing = function(mouseEvents) {};

    /**
     * add action for a mouse down event, sets pressed to true
     * @method MouseEvents#addDownAction
     * @param {function} action - callback action(mouseEvents) for doing something
     */
    MouseEvents.prototype.addDownAction = function(action = doNothing) {
        this.addAction("mousedown", function(mouseEvents) {
            mouseEvents.pressed = true;
            action(mouseEvents);
        });
    };

    /**
     * add action for a mouse up event, only does something if pressed==true, sets pressed to false
     * @method MouseEvents#addUpAction
     * @param {function} action - callback for doing something, default: does nothing
     */
    MouseEvents.prototype.addUpAction = function(action = doNothing) {
        this.addAction("mouseup", function(mouseEvents) {
            if (mouseEvents.pressed) {
                mouseEvents.pressed = false;
                action(mouseEvents);
            }
        });
    };

    /**
     * add action for a mouse move event, only does something if pressed==true
     * @method MouseEvents#addMoveAction
     * @param {function} action - callback action(mouseEvents) for doing something
     */
    MouseEvents.prototype.addMoveAction = function(action = doNothing) {
        var mouseEvents = this; // hook to this mouseEvents object
        this.addAction("mousemove", function(mouseEvents) {
            if (mouseEvents.pressed) {
                action(mouseEvents);
            }
        });
    };

    /**
     * add action for a mouse out event,  only does something if pressed==true, sets pressed to false, similar to mouse up
     * @method MouseEvents#addOutAction
     * @param {function} action - callback action(mouseEvents) for doing something
     */
    MouseEvents.prototype.addOutAction = function(action = doNothing) {
        this.addAction("mouseout", function(mouseEvents) {
            if (mouseEvents.pressed) {
                mouseEvents.pressed = false;
                action(mouseEvents);
            }
        });
    };

    /*
     * add action for a mouse wheel event, with both versions for chrome and firefox, independent of pressed
     * @method MouseEvents#addWheelAction
     * @param {function} action - callback action(mouseEvents) for doing something
     */
    MouseEvents.prototype.addWheelAction = function(action) {
        this.addAction("mousewheel", action); // chrome, opera
        this.addAction("wheel", action); // firefox
    };

}());

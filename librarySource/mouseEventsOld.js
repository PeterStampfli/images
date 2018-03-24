/**
 * attaches mouse events to a html element and organizes basic mouse data
 * @constructor MouseEvents
 * @param {String} idName - of the HTML element
 */

/* jshint esversion:6 */

function MouseEvents(idName) {
    this.element = document.getElementById(idName);
    // the event data
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.dx = 0;
    this.dy = 0;
    this.pressed = false;
    this.wheelDelta = 0;
    // event action - strategy pattern

    // do nothing function as default
    var doNothing = function(mouseEvents) {};

    this.downAction = doNothing;
    this.moveAction = doNothing;
    this.upAction = doNothing;
    this.outAction = doNothing;
    this.wheelAction = doNothing;

    this.addAction("mousedown", function(mouseEvents) {
        mouseEvents.pressed = true;
        mouseEvents.downAction(mouseEvents);
    });

    this.addAction("mouseup", function(mouseEvents) {
        if (mouseEvents.pressed) {
            mouseEvents.pressed = false;
            mouseEvents.upAction(mouseEvents);
        }
    });

    this.addAction("mouseout", function(mouseEvents) {
        if (mouseEvents.pressed) {
            mouseEvents.pressed = false;
            mouseEvents.outAction(mouseEvents);
        }
    });

    this.addAction("mousemove", function(mouseEvents) {
        if (mouseEvents.pressed) {
            mouseEvents.moveAction(mouseEvents);
        }
    });

    this.addAction("mousewheel", function(mouseEvents) { // chrome, opera
        mouseEvents.wheelAction(mouseEvents);
    });
    this.addAction("wheel", function(mouseEvents) { // firefox
        mouseEvents.wheelAction(mouseEvents);
    });
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

}());

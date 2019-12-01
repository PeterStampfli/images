// scroll events and throtliong


let last_known_scroll_position = 0;
let ticking = false;

function doSomething(scroll_pos) {
  // Do something with the scroll position
}

window.addEventListener('scroll', function(e) {
  last_known_scroll_position = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(function() {
      doSomething(last_known_scroll_position);
      ticking = false;
    });

    ticking = true;
  }
});

/*
The window.requestAnimationFrame() method tells the browser that you wish 
to perform an animation and requests that the browser calls a specified 
function to update an animation before the next repaint. 
The method takes a callback as an argument to be invoked before the repaint.
*/

// do scroll events fire faster than the animation frames (60/sec?)
// test with a catcher to get fraction of events
// other events?
// resize?


// Test if an image is positioned inside the initial viewport
function isAboveTheFold(img) {
    var elemOffset = function(elem) {
        var offset = elem.offsetTop;
        while (elem = elem.offsetParent) {
            offset += elem.offsetTop;
        }
        return offset;
    };
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    var imgOffset = elemOffset(img);
    return ((imgOffset >= 0) && (imgOffset <= viewportHeight));
}
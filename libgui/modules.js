/* jshint esversion: 6 */

// aggregator
// import all from a common source
//===================================================

// NOTE: put dependencies in correct order
// what has to bb done loaded first has to be first

// seems that at first import of something here, all files are loaded in sequence

// so with modules that "export" global objects with
// window.something=something
// then this something does not needed to be loaded anywhere
// it is everythere present (after importing from this)
// has it to be the lowest export of all of them here?

// better not rely on this

// do not create globals without good cause

export {
    MouseAndTouch,
    MouseEvents
}
from "./mouseEvents.js";

export {
    keyboard
}
from "./keyboard.js";

export {
    TouchEvents
}
from "./touchEvents.js";

export {
    Logger,
    log
}
from "./logger.js";

export {
    Button
}
from "./button.js";

export {
    guiUtils
}
from "./guiUtils.js";

export {
    ImageButton
}
from "./imageButton.js";

export {
    TextAreaInOut
}
from './textAreaInOut.js';

export {
    Popup
}
from "./popup.js";

export {
    InstantHelp
}
from "./instantHelp.js";

export {
    BooleanButton
}
from "./booleanButton.js";

export {
    TextInput
}
from "./textInput.js";

export {
    RealNumber
}
from "./realNumber.js";

export {
    Select
}
from "./select.js";

export {
    SelectValues
}
from "./selectValues.js";

export {
    ColorInput
}
from "./colorInput.js";

export {
    ImageSelect
}
from "./imageSelect.js";

export {
    Pixels
}
from "./pixels.js";

export {
    output
}
from "./output.js";

export {
    CoordinateTransform
}
from "./coordinateTransform.js";

export {
    map
}
from "./map.js";

export {
    animation
}
from "./animation.js";

export {
    ParamController
}
from "./paramController.js";

export {
    ParamGui
}
from "./paramGui.js";

export {
    pixelPaint
}
from "./pixelPaint.js";

export {
    SVG
}
from "./svg.js";
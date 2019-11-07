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
    TouchEvents
}
from "./touchEvents.js";

export {
    Button
}
from "./button.js";

export {
    myAlert
}
from "./myAlert.js";

export {
    BooleanButton
}
from "./booleanButton.js";

export {
    TextInput
}
from "./textInput.js";

export {
    NumberButton
}
from "./numberButton.js";

export {
    SelectValues
}
from "./selectValues.js";

export {
    Range
}
from "./range.js";

export {
    AngleScale
}
from "./angleScale.js";


export {
    paramControllerMethods
}
from "./paramControllerMethods.js";

export {
    ColorInput
}
from "./colorInput.js";

export {
    ParamColor
}
from "./paramColor.js";

export {
    ParamAngle
}
from "./paramAngle.js";


export {
    ParamController
}
from "./paramController.js";

export {
    ParamGui
}
from "./paramGui.js";

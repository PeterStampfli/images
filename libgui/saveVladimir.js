/*
Each time you call createObjectURL(), a new object URL is created, 
even if you've already created one for the same object. Each of these 
must be released by calling URL.revokeObjectURL() when you no longer need them.

Browsers will release object URLs automatically when the document is unloaded; 
however, for optimal performance and memory usage, if there are safe times
when you can explicitly unload them, you should do so.
*/



/**
  save paramet
*/
export function writeToJSON(object, fileName) {

    function save(content, fileName, contentType) {

        var a = document.createElement("a");
        var file = new Blob([content], {
            type: contentType
        });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();

    };

    console.log('writeToJSON(', fileName, ')');
    var jsdata = JSON.stringify(object, null, 2);
    save(jsdata, fileName, 'text/plain');
    console.log('writeToJSON() done');

} // writeToJSON(object, fileName)

export function saveBlobAsFile(blob, fileName) {

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

}

export function writeCanvasToFile(canvas, fileName, type) {
    if (!isDefined(type))
        type = 'image/png';
    //console.log('writeCanvasToFile_v1()', fileName);

    canvas.toBlob(function(blob) {
        saveBlobAsFile(blob, fileName);
    }, type);
    //console.log('writeCanvasToFile_v1() done');
}


export function writeCanvasToFile_v1(canvas, fileName) {

    function save(url, fileName) {

        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };


    console.log('writeCanvasToFile(', fileName, ')');
    var imageData = canvas.toDataURL();
    save(imageData, fileName);
    console.log('writeCanvasToFile() done');

}

export function writeCanvasToFile_orig(canvas, fileName) {

    const save = (function() {
        const a = document.createElement("a");
        document.body.appendChild(a);
        //a.style.display = "none";
        return function saveData(url, fileName) {
            a.href = url;
            a.download = fileName;
            a.click();
            a.remove();
        };
    }());

    console.log('writeCanvasToFile(', fileName, ')');
    var imageData = canvas.toDataURL();
    save(imageData, fileName);
    console.log('writeCanvasToFile() done');

}
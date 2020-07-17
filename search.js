/* jshint esversion: 6 */

const fromText = document.querySelector('#from-text');
fromText.value = 'realdonaldtrump';
fromText.onchange = updateHttpText;
const clearFromButton = document.querySelector('#clearFrom-button');
clearFromButton.onclick = function() {
    fromText.value = 'realdonaldtrump';
    updateHttpText();
};
const sinceText = document.querySelector('#since-text');
sinceText.value = '2019-01-20';
sinceText.onchange = updateHttpText;
const clearSinceButton = document.querySelector('#clearSince-button');
clearSinceButton.onclick = function() {
    sinceText.value = '';
    updateHttpText();
};
const untilText = document.querySelector('#until-text');
untilText.value = '2020-06-14';
untilText.onchange = updateHttpText;
const clearUntilButton = document.querySelector('#clearUntil-button');
clearUntilButton.onclick = function() {
    untilText.value = '';
    updateHttpText();
};
const aboutText = document.querySelector('#about-text');
aboutText.style.width = '600px';
aboutText.value = 'enemy people';
aboutText.onchange = updateHttpText;
const clearAboutButton = document.querySelector('#clearAbout-button');
clearAboutButton.onclick = function() {
    aboutText.value = '';
    updateHttpText();
};

const httpText = document.querySelector('#http-text');

const openButton = document.querySelector('#open-button');

const aElement = document.createElement("a");
aElement.style.display = "none";
document.body.appendChild(aElement);
aElement.target = "_blank";
aElement.rel = "noreferrer noopener";

openButton.onclick = function() {
    aElement.href = httpText.value;
    aElement.click();
};

function updateHttpText() {
    httpText.value = 'https://twitter.com/search?q=';
    if (aboutText.value !== '') {
        httpText.value += '(' + aboutText.value + ')';
    }
    if (fromText.value !== '') {
        httpText.value += '(from:' + fromText.value + ')';
    }
    if (sinceText.value!==''){
        httpText.value+='(since:'+sinceText.value+')';
    }
        if (untilText.value!==''){
        httpText.value+='(until:'+untilText.value+')';
    }
    httpText.value += '-filter:replies&src=typed_query&f=live';
}

updateHttpText();
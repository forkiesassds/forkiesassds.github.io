dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

function loadImageToArray(image) {
    var width = image.width;
    var height = image.height;

    //set up canvas to copy data to
    var tCanvas = document.createElement("canvas");
    tCanvas.width = width;
    tCanvas.height = height;

    //copy image data to canvas
    var tCtx = tCanvas.getContext("2d");
    tCtx.drawImage(image, 0, 0);

    //get the array of the image data
    var array = tCtx.getImageData(0, 0, width, height).data;

    //dispose of the canvas and return the array.
    tCanvas.remove();
    return array;
}

//get timezone
var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const selectElement = document.getElementById("timezone");

selectElement.addEventListener("change", (event) => {
    timezone = event.target.value;
});

Intl.supportedValuesOf('timeZone').forEach((tz) => {
    let opt = document.createElement("option");
    opt.textContent = tz;

    if (tz == timezone) {
        opt.selected = true;
    }

    selectElement.appendChild(opt);
});

const scaleX = 20;
const scaleY = 20;

const canvas = document.getElementById("clock");
const cAttrs = canvas.attributes;
const ctx = canvas.getContext("2d");

//set width and height to scale value.
const width = cAttrs.getNamedItem("width");
const height = cAttrs.getNamedItem("height");

width.value *= scaleX;
height.value *= scaleY;

//set the scale of the canvas.
ctx.scale(scaleX, scaleY);

//init dial and clock textures
const dial = loadImageToArray(document.getElementById("dial"));
const clock = loadImageToArray(document.getElementById("clockTex"));

//get seconds since midnight, influenced by current set timezone
function getSeconds() {
    const t = dayjs(Date.now());
    const tz = t.tz(timezone);
    return tz.second() + (tz.minute() + tz.hour() * 60) * 60;
}

function getClockTime(delta) {
    //converts irl seconds to minecraft seconds and adds /time set night to offset it
    const tick = (((getSeconds() * 0.278) + 18000) % 24000);
    var rot = (tick + delta) / 24000 - 0.25;
    if (rot < 0.0) {
        rot++;
    }

    if (rot > 1.0) {
        rot--;
    }

    const peak = 1.0 - ((Math.cos(rot * Math.PI) + 1.0) / 2);
    return rot + (peak - rot) / 3;
}


var rot = 0;
var rota = 0;

//ported from beta 1.2 may 17th 2011 build
function tickClock() {
    const time = getClockTime(1);
    const rott = -time * Math.PI * 2.0;

    var rotd = rott - rot;

    while (rotd < -Math.PI) {
        rotd += Math.PI * 2;
    }

    while (rotd >= Math.PI) {
        rotd -= Math.PI * 2;
    }

    if (rotd < -1.0) {
        rotd = -1.0;
    }

    if (rotd > 1.0) {
        rotd = 1.0;
    }

    rota += rotd * 0.1;
    rota *= 0.8;
    rot = rot + rota;
    const sin = Math.sin(rot);
    const cos = Math.cos(rot);

    for (x = 0; x < 16; x++)
    for (y = 0; y < 16; y++) {
        const i = x + y * 16;

        var r = clock[i * 4 + 0];
        var g = clock[i * 4 + 1];
        var b = clock[i * 4 + 2];
        var a = clock[i * 4 + 3];
        if (r == b && g == 0 && b > 0) {
            const xo = -(x / 15.0 - 0.5);
            const yo = y / 15.0 - 0.5;
            const br = r;
            const xx = ((xo * cos + yo * sin + 0.5) * 16.0);
            const yy = ((yo * cos - xo * sin + 0.5) * 16.0);
            const j = (xx & 15) + (yy & 15) * 16;
            r = (dial[j * 4 + 0]) * r / 255;
            g = (dial[j * 4 + 1]) * br / 255;
            b = (dial[j * 4 + 2]) * br / 255;
            a = dial[j * 4 + 3];
        }

        //ugly hack that i hate because i want it to scale based on the one that is set
        //for the canvas to use so it isn't so tiny.
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

function debug() {
    const tick = getSeconds();
    const date = new Date(0);
    date.setSeconds(tick);
    const timeString = date.toISOString().substring(11, 19);
    document.getElementById("debug").innerText = "tick: " + tick + " real time: " + timeString;
}

window.onload = (event) => {
    setInterval(() => {
        // debug();
        tickClock();
    }, 50);
}

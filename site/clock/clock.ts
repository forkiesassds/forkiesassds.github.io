import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// slightly janky ts bc I can't be bothered to try to fix this whole thing atm -Dexrn

// constants (there are 2)
const scaleX = 20;
const scaleY = 20;

dayjs.extend(utc);
dayjs.extend(timezone);

const awaitImage = async (path: string, id: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.id = id;
      img.src = path;
      img.style.display = "none";
      img.onload = () => {
        resolve(img)
      }
      img.onerror = e => {
        throw new Error(e.toString());
      }
    })
}

// create root element (they hate HTML)
const rootElement = document.createElement("div");

const dialImage = await awaitImage("/assets/clock/dial.png", "dial");
const clockImage = await awaitImage("/assets/clock/clock.png", "clockTex");

document.body.appendChild(rootElement);
rootElement.appendChild(dialImage);
rootElement.appendChild(clockImage);

async function loadImageToArray(element) {
    const width = element.width;
    const height = element.height;

    //set up canvas to copy data to
    let tCanvas = document.createElement("canvas");
    tCanvas.width = width;
    tCanvas.height = height;

    //copy image data to canvas
    const tCtx = tCanvas.getContext("2d");

    if (tCtx == null)
        throw new Error("tCanvas context is null");

    tCtx.drawImage(element, 0, 0);

    //get the array of the image data
    const array = tCtx.getImageData(0, 0, width, height).data;

    //dispose of the canvas and return the array.
    tCanvas.remove();
    return array;
}

//get timezone
let timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const selectElement: HTMLSelectElement = document.getElementById("tzSelect") as HTMLSelectElement;
if (selectElement == undefined)
    throw new Error("tzSelect is missing");

selectElement.addEventListener("change", (event) => {
    timeZone = (event.target as HTMLSelectElement).value;
});

Intl.supportedValuesOf('timeZone').forEach((tz) => {
    let opt = document.createElement("option");
    opt.textContent = tz;

    if (tz == timeZone) {
        opt.selected = true;
    }

    selectElement.appendChild(opt);
});

const canvas: HTMLCanvasElement = document.getElementById("clockCanvas") as HTMLCanvasElement;
if (canvas == undefined)
    throw new Error("clockCanvas is missing");

const cAttrs = canvas.attributes;
const ctx = canvas.getContext("2d");
if (ctx == null)
    throw new Error("canvas context is null");

//set width and height to scale value.
const width = cAttrs.getNamedItem("width");
const height = cAttrs.getNamedItem("height");
if (width == null || height == null)
    throw new Error("width/height is null");

// janky operations with String and Number
width.value = (parseInt(width.value) * scaleX).toString();
height.value = (parseInt(height.value) * scaleY).toString();

//set the scale of the canvas.
ctx.scale(scaleX, scaleY);

//init dial and clock textures
const dial = await loadImageToArray(dialImage);
const clock = await loadImageToArray(clockImage);

//get seconds since midnight, influenced by current set timezone
function getSeconds() {
    const t = dayjs(Date.now());
    const tz = t.tz(timeZone);
    return tz.second() + (tz.minute() + tz.hour() * 60) * 60;
}

function getClockTime(delta) {
    //converts irl seconds to minecraft seconds and adds /time set night to offset it
    const tick = (((getSeconds() * 0.278) + 18000) % 24000);
    let rot = (tick + delta) / 24000 - 0.25;
    if (rot < 0.0) {
        rot++;
    }

    if (rot > 1.0) {
        rot--;
    }

    const peak = 1.0 - ((Math.cos(rot * Math.PI) + 1.0) / 2);
    return rot + (peak - rot) / 3;
}

let rot = 0;
let rota = 0;

//ported from beta 1.2 may 17th 2011 build
function tickClock() {
    if (ctx == null)
        throw new Error("canvas context is null");

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const time = getClockTime(1);
    const rott = -time * Math.PI * 2.0;

    let rotd = rott - rot;

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

    for (let x = 0; x < 16; x++)
    for (let y = 0; y < 16; y++) {
        const i = x + y * 16;

        let r = clock[i * 4 + 0];
        let g = clock[i * 4 + 1];
        let b = clock[i * 4 + 2];
        let a = clock[i * 4 + 3];
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

function tick() {
    // debug();
    tickClock();
}

setInterval(tick, 50);

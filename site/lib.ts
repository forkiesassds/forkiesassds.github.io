export const awaitImage = async (path: string, id: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.id = id;
        img.src = path;
        img.style.display = "none";
        img.onload = () => {
            resolve(img);
        }
        img.onerror = e => {
            throw new Error(e.toString());
        }
    })
}

export async function loadImageToArray(element) {
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

export function scaleElement(element, xS, yS) {
    //get attributes
    const attrs = element.attributes;

    //set width and height to scale value.
    const width = attrs.getNamedItem("width");
    const height = attrs.getNamedItem("height");
    if (width == null || height == null)
        throw new Error("width/height is null");

    // janky operations with String and Number
    width.value = (parseInt(width.value) * xS).toString();
    height.value = (parseInt(height.value) * yS).toString();
}

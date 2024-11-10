import UPNG from 'upng-js';

export async function loadImageToArray(path: string): Promise<Uint8ClampedArray> {
    return new Promise(resolve => {
        fetch(path)
            .then(response => response.arrayBuffer())
            .then(buffer => {
                const pngImg = UPNG.decode(buffer)
                const rgbaArr = new Uint8ClampedArray(UPNG.toRGBA8(pngImg)[0])

                resolve(rgbaArr);
            });
    })
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

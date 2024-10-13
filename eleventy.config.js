import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import { resolve } from "node:path";

export default function (eleventyConfig) {
    eleventyConfig.setInputDirectory("site");
    eleventyConfig.addPassthroughCopy("site/**/*.ts");
    eleventyConfig.addPassthroughCopy("public/**/*.*");

    eleventyConfig.addPlugin(EleventyVitePlugin, {
        viteOptions: {
            build: {
                target: "esnext",
            },
        },
    });
}

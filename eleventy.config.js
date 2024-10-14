import EleventyVitePlugin from "@11ty/eleventy-plugin-vite";
import eleventySass from "eleventy-sass";
import pugPlugin from "@11ty/eleventy-plugin-pug";
import purgeCssPlugin from "eleventy-plugin-purgecss";
import tinyHTML from "@sardine/eleventy-plugin-tinyhtml";
import { resolve } from "node:path";

export default function (eleventyConfig) {
    eleventyConfig.setServerOptions({
        showAllHosts: true
    });

    eleventyConfig.setInputDirectory("site");
    eleventyConfig.addPassthroughCopy("site/**/*.ts");
    eleventyConfig.addPassthroughCopy("public/**/*.*");

    eleventyConfig.addPlugin(pugPlugin);
    eleventyConfig.addPlugin(EleventyVitePlugin, {
        viteOptions: {
            build: {
                target: "esnext",
            },
        },
    });

    eleventyConfig.addPlugin(eleventySass);
    eleventyConfig.addPlugin(purgeCssPlugin, {
        quiet: false,
    });
    eleventyConfig.addPlugin(tinyHTML);
}

const { DateTime } = require("luxon");
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const lightningCSS = require("@11tyrocks/eleventy-plugin-lightningcss");
const CleanCSS = require("clean-css");
const eleventyGoogleFonts = require("eleventy-google-fonts");
const Image = require("@11ty/eleventy-img");
const path = require("path");

module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(eleventyGoogleFonts);
    eleventyConfig.addPlugin(lightningCSS);
    eleventyConfig.addPassthroughCopy('./src/css/style.css');
    eleventyConfig.addPassthroughCopy('./src/_includes/css/');
    eleventyConfig.addPassthroughCopy('./src/assets');
    eleventyConfig.addPassthroughCopy('./src/admin');

    eleventyConfig.addWatchTarget('src/css')
    
    // inline-css
    eleventyConfig.addFilter("cssmin", function(code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Plugins
    eleventyConfig.addPlugin(rssPlugin);

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    // Images
    eleventyConfig.addNunjucksAsyncShortcode("optimizeImage", async function(imagePath, altText) {
        if (!altText) {
            throw new Error(`Missing alt text for image: ${imagePath}`);
        }

        // Adjust the path to be relative to the Eleventy input directory
        let fullImagePath = path.join(__dirname, 'src', imagePath);

        let metadata = await Image(fullImagePath, {
            widths: [400, 600, 900, 1400],
            formats: ["webp", "avif"],
            outputDir: "./public/assets/", // Adjusted output directory
            urlPath: "/assets/"
        });

        let imageAttributes = {
            alt: altText,
            sizes: "(min-width: 1024px) 100vw, 50vw",
            loading: "lazy",
            decoding: "async",
        };

        return Image.generateHTML(metadata, imageAttributes);
    });


    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
};

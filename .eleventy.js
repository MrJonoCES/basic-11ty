const { DateTime } = require("luxon");
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const lightningCSS = require("@11tyrocks/eleventy-plugin-lightningcss");
const CleanCSS = require("clean-css");
const eleventyGoogleFonts = require("eleventy-google-fonts");
const pluginImage = require('@11ty/eleventy-img');
const path = require('path');

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

    // Custom image processing transform
    eleventyConfig.addTransform('optimizeImages', async (content, outputPath) => {
        if (outputPath.endsWith('.html')) {
            // Check if the content is HTML before attempting to process it as an image
            if (content.includes('<html')) {
                return content;
            }
            
            const images = await pluginImage(content, {
                /* Eleventy Image options */
            });

            // Iterate over each image in the content
            images.forEach((image) => {
                // Calculate the output path relative to the output directory
                const outputImagePath = path.relative('./src', image.outputPath);

                // Copy the optimized image to the output directory
                eleventyConfig.addPassthroughCopy({
                    [image.outputPath]: outputImagePath,
                });

                // Replace the image paths in the HTML content
                content = content.replace(
                    new RegExp(`src=["']\/assets\/${image.inputPath}["']`, 'g'),
                    `src="/${outputImagePath}"`
                );
            });
        }

        return content;
    });

    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
};

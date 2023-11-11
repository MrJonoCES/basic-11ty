const { DateTime } = require("luxon");
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const lightningCSS = require("@11tyrocks/eleventy-plugin-lightningcss");
const CleanCSS = require("clean-css");
const eleventyGoogleFonts = require("eleventy-google-fonts");
const Image = require("@11ty/eleventy-img");
const imageSize = require('image-size');
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
    
        // Ensure the full path to the image is correctly resolved
        let fullImagePath = path.join(__dirname, 'src', imagePath);

        // Get dimensions of the image
        const dimensions = imageSize(fullImagePath);
    
        let metadata = await Image(fullImagePath, {
            widths: [400, 600, 900, 1400],
            formats: ["webp", "avif"],
            outputDir: "./public/assets/",
            urlPath: "/assets/",
            filenameFormat: function (id, src, width, format, options) {
                let ext = path.extname(src);
                let name = path.basename(src, ext);
                return `${name}-${width}.${format}`;
            },
            sharpWebpOptions: {
                quality: 80
            },
            sharpAvifOptions: {
                quality: 80 
            }
        });

    
        let imageAttributes = {
            alt: altText,
            sizes: "(min-width: 1024px) 100vw, 50vw",
            loading: "lazy",
            decoding: "async",
            width: dimensions.width,
            height: dimensions.height,
        };
    
        return Image.generateHTML(metadata, imageAttributes);
    });    
    

    // Background images
    eleventyConfig.addFilter("responsiveBackgroundImage", function(imagePath) {
        const sizes = [400, 600, 900, 1400];
        let imagePaths = {};
    
        sizes.forEach(size => {
            // Generate paths for WebP format
            let resizedImagePath = imagePath.replace(/(.*)\.(jpg|jpeg|png)$/, `$1-${size}.webp`);
            imagePaths[size] = resizedImagePath;
        });
    
        return imagePaths;
    });
    
    


    return {
        dir: {
            input: "src",
            output: "public"
        }
    };
};

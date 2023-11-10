const {DateTime} = require("luxon"); 
const rssPlugin = require('@11ty/eleventy-plugin-rss');
const lightningCSS = require("@11tyrocks/eleventy-plugin-lightningcss");
const CleanCSS = require("clean-css");

module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(lightningCSS);
    eleventyConfig.addPassthroughCopy('./src/css/style.css');
    // eleventyConfig.addPassthroughCopy('./src/css/reset.css');
    eleventyConfig.addPassthroughCopy('./src/assets');
    eleventyConfig.addPassthroughCopy('./src/admin');
    
    // inline-css
    eleventyConfig.addFilter("cssmin", function(code) {
        return new CleanCSS({}).minify(code).styles;
    });

    // Plugins
    eleventyConfig.addPlugin(rssPlugin);

    eleventyConfig.addFilter("postDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
    });

    return {
        dir: {
            input: "src",
            output: "public"
        }
    }
}
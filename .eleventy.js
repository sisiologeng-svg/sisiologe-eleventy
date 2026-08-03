module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

  const Image = require("@11ty/eleventy-img").default || require("@11ty/eleventy-img");

  async function imageShortcode(src, alt, sizes = "100vw") {
    if (!src) return "";
    let cleanSrc = src.replace(/^\//, "");
    let metadata = await Image(cleanSrc, {
      widths: [400, 800],
      formats: ["jpeg"],
      outputDir: "_site/images/optimized/",
      urlPath: "/images/optimized/",
    });

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  }

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);

  // Collections
  eleventyConfig.addCollection("products", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/products/*.md");
  });

  eleventyConfig.addCollection("reviews", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/reviews/*.md");
  });

  eleventyConfig.addCollection("promos", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/promos/*.md");
  });

  eleventyConfig.addCollection("blog", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md");
  });

  // Filters
  eleventyConfig.addFilter("numberFormat", function(value) {
    return Number(value).toLocaleString();
  });

  eleventyConfig.addFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });

  eleventyConfig.addFilter("upper", function(value) {
    return value ? value.toUpperCase() : "";
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};
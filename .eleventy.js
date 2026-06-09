module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");

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
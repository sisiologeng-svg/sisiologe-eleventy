const { execSync } = require("child_process");

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

  function getFirstCommitDate(filePath) {
    try {
      const output = execSync(
        `git log --follow --format=%aI --reverse -- "${filePath}" | head -1`,
        { encoding: "utf8" }
      ).trim();
      return output ? new Date(output) : null;
    } catch (e) {
      return null;
    }
  }

  // Collections
  eleventyConfig.addCollection("products", function(collectionApi) {
    const products = collectionApi.getFilteredByGlob("src/products/*.md");
    products.forEach(p => {
      let sortDate = null;
      if (p.data.date) {
        sortDate = new Date(p.data.date);
      } else {
        sortDate = getFirstCommitDate(p.inputPath);
      }
      p.data.sortDate = sortDate || new Date(0);
    });
    return products.sort((a, b) => b.data.sortDate - a.data.sortDate);
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
// const autoprefixer = require("autoprefixer");
// const cssnano = require("cssnano");

import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

export default {
  // Connect plugins to PostCSS
  plugins: [
    autoprefixer,
    cssnano({ preset: "default" }), // set default minification settings
  ],
};

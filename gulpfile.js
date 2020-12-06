const { src, dest, series, parallel, watch } = require('gulp');

const bs = require('browser-sync').create();
const babel = require('gulp-babel');
const sm = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const postcssEnv = require('postcss-preset-env');
const cssnano = require('cssnano');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

const PATHS = {
  src: {
    root: 'src',
    css: 'src/css/**/*.css',
    js: 'src/js/**/*.js',
    images: 'src/images/**/*',
    fonts: 'src/fonts/**/*'
  },
  public: {
    root: 'src/public',
    css: 'src/public/css',
    js: 'src/public/js',
    images: 'src/public/images',
    fonts: 'src/public/fonts'
  }
}
const OPTIONS = {
  bs: {
    server: {
      baseDir: PATHS.src.root
    }
  },
  babel: {
    presets: ['@babel/env']
  },
  postcssEnv: {
    stage: 3,
    features: {
      'nesting-rules': true
    },
    browsers: 'last 2 versions'
  },
  cssnano: {
    discardComments: {
      removeAll: true
    }
  }
};

// -----------------------------------------------------------------------------
// Server
// -----------------------------------------------------------------------------
function server() {
  bs.init(OPTIONS.bs);
  watch(`${PATHS.src.root}/**/*.html`).on('change', bs.reload);
  watch(PATHS.src.fonts, fonts);
  watch(PATHS.src.images, images);
  watch(PATHS.src.css, css);
  watch(PATHS.src.js, js);
}

exports.server = server;

// -----------------------------------------------------------------------------
// CSS
// -----------------------------------------------------------------------------
function css() {
  return src(PATHS.src.css).
    pipe(sm.init()).
    pipe(postcss([postcssEnv(OPTIONS.postcssEnv)])).
    pipe(sm.write()).
    pipe(dest(PATHS.public.css)).
    pipe(bs.stream());
}

function minifyCss() {
  return src(`${PATHS.public.css}/**/*.css`).
    pipe(postcss([cssnano(OPTIONS.cssnano)])).
    pipe(dest(PATHS.public.css)).
    pipe(bs.stream());
}

exports.css = css;
exports.minifyCss = minifyCss;
exports.buildCss = series(css, minifyCss);

// -----------------------------------------------------------------------------
// JS
// -----------------------------------------------------------------------------
function js() {
  return src(PATHS.src.js).
    pipe(sm.init()).
    pipe(babel(OPTIONS.babel)).
    pipe(sm.write()).
    pipe(dest(PATHS.public.js)).
    pipe(bs.stream());
}

function minifyJs() {
  return src(`${PATHS.public.js}/**/*.js`).
    pipe(uglify()).
    pipe(dest(PATHS.public.js)).
    pipe(bs.stream());
}

exports.js = js;
exports.minifyJs = minifyJs;
exports.buildJs = series(js, minifyJs);

// -----------------------------------------------------------------------------
// Images
// -----------------------------------------------------------------------------
function images() {
  return src(PATHS.src.images).
    pipe(imagemin()).
    pipe(dest(PATHS.public.images));
}

exports.images = images;

// -----------------------------------------------------------------------------
// Fonts
// -----------------------------------------------------------------------------
function fonts() {
  return src(PATHS.src.fonts).pipe(dest(PATHS.public.fonts));
}

exports.fonts = fonts;

// -----------------------------------------------------------------------------
// Defaults
// -----------------------------------------------------------------------------
exports.build = series(fonts, images, css, minifyCss, js, minifyJs);
exports.default = series(fonts, images, css, js, server);

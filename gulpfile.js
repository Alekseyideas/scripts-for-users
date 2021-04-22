const gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  sourcemaps = require('gulp-sourcemaps'),
  del = require('del'),
  webpackStream = require('webpack-stream'),
  rev = require('gulp-rev-append'),
  pug = require('gulp-pug'),
  util = require('gulp-util'),
  imagemin = require('gulp-imagemin'),
  newer = require('gulp-newer'),
  rename = require('gulp-rename'),
  browsersync = require('browser-sync').create();

sass.compiler = require('node-sass');

const src = './src';
const dist = './dist';
const build = './build';

const config = {
  css: `/css`,
  sass: `/sass`,
  pug: `/views/containers`,
  html: `${dist}`,
  js: `/js`,
  images: `/images`,
  json: `/json`,
  minImages: `/images`,
  production: !!util.env.production,
};

const browserSync = (done) => {
  browsersync.init({
    server: {
      baseDir: dist,
    },
    port: 3000,
    online: true,
  });
  done();
};

// const browserSyncReload = done => {
//   browsersync.reload();
//   done();
// };

const clean = () => {
  return del([config.production ? build : dist]);
};

const images = () => {
  return gulp
    .src(src + config.images + '/**/*')
    .pipe(newer((config.production ? build : dist) + config.images))
    .pipe(imagemin())
    .pipe(gulp.dest((config.production ? build : dist) + config.images));
};

const json = () => {
  return gulp
    .src(src + config.json + '/**/*')
    .pipe(newer((config.production ? build : dist) + config.json))
    .pipe(gulp.dest((config.production ? build : dist) + config.json));
};

const sassTask = () => {
  return gulp
    .src(`${src + config.sass}/**/*.scss`)
    .pipe(config.production ? util.noop() : sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
        cascade: true,
      })
    )
    .pipe(config.production ? util.noop() : sourcemaps.write())
    .pipe(rename('main.css'))
    .pipe(gulp.dest(`${(config.production ? build : dist) + config.css}`))
    .pipe(browsersync.stream());
};

const pugTask = () => {
  return gulp
    .src(`${src + config.pug}/**/*.pug`)
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulp.dest(config.production ? build : dist))
    .pipe(browsersync.stream());
};

const jsTask = () => {
  return gulp
    .src(src + config.js + '/index.js')
    .pipe(
      webpackStream({
        mode: config.production ? 'production' : 'development',
        output: {
          filename: 'main.js',
        },
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /(node_modules)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    [
                      '@babel/preset-env',
                      {
                        targets: {
                          esmodules: true,
                        },
                      },
                    ],
                  ],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(gulp.dest((config.production ? build : dist) + config.js))
    .pipe(browsersync.stream());
};

const watchFiles = () => {
  gulp.watch(`${src}/**/*.scss`, sassTask);
  gulp.watch(`${src}/**/*.pug`, pugTask);
  gulp.watch(`${src}/**/*.js`, jsTask);
  gulp.watch(`${src}/**/*.json`, json);

  gulp.watch(src + config.images + '/**/*', images);
};

const revTask = () => {
  console.log(`${config.production}`);
  return gulp
    .src(`${config.production ? build : dist}/**/*.html`)
    .pipe(rev())
    .pipe(gulp.dest(config.production ? build : dist));
};

gulp.task('revTask', revTask);
gulp.task('images', images);
gulp.task('sassTask', sassTask);
gulp.task('jsTask', jsTask);
gulp.task('clean', clean);
gulp.task('pugTask', pugTask);
gulp.task('json', json);

gulp.task('default', gulp.series(clean, gulp.parallel(sassTask, pugTask, jsTask, images, json)));
gulp.task('watch', gulp.series(gulp.parallel(watchFiles, browserSync)));

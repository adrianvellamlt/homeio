"use strict";

const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

const clean = () => del(["./vendor/"]);

const modules = () => {

    const bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*')
        .pipe(gulp.dest('./public/vendor/bootstrap/js'));

    const bootstrapSCSS = gulp.src('./node_modules/bootstrap/scss/**/*')
        .pipe(gulp.dest('./public/vendor/bootstrap/scss'));
    
    const fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
        .pipe(gulp.dest('./public/vendor'));
    
    const jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
        .pipe(gulp.dest('./public/vendor/jquery-easing'));
    
    const jquery = gulp.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
        ])
        .pipe(gulp.dest('./public/vendor/jquery'));

    const fetch = gulp.src('./node_modules/fetch/lib/*.js')
        .pipe(gulp.dest('./public/vendor/fetch'));

    const socketio = gulp.src('./node_modules/socket.io/lib/*.js')
        .pipe(gulp.dest('./public/vendor/socketio'));

    return merge(
        bootstrapJS,
        bootstrapJS,
        bootstrapSCSS,
        fontAwesome,
        jqueryEasing,
        jquery,
        fetch,
        socketio
    );
};

const css = () => gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
        outputStyle: "expanded",
        includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
    }))
    .pipe(gulp.dest("./public/css"))
    .pipe(rename({
        suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./public/css"));

const js = () => gulp
    .src([
        './js/*.js',
        '!./js/*.min.js',
    ])
    .pipe(babel({
        presets: ["@babel/preset-env"]
    }))
    .pipe(uglify())
    .pipe(rename({
        suffix: '.min'
    }))
    .pipe(gulp.dest('./public/js'));

const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));

exports.clean = clean;
exports.css = css;
exports.js = js;
exports.vendor = vendor;
exports.build = build;
exports.default = build;
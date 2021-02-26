'use strict'

let gulp = require('gulp'),
    del = require('del'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify-es').default,
    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    watch = require('gulp-watch'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    buffer = require("vinyl-buffer");

let path = {
    'css': 'http/css/forms.css',
    'js': 'http/js/forms.js',
};

gulp.task('product:js', function () {
    process.env.NODE_ENV = 'production';

    let _browserify = browserify({entries: 'Forms/js/App.jsx', extensions: ['.jsx'], debug: false});

    return _browserify
        .transform('babelify', {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"]
        }).bundle()
        .on('error', function (err) {
            console.log(err.toString());
            this.emit('end');
        })
        .pipe(source('forms.js'))
        .pipe(buffer())

        .pipe(uglify().on('error', function (e) {
            console.log(e);
        }))
        .pipe(gulp.dest('../../../http/js'));
});
gulp.task('product:css', function () {
    gulp.src(['node_modules/react-datetime/css/react-datetime.css', 'bower_components/font-awesome/css/font-awesome.min.css', 'Forms/css/main.scss'])
        .pipe(concat('forms.css'))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('../../../http/css/'));
});


gulp.task('QUICK-PROD', ['product:js', 'product:css'], function () {
});

gulp.task('default', function () {
    gulp.start('Forms:devJs');
    gulp.start('Forms:devCss');

    watch(['Forms/js/*', 'Forms/js/*/*/*', 'Forms/js/*/*'], function (event, cb) {
        gulp.start('Forms:devJs');
    });
    watch(['Forms/css/*', 'Forms/css/*/*'], function (event, cb) {
        gulp.start('Forms:devCss');
    });
});

{

    gulp.task('Forms:devJs', function () {

        // process.env.NODE_ENV = 'production';

        let _browserify = browserify({entries: 'Forms/js/App.jsx', extensions: ['.jsx'], debug: true});

        return _browserify.transform('babelify', {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"]
        }).bundle()
            .on('error', function (err) {
                console.log(err.toString());

                this.emit('end');
            })
            .pipe(source('forms.js'))
            .pipe(gulp.dest('http/js'));
    });
    gulp.task('Forms:devCss', function () {
        gulp.src(['node_modules/react-datetime/css/react-datetime.css', 'bower_components/font-awesome/css/font-awesome.min.css', 'Forms/css/main.scss'])
            .pipe(concat('forms.css'))
            .pipe(sass({outputStyle: ''}).on('error', sass.logError))
            .pipe(gulp.dest('http/css/'));
    });

    gulp.task('clean', function () {
        return del([path.css, path.js])
    });
}

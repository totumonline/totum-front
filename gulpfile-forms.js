'use strict'

let gulp = require('gulp'),
    del = require('del'),
    connect = require('gulp-connect'),

    browserify = require('browserify'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass');

let path = {
    'css': 'http/css/forms.css',
    'js': 'http/js/forms.js',
};


gulp.task('default', function () {
    gulp.start('Forms:devJs');
    gulp.start('Forms:devCss');

    watch(['Forms/js/*','Forms/js/*/*/*', 'Forms/js/*/*'], function (event, cb) {
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

        return _browserify.transform('babelify', {presets: ["@babel/preset-env", "@babel/preset-react"], plugins: ["@babel/plugin-transform-runtime", "@babel/plugin-proposal-class-properties"]}).bundle()
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

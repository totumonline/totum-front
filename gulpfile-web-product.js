let gulp = require('gulp'),
    uglify = require('gulp-uglifyes'),
    sass = require('gulp-sass'),
    include = require('gulp-include'),
    del = require('del'),
    concat = require('gulp-concat'),
    cssBase64 = require('gulp-css-base64'),
    staticHash = require('gulp-static-hash'),
    through = require('through2'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require("vinyl-buffer");

gulp.task('default', ['product:html.html_copy', 'Forms:devJs', 'Forms:devCss'], function () {
    return gulp.start('product:http_templates_copy');
});
gulp.task('Forms:devJs', function () {


    process.stdout.write("Setting NODE_ENV to 'production'" + "\n");
    process.env.NODE_ENV = 'production';
    if (process.env.NODE_ENV !== 'production') {
        throw new Error("Failed to set NODE_ENV to production!!!!");
    } else {
        process.stdout.write("Successfully set NODE_ENV to production" + "\n");
    }

    let _browserify = browserify({entries: 'web_dev/Forms/js/App.jsx', extensions: ['.jsx'], debug: true});

    return _browserify.transform('babelify', {
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
         }))/**/
        .pipe(gulp.dest('deploiment/http/js'));


});
gulp.task('Forms:devCss', function () {
    gulp.src(['bower_components/font-awesome/css/font-awesome.min.css', 'node_modules/react-datetime/css/react-datetime.css', 'web_dev/Forms/css/main.scss'])
        .pipe(concat('forms.css'))
        .pipe(sass({outputStyle: ''}).on('error', sass.logError))
        .pipe(gulp.dest('deploiment/http/css/'));
});

let urlReplacer = function (options) {
    let contents, reg, replaceFrom, replaceTo;

    replaceTo = options.replaceTo;
    replaceFrom = options.replaceFrom;
    reg = new RegExp('["\'\\(]\\s*([\\w\\_\/\\.\\-]*\\.(' + (options.exts ? options.exts.join('|') : 'jpg|jpeg|png|gif|cur|js|css') + '))[^\\)"\']*\\s*[\\)"\']', 'gim');

    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        contents = file.contents.toString().replace(reg, function (content, filePath) {
            if (filePath.indexOf(replaceFrom) === 0) {
                let replacer = replaceTo + filePath.substring(replaceFrom.length);
                return content.replace(filePath, replacer);
            } else return content;
        });

        file.contents = new Buffer(contents);

        this.push(file);
        return callback();
    });
}
let path = {
    js: {
        src: 'web_dev/modules/**/*.js',
        src_parts: 'web_dev/modules/**/*._js',
        dest: 'deploiment/http/js/'
    },
    css: {
        src: 'web_dev/css/main.scss',
        dest: 'deploiment/http/css/'
    },
    cssImgs: {
        src: 'web_dev/**/css-*.*',
        dest: 'deploiment/http/css/img/'
    },
    jsLibsMini: {
        src: ['bower_components/jquery/dist/jquery.min.js'
            , 'bower_components/jquery-ui/jquery-ui.min.js'
            , 'bower_components/jquery.cookie/jquery.cookie.js'
            , 'bower_components/bootstrap/dist/js/bootstrap.min.js'
            , 'bower_components/bootstrap-select/dist/js/bootstrap-select.js'
            , 'bower_components/bootstrap-select/dist/js/i18n/defaults-ru_RU.js'
            , 'bower_components/moment/min/moment.min.js'
            , 'bower_components/moment/locale/ru.js'
            , 'bower_components/big.js/big.min.js'
            , 'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js'
            , 'bower_components/jstree/dist/jstree.js'
            , 'bower_components/jsoneditor/dist/jsoneditor.min.js'
            , 'bower_components/codemirror/lib/codemirror.js'
            , 'bower_components/codemirror/mode/htmlmixed/htmlmixed.js'
            , 'bower_components/codemirror/mode/xml/xml.js'
            , 'bower_components/codemirror/mode/markdown/markdown.js'
            , 'bower_components/codemirror/mode/javascript/javascript.js'
            , 'bower_components/codemirror/mode/css/css.js'
            , 'bower_components/codemirror/addon/edit/closetag.js'
            , 'bower_components/codemirror/addon/fold/xml-fold.js'
            , 'bower_components/codemirror/addon/mode/simple.js'
            , 'bower_components/codemirror/addon/hint/show-hint.js'
            , 'bower_components/codemirror/addon/scroll/simplescrollbars.js'
            , 'bower_components/file-saver/FileSaver.min.js'
            , 'bower_components/bootstrap3-dialog/dist/js/bootstrap-dialog.min.js'
            , 'bower_components/remarkable-bootstrap-notify/bootstrap-notify.min.js'
            , 'bower_components/jquery.nicescroll/jquery.nicescroll.min.js'
        ],
        dest: 'deploiment/http/js/'
    },
    cssLibs: {
        src: ['bower_components/jquery-ui/themes/base/*.min.css'
            , 'bower_components/bootstrap/dist/css/bootstrap.min.css'
            , 'bower_components/font-awesome/css/font-awesome.min.css'
            , 'bower_components/bootstrap/dist/css/bootstrap-theme.min.css'
            , 'bower_components/bootstrap-select/dist/css/bootstrap-select.min.css'
            , 'bower_components/jsoneditor/dist/jsoneditor.min.css'
            , 'bower_components/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css'
            , 'bower_components/codemirror/lib/codemirror.css'
            , 'bower_components/codemirror/theme/eclipse.css'
            , 'bower_components/codemirror/addon/hint/show-hint.css'
            , 'bower_components/codemirror/addon/scroll/simplescrollbars.css'
            , 'bower_components/jstree/dist/themes/default-with-imgs/style.css'
            , 'bower_components/jstree/dist/themes/dark-with-imgs/style.css'
        ],
        dest: 'deploiment/http/css/'
    },
    imgsLibs: {
        src: ['bower_components/jquery-ui/themes/base/images/*.*'],
        dest: 'deploiment/http/css/images/'
    },
    imgsLibs2: {
        src: ['bower_components/jsoneditor/dist/img/*.*'],
        dest: 'deploiment/http/css/img/'
    },
    http: {
        src: ['web_dev/http/*.*', 'web_dev/http/.*', 'web_dev/http/**/*.*', 'web_dev/http/**/.*'],
        dest: 'deploiment/http/'
    },
    htmlTemplate: {
        src: 'templates_src/*',
        dest: 'totum/templates'
    }
};

/*product*/
{
    gulp.task('product:clean', function () {
        return del(['deploiment/http', 'deploiment/totum/templates'])
    });

    gulp.task('product:fonts', function () {
        return gulp.src(['bower_components/bootstrap/fonts/*.*', 'bower_components/font-awesome/fonts/*.*', 'web_dev/fonts/*.*', 'bower_components/JetBrainsMono/web/woff2/*.*'])
            .pipe(gulp.dest('deploiment/http/fonts/'));
    });

    gulp.task('product:jsLibs', function () {
        return gulp.src(path.jsLibsMini.src)
            .pipe(concat('libs.js'))
            .pipe(uglify().on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(path.jsLibsMini.dest));
    });

    gulp.task('product:cssLibs', ['all:jstreeImgs'], function () {
        return gulp.src(path.cssLibs.src)
            .pipe(concat('libs.css'))
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest(path.cssLibs.dest));

    });

    gulp.task('product:imgsLibs', function () {
        gulp.src(path.imgsLibs.src)
            .pipe(gulp.dest(path.imgsLibs.dest));
        return gulp.src(path.imgsLibs2.src)
            .pipe(gulp.dest(path.imgsLibs2.dest));
    });
    gulp.task('product:cssImgs', function () {
        return gulp.src(path.cssImgs.src)
            .pipe(gulp.dest(path.cssImgs.dest));
    });
    gulp.task('product:css', function () {
        return gulp.src(path.css.src)
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))//expanded
            .pipe(gulp.dest(path.css.dest));
    });
    gulp.task('product:js', function () {

        gulp.src('web_dev/functions.json')
            .pipe(gulp.dest(path.http.dest + 'js/'));

        return gulp.src(path.js.src)
            .pipe(include())
            .pipe(concat('main.js'))
          .pipe(uglify().on('error', function (e) {
                  console.log(e);
              }))    /* */
            .pipe(gulp.dest(path.js.dest));
    });
    gulp.task('product:jsChart', function () {
        gulp.src('node_modules/chart.js/dist/Chart.min.js')
            .pipe(concat('chart.js'))
            .pipe(gulp.dest('deploiment/http/js/lib/'));

    });

    gulp.task('product:templatesReplace', ['product:css', 'product:jsChart', 'product:cssImgs', 'product:imgsLibs', 'product:cssLibs', 'product:fonts', 'product:js', 'product:jsLibs'], function () {
        return gulp.src(path.htmlTemplate.src)
            .pipe(staticHash({
                asset: './deploiment/http',
                exts: ['json', 'css', 'js']
            }))
            .pipe(urlReplacer({replaceFrom: '../deploiment/http/', replaceTo: '/'}))
            .pipe(gulp.dest(path.htmlTemplate.dest));
    });
    gulp.task('product:templatesReplace:simple', function () {
        return gulp.src(path.htmlTemplate.src)
            .pipe(staticHash({
                asset: './deploiment/http',
                exts: ['json', 'css', 'js']
            }))
            .pipe(urlReplacer({replaceFrom: '../deploiment/http/', replaceTo: '/'}))
            .pipe(gulp.dest('deploiment/totum/templates'));
    });

    gulp.task('product:http_files', ['product:templatesReplace'], function () {
        return gulp.src(path.http.src)
            .pipe(gulp.dest(path.http.dest));

    });
    gulp.task('product:http_templates_copy', function () {
        return gulp.src('totum/templates/*.*')
            .pipe(gulp.dest('deploiment/totum/templates'));
    });
    gulp.task('product:html.html_copy', ['product:http_files'], function () {
        return gulp.src('totum/templates/html.html')
            .pipe(gulp.dest('deploiment/http'));
    })
}

gulp.task('all:jstreeImgs', function () {
    gulp.src('bower_components/jstree/dist/themes/default-dark/style.css')
        .pipe(cssBase64({
            baseDir: "./"
        })).pipe(gulp.dest('bower_components/jstree/dist/themes/dark-with-imgs/'));

    return gulp.src('bower_components/jstree/dist/themes/default/style.css')
        .pipe(cssBase64({
            baseDir: "./../../../../../web_dev/http/imgs/"
        })).pipe(gulp.dest('bower_components/jstree/dist/themes/default-with-imgs/'));
});
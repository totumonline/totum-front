let gulp = require('gulp'),
    uglify = require('gulp-uglify-es').default,
    sass = require('gulp-sass'),
    include = require('gulp-include'),
    order = require('gulp-order'),
    del = require('del'),
    concat = require('gulp-concat'),
    cssBase64 = require('gulp-css-base64'),
    staticHash = require('gulp-static-hash'),
    through = require('through2'),
    watch = require('gulp-watch'),
    debug = require('gulp-debug');

let dev = false;

gulp.task('ALL_TO_PROD', function () {
    return gulp.start('product:html.html_copy');
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
        src: './modules/**/*.js',
        src_parts: './modules/**/*._js',
        dest: './http/js/'
    },
    css: {
        src: './css/main.scss',
        dest: './http/css/'
    },
    cssImgs: {
        src: ['./**/css-*.*'],
        dest: './http/css/img/'
    },
    ru: [
        'bower_components/moment/locale/ru.js'
        , 'bower_components/bootstrap-select/dist/js/i18n/defaults-ru_RU.js'
        , 'i18n/ru.js'
    ],
    de: [
        'bower_components/moment/locale/de.js'
        , 'bower_components/bootstrap-select/dist/js/i18n/defaults-de_DE.js'
        , 'i18n/de.js'
    ],
    es: [
        'bower_components/moment/locale/es.js'
        , 'bower_components/bootstrap-select/dist/js/i18n/defaults-es_ES.js'
        , 'i18n/es.js'
    ],
    en: [
        , 'i18n/en.js'
    ],
    jsLibsMini: {
        src: ['bower_components/jquery/dist/jquery.min.js'
            , 'bower_components/jquery-ui/jquery-ui.min.js'
            , 'bower_components/jquery.cookie/jquery.cookie.js'
            , 'bower_components/bootstrap/dist/js/bootstrap.min.js'
            , 'bower_components/bootstrap-select/dist/js/bootstrap-select.js'
            , 'bower_components/moment/min/moment.min.js'
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
            , 'bower_components/codemirror/addon/display/placeholder.js'
            , 'bower_components/codemirror/addon/scroll/simplescrollbars.js'
            , 'bower_components/file-saver/FileSaver.min.js'
            , 'bower_components/bootstrap3-dialog/dist/js/bootstrap-dialog.min.js'
            , 'bower_components/remarkable-bootstrap-notify/bootstrap-notify.min.js'
            , 'bower_components/jquery.nicescroll/jquery.nicescroll.min.js'
            , 'node_modules/perfect-scrollbar/dist/perfect-scrollbar.js'
        ],
        dest: './http/js/'
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
            , 'node_modules/perfect-scrollbar/css/perfect-scrollbar.css'
        ],
        dest: './http/css/'
    },
    imgsLibs: {
        src: ['bower_components/jquery-ui/themes/base/images/*.*'],
        dest: './http/css/images/'
    },
    imgsLibs2: {
        src: ['bower_components/jsoneditor/dist/img/*.*'],
        dest: './http/css/img/'
    },
    http: {
        src: ['!./http/*.*', '!./http/.*', '!./http/**/forms.*', './http/**/*.*', './http/**/.*'],
        dest: '../../../http/'
    },
    htmlTemplate: {
        src: ['../../../totum/templates/page_template*', '../../../totum/templates/html.html'],
        dest: '../../../totum/templates/'
    }
};

gulp.task('DEVELOP', function () {
    dev = true;

    gulp.start('product:js');
    gulp.start('product:css');
    gulp.start('dev:fonts');

    watch('./i18n/*.js', function (event, cb) {
        gulp.start('product:langs');
    });
    watch([path.js.src, path.js.src_parts, './functions.js'], function (event, cb) {
        gulp.start('product:js');
    });
    watch(['css/**/*', 'css/*'], function (event, cb) {
        gulp.start('product:css');
    });
});

gulp.task('dev:fonts', function () {
    return gulp.src(['bower_components/bootstrap/fonts/*.*', 'bower_components/font-awesome/fonts/*.*', './fonts/*.*', './fonts/*/*.*', 'bower_components/JetBrainsMono/fonts/webfonts/*.*'])
        .pipe(gulp.dest('./http/fonts/'));
});

gulp.task('QUICK-PROD', ['product:js', 'product:css'], function () {
    return gulp.src('./http/**/main.*')/*.pipe(debug())*/
        .pipe(gulp.dest(path.http.dest));
});

gulp.task('QUICK-PROD-DEV', function () {
    dev = true;
    return gulp.start('QUICK-PROD');
});

/*product*/
{
    gulp.task('product:fonts', function () {
        return gulp.src(['bower_components/bootstrap/fonts/*.*', 'bower_components/font-awesome/fonts/*.*', './fonts/*.*', './fonts/*/*.*', 'bower_components/JetBrainsMono/fonts/webfonts/*.*'])
            .pipe(gulp.dest('../../../http/fonts/'));
    });

    gulp.task('product:jsLibs', function () {
        return gulp.src(path.jsLibsMini.src)
            .pipe(concat('libs.js'))
            .pipe(uglify().on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(path.jsLibsMini.dest));
    });
    gulp.task('product:langRu', function () {
        return gulp.src(path.ru)
            .pipe(concat('ru.js'))
            .pipe(uglify().on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(path.jsLibsMini.dest+'i18n/'));
    });
    gulp.task('product:langDe', function () {
        return gulp.src(path.de)
            .pipe(concat('de.js'))
            .pipe(uglify().on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(path.jsLibsMini.dest+'i18n/'));
    });
    gulp.task('product:langEs', function () {
        return gulp.src(path.es)
            .pipe(concat('es.js'))
            .pipe(uglify().on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(path.jsLibsMini.dest+'i18n/'));
    });
    gulp.task('product:langEng', function () {
        return gulp.src(path.en)
            .pipe(concat('en.js'))
            .pipe(uglify().on('error', function (e) {
                console.log(e);
            }))
            .pipe(gulp.dest(path.jsLibsMini.dest+'i18n/'));
    });
    gulp.task('product:langs', ['product:langRu', 'product:langDe','product:langEs','product:langEng'], function () {
        return true;
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
        /*return gulp.src(path.cssImgs.src)
            .pipe(gulp.dest(path.cssImgs.dest));*/
    });
    gulp.task('product:css', function () {
        let branch = gulp.src(path.css.src);


        branch = branch.pipe(sass({outputStyle: dev ? 'expanded' : 'compressed'}).on('error', sass.logError))//expanded
        return branch.pipe(gulp.dest(path.css.dest));
    });
    gulp.task('product:js', function () {
        gulp.src('./functions.js')
            .pipe(gulp.dest('./http/js/'));


        let branch = gulp.src(path.js.src)
            .pipe(include())
            .pipe(order([
                "modules/App/*.js",
                "modules/auth/*.js",
                "modules/Bootstrap.Helpers/*.js",
                "modules/page_html/*.js",
                "modules/tree/*.js",
                "modules/table/*.js",
            ]))
            .pipe(concat('main.js'));
        if (!dev) {
            branch = branch.pipe(uglify().on('error', function (e) {
                console.log(e);
            }))
        }
        return branch.pipe(gulp.dest(path.js.dest));
    });
    gulp.task('product:jsChart', function () {
        gulp.src('node_modules/chart.js/dist/Chart.min.js')
            .pipe(concat('chart.js'))
            .pipe(gulp.dest('./http/js/lib/'));

    });

    gulp.task('product:templatesReplace', ['product:http_files'], function () {
        return gulp.src(path.htmlTemplate.src).pipe(urlReplacer({replaceFrom: '/', replaceTo: '../../http/'}))
            .pipe(staticHash({
                asset: '../../http/',
                exts: ['json', 'css', 'js']
            })).pipe(urlReplacer({replaceFrom: '../../http/', replaceTo: '/'}))
            .pipe(gulp.dest(path.htmlTemplate.dest))
    });

    gulp.task('product:http_files', ['product:css', 'product:jsChart', 'product:cssImgs', 'product:imgsLibs', 'product:cssLibs', 'product:fonts', 'product:js', 'product:jsLibs', 'product:langs'], function () {
        return gulp.src(path.http.src)/*.pipe(debug())*/
            .pipe(gulp.dest(path.http.dest));

    });

    gulp.task('product:html.html_copy', ['product:templatesReplace'], function () {
        return gulp.src('../../../totum/templates/html.html')
            .pipe(gulp.dest('../../../http'));
    })
}

gulp.task('all:jstreeImgs', function () {
    gulp.src('bower_components/jstree/dist/themes/default-dark/style.css')
        .pipe(cssBase64({
            baseDir: "./"
        })).pipe(gulp.dest('bower_components/jstree/dist/themes/dark-with-imgs/'));

    return gulp.src('bower_components/jstree/dist/themes/default/style.css')
        .pipe(cssBase64({
            baseDir: "./../../../../../http/imgs/"
        })).pipe(gulp.dest('bower_components/jstree/dist/themes/default-with-imgs/'));
});
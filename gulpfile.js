/* GULPFILE SETUP
 * ==================================================
 *  Live reloading and sync with browsersync, linting
 *  and minifies JS, compiles Sass, autoprefixes and
 *  minifies css, media query optimization, image
 *  optimization, file concatenation, renders 
 *  Nunjucks template files
 * 
 * Based on:
 * https://github.com/ZiggyV/gulp-sass-boilerplate
 * ==================================================
 */

/* PLUGINS
 * --------------------------------------------------
 *  Load Gulp plugins
 * -------------------------------------------------- */
var autoprefixer = require('autoprefixer'),
    browserSync = require('browser-sync'),
    cache = require('gulp-cache'),
    concat = require('gulp-concat'),
    cssnano = require('gulp-cssnano'),
    data = require('gulp-data'),
    del = require('del'),
    fs = require('fs'),
    gulp = require('gulp'),
    gulpif = require('gulp-if'),
    gulpSequence = require('gulp-sequence'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    jshint = require('gulp-jshint'),
    lazypipe = require('lazypipe'),
    mainBowerFiles = require('main-bower-files'),
    mergequeries = require('gulp-merge-media-queries'),
    nunjucksRender = require('gulp-nunjucks-render'),
    plumber = require('gulp-plumber'),
    postcss = require('gulp-postcss'),
    purgecss = require('gulp-purgecss'),
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    useref = require('gulp-useref'),
    wiredep = require('wiredep').stream;

/* VARS
 * --------------------------------------------------
 *  Variables and project paths
 * -------------------------------------------------- */
var reload = browserSync.reload,
    autoprefixList = ['last 2 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

var config = {
    global: {
        input: 'src',
        output: 'dist',
        tmp: '.tmp'
    },
    bower: {
        input: 'bower.json'
    },
    fonts: {
        input: 'src/fonts/**/*',
        output: 'dist/fonts',
        tmp: '.tmp/fonts',
        bower: '**/*.{eot,svg,ttf,woff,woff2}'
    },
    html: {
        input: 'src/templates/**/*.{html,njk}',
        pages: ['src/templates/*.{html,njk}', 'src/templates/sub/*.{html,njk}'],
        layouts: 'src/templates/layouts/*.{html,njk}',
        bower: 'src/templates/layouts',
        build: '.tmp/**/*.html',
        data: './src/data.json'
    },
    images: {
        input: 'src/images/**/*',
        output: 'dist/images',
        tmp: '.tmp/images'
    },
    scripts: {
        input: 'src/scripts/**/*.js',
        output: 'dist/js',
        tmp: '.tmp/js'
    },
    static: {
        input: ['src/*.*', '!src/*.{html,njk}', '!src/data.json'],
        size: 'dist/**/*'
    },
    styles: {
        input: 'src/scss/main.{scss,sass}',
        output: 'dist/css',
        tmp: '.tmp/css',
        bower: 'src/scss',
        all: 'src/scss/**/*.{scss,sass}'
    }
}

/* SERVE TASK
 * --------------------------------------------------
 *  Livereload with browserSync, watch files on 
 *  change and execute tasks accordingly
 * -------------------------------------------------- */
gulp.task('serve', ['nunjucks', 'styles', 'scripts', 'images', 'fonts'], function() {
    browserSync({
        server: {
            baseDir: [config.global.tmp],
            routes: {
                '/bower_components': 'bower_components'
            },
            serveStaticOptions: {
                extensions: ['html']
            }
        },
        notify: false,
        port: 3000
    });

    gulp.watch([config.html.input, config.html.data], ['nunjucks']);
    gulp.watch(config.styles.all, ['styles']);
    gulp.watch(config.scripts.input, ['scripts']);
    gulp.watch(config.images.input, ['images']);
    gulp.watch(config.fonts.input, ['fonts']); 
    gulp.watch(config.bower.input, ['wiredep', 'fonts']);
});

/* NUNJUCKS TASK
 * --------------------------------------------------
 *  Render Nunjucks template(s) to HTML and sync
 *  data from data.json on change
 * -------------------------------------------------- */
gulp.task('nunjucks', function() {
    return gulp.src(config.html.pages, { base: 'src/templates' })
        .pipe(plumber())
        .pipe(data(function() {
            // return require(config.html.data)
            return JSON.parse(fs.readFileSync(config.html.data))
        }))
        .pipe(nunjucksRender({
            path: ['src/templates']
        }))
        .pipe(gulp.dest(config.global.tmp))
        .pipe(reload({ stream: true }));
});

/* STYLES TASK
 * --------------------------------------------------
 *  Compile SCSS, autoprefix and make sourcemap
 * -------------------------------------------------- */
gulp.task('styles', function() {
    return gulp.src(config.styles.input)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'nested',
            includePaths: ['.']
        }).on('error', sass.logError))
        .pipe(postcss([autoprefixer({ browsers: autoprefixList })]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.styles.tmp))
        .pipe(reload({ stream: true }));
});

/* SCRIPTS TASK
 * --------------------------------------------------
 *  Lint JS file(s) and report errors in console
 * -------------------------------------------------- */
gulp.task('scripts', function() {
    return gulp.src(config.scripts.input)
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(config.scripts.tmp))
        .pipe(reload({ stream: true, once: true }));
});

/* FONTS TASK
 * --------------------------------------------------
 *  Get fonts for bower dependencies that need them
 *  and move them to dist and .tmp folder. Concat 
 *  own fonts to mainBowerFiles array if needed
 * -------------------------------------------------- */
gulp.task('fonts', function() {
    return gulp.src(mainBowerFiles(config.fonts.bower, function(err){})
        .concat(config.fonts.input))
        .pipe(gulp.dest(config.fonts.output))
        .pipe(gulp.dest(config.fonts.tmp))
        .pipe(reload({ stream: true }));
});

/* IMAGES TASK
 * --------------------------------------------------
 *  Compress images - PNG, JPG, GIF and SVG
 *  Doesn't remove IDs from SVG files
 * -------------------------------------------------- */
gulp.task('images', function() {
    return gulp.src(config.images.input)
        .pipe(plumber())
        .pipe(cache(imagemin([
            imagemin.optipng({ optimizationLevel: 6 }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.gifsicle({ interlaced: true }),
            imagemin.svgo({
                plugins: [{ cleanupIDs: false }]
            }) 
        ])))
        .pipe(gulp.dest(config.images.output))
        .pipe(gulp.dest(config.images.tmp))
        .pipe(reload({ stream: true }));       
});

/* BUILD TASK
 * --------------------------------------------------
 *  Make all of our src/ files ready for deployment:
 *   - Concatenate same type of files with useref
 *     between build blocks; 'build:{js,css}'
 *   - Uglify JS
 *   - Optimize CSS
 *   - Minify HTML
 * -------------------------------------------------- */
gulp.task('build', ['nunjucks', 'styles', 'scripts'], function() {
    return gulp.src(config.html.build)
        .pipe(plumber())
        .pipe(useref({ searchPath: ['.tmp', '.']}))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', optimizeCss()))
        .pipe(gulpif('*.html', htmlmin({ collapseWhitespace: true, removeComments: true })))
        .pipe(gulp.dest(config.global.output));
});

// optimizeCss function
var optimizeCss = lazypipe()
    .pipe(purgecss, {
        content: [config.html.build],
        whitelist: ['is-active']
    })
    .pipe(mergequeries, {
        log: false
    })
    .pipe(cssnano, {
        safe: true,
        autoprefixer: false,
        discardComments: {
            removeAll: true
        }
    });

/* WIREDEP TASK
 * --------------------------------------------------
 *  Inject bower dependencies in SCSS and NJK files
 * 
 *  NJK fileType not supported out-of-the-box (yet): 
 *  https://github.com/taptapship/wiredep/pull/258
 * -------------------------------------------------- */
gulp.task('wiredep', function() {
    gulp.src(config.styles.input)
        .pipe(plumber())
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)+/
        }))
        .pipe(gulp.dest(config.styles.bower));
        
    gulp.src(config.html.layouts)
        .pipe(plumber())
        .pipe(wiredep({
            ignorePath: /^(\.\.\/)*\.\./,
            fileTypes: {
                njk: {
                    block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
                    detect: {
                        js: /<script.*src=['"]([^'"]+)/gi,
                        css: /<link.*href=['"]([^'"]+)/gi
                    },
                    replace: {
                        js: '<script src="{{filePath}}"></script>',
                        css: '<link rel="stylesheet" href="{{filePath}}" />'
                    }
                }
            }
        }))
        .pipe(gulp.dest(config.html.bower));
});

/* CLEAR TASK
 * --------------------------------------------------
 *  Clear cache if needed
 * -------------------------------------------------- */
gulp.task('clear', function(done) {
    return cache.clearAll(done);
});

/* CLEAN TASK
 * --------------------------------------------------
 *  Deletes dist/ and .tmp/ folder
 * -------------------------------------------------- */
gulp.task('clean:dist', del.bind(null, config.global.output));
gulp.task('clean:tmp', del.bind(null, config.global.tmp));

/* STATIC TASK
 * --------------------------------------------------
 *  Move static files to dist/ folder (robots.txt,
 *  humans.txt, favicon). Hidden files will be
 *  ignored (.git for example)
 * -------------------------------------------------- */
gulp.task('static', function() {
    return gulp.src(config.static.input, {
        dot: true
    }).pipe(gulp.dest(config.global.output));
});

/* SIZE TASK
 * --------------------------------------------------
 *  Display size of dist folder
 * -------------------------------------------------- */
gulp.task('size', function() {
    return gulp.src(config.static.size)
        .pipe(size({ title: 'Deployment build:', gzip: true }));
});

/* DEV TASK
 * --------------------------------------------------
 *  Start developing by running this task. Builds 
 *  our project from the source files (src/) into a 
 *  temporary folder (.tmp/) while watching files 
 *  for changes
 * -------------------------------------------------- */
gulp.task('dev', gulpSequence(['clean:dist', 'clean:tmp', 'wiredep'], 'serve'));

/* DEFAULT TASK
 * --------------------------------------------------
 *  Creates a production-ready build 
 *  located in the dist/ folder
 * -------------------------------------------------- */
gulp.task('default', gulpSequence(['clean:dist', 'wiredep'], 'build', ['images', 'fonts', 'static'], 'size'));
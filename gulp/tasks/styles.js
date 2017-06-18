'use strict';

const path = require('path');
const pump = require('pump');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const syntax = require('postcss-scss');

const SRC = ['**/*.{scss,sass}'];

module.exports = function init(name, gulp, config) {
    const cwd = path.join(config.dir.source, 'scss');

    if (!config.production) {
        gulp.watch(SRC, {cwd: cwd}, [name])
            .on('change', (event) => {
                console.info(`File ${event.path} was ${event.type} —> running tasks: ${name}`);
            });
    }

    const options = {
        outputStyle: 'expanded',
        includePaths: [
            config.dir.dump,
            require('bourbon').includePaths,
            require('bourbon-neat').includePaths,
            path.join(process.cwd(), 'node_modules')
        ]
    };

    const processors = [
        /**
         * NOTE: Using Browserslist https://github.com/postcss/autoprefixer#browsers
         */
        autoprefixer()
    ];

    if (config.production) {
        processors.push(cssnano());
    }

    gulp.task(name, (done) => {
        pump([
            gulp.src(SRC, {cwd: cwd}),
            gulpif(!config.production, sourcemaps.init()),
            sass(options).on('error', sass.logError),
            postcss(processors, {syntax: syntax}),
            gulpif(!config.production, sourcemaps.write('.', {
                /**
                 * TODO: No clue why this is necessary for sourcemaps to work
                 */
                mapSources: function (sourcePath) {
                    return sourcePath;
                }
            })),
            gulp.dest(config.dir.output)
        ],
            done
        );
    });
};

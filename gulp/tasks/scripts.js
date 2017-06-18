'use strict';

const path = require('path');
const pump = require('pump');
const glob = require('globby');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');

const SRC = ['**/*.js'];

module.exports = function init(name, gulp, config) {
    const cwd = path.join(config.dir.source, 'js');

    if (!config.production) {
        gulp.watch(SRC, {cwd: cwd}, [name])
            .on('change', (event) => {
                console.info(`File ${event.path} was ${event.type} —> running tasks: ${name}`);
            });
    }

    gulp.task(name, function callback(done) {
        glob('*.js', {cwd: cwd})
            .then((entries) => {
                entries.forEach((entry) => {
                    pump([
                        browserify({
                            entries: [entry],
                            basedir: cwd,
                            debug: true
                        }).bundle(),
                        source(entry),
                        buffer(),
                        gulpif(config.production, uglify()),
                        gulpif(!config.production, sourcemaps.init({loadMaps: true})),
                        gulpif(!config.production, sourcemaps.write('.')),
                        gulp.dest(config.dir.output)
                    ]);
                });

                done();
            })
            .catch(done);
    });
};

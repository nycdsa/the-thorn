'use strict';

const path = require('path');
const pump = require('pump');

const SRC = ['**/*.*'];

module.exports = function init(name, gulp, config) {
    const cwd = path.join(config.dir.source, 'assets');

    gulp.task(name, (done) => {
        pump([
            gulp.src(SRC, {cwd: cwd}),
            gulp.dest(config.dir.output)
        ],
            done
        );
    });
};

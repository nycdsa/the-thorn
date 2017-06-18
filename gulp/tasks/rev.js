'use strict';

var path = require('path');
var pump = require('pump');
var RevAll = require('gulp-rev-all');
var tap = require('gulp-tap');
var del = require('del');

module.exports = function init(name, gulp, config) {
    var taskConfig = config.tasks[name].toJS();

    taskConfig.debug = true;

    taskConfig.transformFilename = (file, hash) => {
        /**
         * NOTE: Just in case: https://docs.aws.amazon.com/AmazonS3/latest/dev/request-rate-perf-considerations.html
         */
        var ext = path.extname(file.path);
        return `${hash.substring(0, taskConfig.hashLength)}.${path.basename(file.path, ext) + ext}`;
    };

    var dontCleanup = []
        .concat(taskConfig.dontGlobal, taskConfig.dontRenameFile)
        .map((pattern) => {
            return pattern.source;
        }).join('|');

    gulp.task(name, (done) => {
        pump([
            gulp.src(['**/*'], {cwd: config.dir.output}),
            RevAll.revision(taskConfig),
            gulp.dest(config.dir.output),
            tap((file) => {
                // Clean up
                return file.revPathOriginal.search(dontCleanup) > 0 ? file :
                    del([file.revPathOriginal])
                        .then(() => {
                            return file;
                        });
            })
        ],
            done
        );
    });
};

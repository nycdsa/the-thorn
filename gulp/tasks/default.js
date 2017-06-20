'use strict';

const sequence = require('gulp-sequence');

module.exports = function init(name, gulp, config, tasks) {
    // Configure build task sequence
    const build = [
        tasks.clean, [
            tasks.copy,
            tasks.images,
            tasks.icons,
            tasks.scripts
        ], [
            tasks.html, // Depends on the output from `icons` task
            tasks.styles // Depends on output from `images` task
        ]
    ];

    if (config.production) {
        build.push(tasks.rev);
    } else {
        build.push(tasks.serve);
    }

    // Execute build task sequence
    gulp.task(name, (done) => {
        sequence.use(gulp).apply(null, build)(done);
    });
};

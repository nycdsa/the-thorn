'use strict';

var del = require('del');

module.exports = function init(name, gulp, config) {
    gulp.task(name, function callback(done) {
        del([
            config.dir.output,
            config.dir.dump
        ])
        .then(function success() {
            done();
        });
    });
};

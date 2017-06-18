'use strict';

const bs = require('browser-sync');

/**
 * NOTE: Tried BrowserSync `stream()` but saw no benfit over watching output
 */

module.exports = function init(name, gulp, config) {
    const server = bs.create(config.server.name);

    gulp.task(name, (done) => {
        server.init(config.server.options.toJS(), done);
    });
};

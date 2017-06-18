'use strict';

const path = require('path');
const pump = require('pump');
const svgstore = require('gulp-svgstore');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const sequence = require('gulp-sequence');

const SRC = ['**/*.svg'];

module.exports = function init(name, gulp, config, tasks) {
	const cwd = path.join(config.dir.source, 'icons');

	if (!config.production) {
		gulp.watch(SRC, {cwd: cwd}, (done) => {
			/**
			 * NOTE: The `icons` task is a dependency of `html` task.
			 */
			sequence.use(gulp)(name, tasks.html)(done);
		})
		.on('change', (event) => {
			console.info(`File ${event.path} was ${event.type} —> running tasks: ${name} ${tasks.html}`);
		});
	}

	gulp.task(name, (done) => {
		pump([
			gulp.src(SRC, {cwd: cwd}),
			gulpif(config.production, imagemin()),
			svgstore({inlineSvg: true}),
			gulp.dest(config.dir.dump)
		],
			done
		);
	});
};

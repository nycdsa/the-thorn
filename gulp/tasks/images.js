'use strict';

const path = require('path');
const pump = require('pump');
const imagemin = require('gulp-imagemin');
const gulpif = require('gulp-if');
const sequence = require('gulp-sequence');

const SRC = ['**/*.{png,jpg}'];

module.exports = function init(name, gulp, config, tasks) {
	const cwd = config.dir.source;

	// Add watch
	if (!config.production) {
		gulp.watch(SRC, {cwd: cwd}, [name, tasks.styles])
			.on('change', (event) => {
				/**
				 * NOTE: The `images` task is a dependency of `styles` task.
				 */
				console.info(`File ${event.path} was ${event.type} —> running tasks: ${name} ${tasks.styles}`);
			});
	}

	// Copy images task
	gulp.task('image-copy', (done) => {
		pump([
			gulp.src(SRC, {cwd: cwd}),
			gulpif(config.production, imagemin()),
			gulp.dest(config.dir.output)
		],
			done
		);
	});

	// Sequence tasks
	gulp.task(name, function callback(done) {
		sequence.use(gulp)('image-copy')(done);
	});
};

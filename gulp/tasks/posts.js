'use strict';

const fs = require('fs');
const path = require('path');
const jetpack = require('fs-jetpack');

const gulpif = require('gulp-if');
const htmlbeautify = require('gulp-html-beautify');
const htmlnano = require('gulp-htmlnano');
const nunjucksRender = require('gulp-nunjucks-render');
const pump = require('pump');
const rename = require('gulp-rename');

const SRC = ['**/*.njk'];
const DEFAULT_FILENAME = 'index';

module.exports = function init(name, gulp, config) {
	const cwd = path.join(config.dir.source, 'templates');

	if (!config.production) {
		gulp.watch(SRC, {cwd: cwd}, [name])
			.on('change', (event) => {
				console.info(`File ${event.path} was ${event.type} —> running tasks: ${name}`);
			});
	}

	gulp.task(name, (done) => {

		// Define the posts here so we don't get an error if file
		// doesn't exist yet when all tasks are being registered
		const POSTS = require('./../../.dmp/mailchimp.json');

		// A tally of the number of items processed,
		// used to call `done()` in the loop
		let itemsProcessed = 0;

		POSTS.forEach(post => {
			pump([
				gulp.src(SRC, {cwd: path.join(cwd, 'pages')}),
				nunjucksRender({
					path: [
						path.join(process.cwd(), cwd),
						path.join(process.cwd(), config.dir.dump)
					],
					data: { post }
				}),
				rename(file => {
					if (file.basename === 'post') {
						file.dirname = `${post.slug}`;
						file.basename = 'index';
					} else {
						file.dirname = 'trash';
						file.basename = 'trash';
					}
				}),
				gulp.dest(config.dir.output)
			]);
			itemsProcessed++;
			if (itemsProcessed === POSTS.length) {
				done();
			}
		});
	});
};



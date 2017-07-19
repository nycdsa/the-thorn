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

		let itemsProcessed = 0;

		// First, add the slug data
		addData(POSTS);

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
						file.dirname = '';
						file.basename = post.slug;
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

/**
 * Add data to the posts objects
 * @param  {array} campaigns  An array of posts
 */
const addData = (campaigns) => {
	createSlugAttributes(campaigns);
}

/**
 * Helper function to add slugs to json
 * @param  {array} posts	An array of posts
 */
const createSlugAttributes = (posts) => {
	posts.forEach(elem => {
		let url = `post/${elem.settings.subject_line.toLowerCase().split(' ').join('-').replace(/([^a-z0-9]+)/gi, '-')}`;
		elem.slug = url;
	});
}

const createPostFiles = (posts, config) => {
	const layoutTemplate = path.join(config.dir.source, 'templates/layouts/base.njk');
	const layoutPath = path.join(config.dir.dump, 'layouts/base.njk');
	const postTemplate = path.join(config.dir.source, 'templates/pages/post.njk');
	posts.forEach(elem => {
		let postPath = path.join(config.dir.dump, `${elem.slug}.html`);
		jetpack.copy(layoutTemplate, layoutPath, {overwrite: true});
		jetpack.copy(postTemplate, postPath, {overwrite: true});
	});
}



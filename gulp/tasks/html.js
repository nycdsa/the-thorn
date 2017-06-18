'use strict';

const path = require('path');
const pump = require('pump');
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require('gulp-rename');
const gulpif = require('gulp-if');
const htmlbeautify = require('gulp-html-beautify');
const htmlnano = require('gulp-htmlnano');

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
		pump([
			gulp.src(SRC, {cwd: path.join(cwd, 'pages')}),
			nunjucksRender({
				path: [
					path.join(process.cwd(), cwd),
					path.join(process.cwd(), config.dir.dump)
				]
			}),
			rename((file) => {
				// Permalink pages
				if (file.basename !== DEFAULT_FILENAME) {
					file.dirname = file.basename;
					file.basename = DEFAULT_FILENAME;
				}
			}),
			gulpif(config.production, htmlnano({minifySvg: false}), htmlbeautify()),
			gulp.dest(config.dir.output)
		],
			done
		);
	});
};

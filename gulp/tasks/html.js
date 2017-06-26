'use strict';

const cheerio = require('cheerio');
const gulpif = require('gulp-if');
const htmlbeautify = require('gulp-html-beautify');
const htmlnano = require('gulp-htmlnano');
const http = require('axios');
const moment = require('moment');
const nunjucksRender = require('gulp-nunjucks-render');
const path = require('path');
const pump = require('pump');
const rename = require('gulp-rename');

const {
	MAILCHIMP_API,
	MAILCHIMP_KEY,
	MAILCHIMP_LIST
} = process.env;

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
		getCampaignsFromMailchimp().then(posts => {
			pump([
				gulp.src(SRC, {cwd: path.join(cwd, 'pages')}),
				nunjucksRender({
					path: [
						path.join(process.cwd(), cwd),
						path.join(process.cwd(), config.dir.dump)
					],
					data: { posts }
				}),
				rename((file) => {
					// Permalink pages
					if (file.basename !== DEFAULT_FILENAME) {
						file.dirname = file.basename;
						file.basename = DEFAULT_FILENAME;
					}
				}),
				// gulpif(config.production, htmlnano({minifySvg: false}), htmlbeautify()),
				gulp.dest(config.dir.output)
			],
				done
			);
		});
	});
};

function getCampaignsFromMailchimp() {
	const headers = { Authorization: `Bearer ${MAILCHIMP_KEY}` }
	return http.get(`${MAILCHIMP_API}/campaigns`, { headers })
		.then(({ data }) => {
			return data.campaigns.filter(d =>
				(d.recipients.list_id === MAILCHIMP_LIST)
			);
		})
		.then(campaigns => {
			const all = campaigns.map(c => {
				const url = `${MAILCHIMP_API}/campaigns/${c.id}/content`;
				return http.get(url, { headers }).then(({ data }) => {
					return Object.assign({}, c, data);
				});
			});

			return Promise.all(all);
		}).then(content => {
			return content.sort((a, b) => {
				return new Date(a.send_time) < new Date(b.send_time);
			}).map(c => {
				const $ = cheerio.load(c.html);
				delete c._links;

				// strip inline styles from email html for easier
				// formatting
				const html = $('.bodyContainer')
					.html()
					.replace(/style=\"[^>]*\"/g, '');


				return Object.assign(c, {
					send_time: moment(c.send_time).calendar(),
					html
				});
			});
		});
}

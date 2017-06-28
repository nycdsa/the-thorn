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

const MAILCHIMP_API = process.env.MAILCHIMP_API
const MAILCHIMP_KEY = process.env.MAILCHIMP_KEY
const MAILCHIMP_LIST = process.env.MAILCHIMP_LIST
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

const get = (url, config, wait) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      http.get(url, config)
        .then(response => resolve(response))
        .catch(err => reject(err))
    }, wait || 0)
  })
}

const getCampaignsFromMailchimp = () => {
	const config = {
		headers: { Authorization: `Bearer ${MAILCHIMP_KEY}` },
		params: { count: 25, sort_field: 'send_time'}
	}
	return get(`${MAILCHIMP_API}/campaigns`, config)
		.then(res => res.data.campaigns)
		.then(campaigns => {
			return campaigns.filter(d =>
				(d.recipients.list_id === MAILCHIMP_LIST)
			);
		})
		.then(campaigns => {
			const all = campaigns.map((c, i) => {
				const url = `${MAILCHIMP_API}/campaigns/${c.id}/content`;
				return get(url, config, i * 50).then(res => {
					return Object.assign({}, c, res.data);
				});
			});
			return Promise.all(all);
		}).then(content => {
			return content.sort((a, b) => {
				return new Date(b.send_time) - new Date(a.send_time);
			});
		}).then(sorted => {
			return sorted.map(c => {
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

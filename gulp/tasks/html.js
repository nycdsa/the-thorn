'use strict';

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const gulpif = require('gulp-if');
const htmlbeautify = require('gulp-html-beautify');
const htmlnano = require('gulp-htmlnano');
const http = require('axios');
const moment = require('moment');
const nunjucksRender = require('gulp-nunjucks-render');
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
		getCampaigns(config).then(posts => {
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
		}).catch(e => console.error(e));
	});
};

const get = (url, config, wait) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      http.get(url, config)
        .then(response => resolve(response))
        .catch(err => reject(err))
    }, wait || 10)
  });
}

const writeFile = (path, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, JSON.stringify(data, null, 2), err => {
			if (err) return reject(err);
			resolve(data);
		});
	});
}

const getCampaigns = config => {
	return new Promise((resolve, reject) => {
		const j = path.join(config.dir.output, 'mailchimp.json');
		fs.readFile(j, 'utf8', (err, data) => {
			if (err && err.code === 'ENOENT') {
				return fetchCampaignsFromMailchimp(config)
					.then(campaigns => writeFile(j, campaigns))
					.then(campaigns => resolve(campaigns))
					.catch(err => reject(err));
			}

			resolve(JSON.parse(data));
		});
	});
};


const fetchCampaignsFromMailchimp = () => {
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
			return sorted.map((c, i) => {
				const $ = cheerio.load(c.html);
				delete c._links;

				// strip inline styles from email html for easier
				// formatting
				const html = $('.bodyContainer')
					.html()
					.replace(/style=\"[^>]*\"/g, '');


				return Object.assign(c, {
					issue_number: sorted.length - i,
					html
				});
			});
		});
}

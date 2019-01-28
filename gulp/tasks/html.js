'use strict';

const fs = require('fs');
const path = require('path');
const jetpack = require('fs-jetpack');

const gulpif = require('gulp-if');
const htmlbeautify = require('gulp-html-beautify');
const htmlnano = require('gulp-htmlnano');
const markdown = require('markdown').markdown;
const moment = require('moment');
const nunjucks = require('nunjucks');
const nunjucksRender = require('gulp-nunjucks-render');
const pump = require('pump');
const rename = require('gulp-rename');
const yaml = require('js-yaml');

const SRC = ['**/*.njk'];
const DEFAULT_FILENAME = 'index';

module.exports = function init(name, gulp, config) {
  const cwd = path.join(config.dir.source, 'templates');

  if (!config.production) {
    gulp.watch(SRC, { cwd: cwd }, [name]).on('change', event => {
      console.info(
        `File ${event.path} was ${event.type} —> running tasks: ${name}`
      );
    });
  }

  gulp.task(name, done => {
    const postDir = path.join(__dirname, '../../src/posts');
    readPosts(postDir)
      .then(posts => {
        return posts.map(post => splitPost(post));
      })
      .then(posts => {
        console.log('posts', posts);
        pump(
          [
            gulp.src(SRC, { cwd: path.join(cwd, 'pages') }),
            nunjucksRender({
              path: [
                path.join(process.cwd(), cwd),
                path.join(process.cwd(), config.dir.dump)
              ],
              data: { posts }
            }),
            rename(file => {
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
      })
      .catch(e => console.error(e));
  });
};

const readDir = (path, encoding = 'utf8') => {
  return new Promise((resolve, reject) => {
    fs.readdir(path, encoding, (err, data) => {
      if (err) return reject(err);

      resolve(data);
    });
  });
};

const readFile = (path, encoding = 'utf8') => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, encoding, (err, data) => {
      if (err) return reject(err);

      resolve(data);
    });
  });
};

const readPosts = postDir => {
  return readDir(postDir).then(ls => {
    const posts = ls.map(p => {
      const postPath = path.join(postDir, p);
      return readFile(postPath);
    });

    return Promise.all(posts);
  });
};

const splitPost = str => {
  const split = str.split('---\n');
  const hasFrontmatter = split.length > 1;
  const frontmatter = hasFrontmatter ? yaml.safeLoad(split[1]) : {};
  const html = hasFrontmatter ? markdown.toHTML(split[2]) : split[0];
  return Object.assign(frontmatter, { html });
};

const writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(data, null, 2), err => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

/**
 * Helper function to add slugs to json
 * @param  {Object} obj 	A post object
 * @return {[type]}     [description]
 */
const createSlugAttribute = obj => {
  return `post/${obj.settings.subject_line
    .toLowerCase()
    .split(' ')
    .join('-')
    .replace(/([^a-z0-9]+)/gi, '-')}`;
};

/**
 * Helper function to get shortened text
 * to display on the homepage
 * @param  {Object} obj 	A post object
 * @return {String}     	A string or html of the shortened text
 */
const createShortenedText = obj => {
  // No idea what to do here
};

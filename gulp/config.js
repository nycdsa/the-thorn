'use strict';

const path = require('path');
const immu = require('immu');

// Command line arguments
const argv = require('yargs')
    .alias('p', 'production')
    .boolean('p')
    .default('p', false)
    .describe('p', 'Sets production flag.')
    .argv;

const source = './src';
const output = './dist';
const temp = './.tmp';
const dump = './.dmp';

const config = {
    dir: {
        source: source,
        output: argv.production ? output : temp,
        dump: dump
    }
};

config.server = {
    name: 'https://browsersync.io/docs/api#api-get',
    options: {
        server: temp,
        files: [path.join(temp, '**/*')],
        port: 3000,
        watchOptions: {
            ignoreInitial: true
        }
    }
};

config.tasks = {
    /**
     * NOTE: Rev options https://github.com/smysnk/gulp-rev-all#options
     */
    rev: {
        hashLength: 8,
        dontGlobal: [
            /\/apple-touch-icon.png$/,
            /\/favicon.png$/
        ],
        dontRenameFile: [
            /\/index.html$/
        ],
        dontSearchFile: [
            /\/.(jpe?g|png|gif|svg|eot|ttf|woff(2)?|mp4)$/
        ]
    }
};

module.exports = immu(Object.assign({}, config, argv));

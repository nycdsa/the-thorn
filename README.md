# The Thorn
> a static website for The Thorn (https://www.thethorn.nyc)

[![CircleCI](https://circleci.com/gh/nycdsa/the-thorn.svg?style=svg)](https://circleci.com/gh/nycdsa/the-thorn)

This site is built off the content pulled from the Mailchimp account used to send out The Thorn newsletter.

## Installation and running locally
You need three environment variables set to run the script:
1. `MAILCHIMP_API`
2. `MAILCHIMP_KEY`
3. `MAILCHIMP_LIST`

Then:
1. `npm install`
2. `npm run watch`

_you can use `npm run build` if you don't need rebuild on code changes_

## Deployment
The app is deployed to S3 with every commit to `master`.

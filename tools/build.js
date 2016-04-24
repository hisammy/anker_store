/**
 * React Starter Kit (http://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2015 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import run from './run';
var gulp = require('gulp');
var child_process = require('child_process');
/**
 * Compiles the project from source files into a distributable
 * format and copies it to the output (build) folder.
 */
 
 child_process.exec('gulp deals', function(err) {});
async function build() {
  await run(require('./clean'));
  await run(require('./copy'));
  await run(require('./bundle'));
  await run(require('./sitemap'));
}
export default build;

/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { edit } from 'external-editor';

let exec = require('child-process-promise').exec;
let fs = require('fs');
let prompt = require('prompt');

let changelog = '';
const regex = /changelogs?\s?:/i;
let [major, minor, patch] = [0, 0, 0];

// Detect debug mode
let debug = false;
process.argv.forEach(param => {
	if (param === '--debug') {
		debug = true;
	}
});


prompt.start();

exec('git diff-index --quiet HEAD --')
	.then(() => exec('git describe --abbrev=0'))
	.then(({stdout}) => exec(`git log ${stdout.trim()}..HEAD`, {maxBuffer: 1024 * 500}))
	.then(result => (result.stdout.split('\n')))  // Split lines
	.then(lines => lines.map(line => line.trim()))  // Trim them
	.then(lines => lines.filter(line => regex.exec(line)))  // Filter changelog rows
	.then(lines => lines.map(line => {
		// Strip the changelog prefix
		let m = regex.exec(line);
		return line.substr(m[0].length).trim();
	}))
	.then(changes => changes.map(line => `- ${line}`))  // Prepend "-" to each row
	.then(changes => changes.join('\n'))
	.then(changes => {
		// Store changes
		changelog = changes;
	})
	.then(() => {
		console.log('Enter new version:');
		return new Promise((resolve, reject) => {
			prompt.get(['version'], (err, result) => {
				if (err) {
					reject();
					return;
				}
				resolve(result.version);
			});
		});
	})
	.then((version) => {
		[major, minor, patch] = version.split('.');
	})
	.then(() => {
		// Let the user edit the changelog before commiting
		changelog = edit(changelog);
	})
	.then(() => {
		// Generate changelog for Android
		let versionCode = (parseInt(major, 10) * 10000) + (parseInt(minor, 10) * 100) + parseInt(patch, 10);
		let filename = `fastlane/metadata/android/en-US/changelogs/${versionCode}.txt`;
		fs.writeFileSync(filename, `${changelog}\n`);
		return exec(`git add ${filename}`);
	})
	.then(() => {
		// Generate changelog for iOS
		let filename = 'fastlane/metadata/en-GB/release_notes.txt';
		fs.writeFileSync(filename, `${changelog}\n`);
		return exec(`git add ${filename}`);
	})
	.then(() => {
		let message = `Bump version to v${major}.${minor}.${patch}\n\nChanges:\n${changelog}`;
		return exec(`npm version ${major}.${minor}.${patch} -m "${message}" -f`);
	})
	.then(() => {
		console.log('Release done. Please check the commit and tag created.');
	})
	.catch((err) => {
		// Detect which step that failed.
		console.error('Could not run release script. Please make sure your working directory is clean.');
		console.error('Maybe you need to run git stash first?');
		if (debug) {
			console.error('The full error is:');
			console.error(err);
		} else {
			console.error('To get the full message. Rerun with the --debug parameter');
			console.error('yarn run release -- --debug');
		}
	});

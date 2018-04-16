let exec = require('child-process-promise').exec;
let fs = require('fs');
let ExternalEditor = require('external-editor');

let changelog = '';
const regex = /changelogs?\s?:/i;

exec('git describe --abbrev=0')
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
		// Let the user edit the changelog before commiting
		changelog = ExternalEditor.edit(changelog);
	})
	.then(() => {
		// Generate changelog for Android
		let [major, minor, patch] = process.env.npm_package_version.split('.');
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
		let message = `Bump version to v${process.env.npm_package_version}`;
		return exec(`git commit -m '${message}'`);
	})
	.then(() => {
		return exec(`git tag -a -f v${process.env.npm_package_version} -F fastlane/metadata/en-GB/release_notes.txt`);
	})
	.then(() => {
		console.log('Release done. Please check the commit and tag created.');
	});

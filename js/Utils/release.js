let exec = require('child-process-promise').exec;
let fs = require('fs');

let changelog = '';

exec('git describe --abbrev=0')
	.then(({stdout}) => exec(`git log ${stdout.trim()}..HEAD`))
	.then(result => (result.stdout.split('\n')))  // Split lines
	.then(lines => lines.map(line => line.trim()))  // Trim them
	.then(lines => lines.filter(line => line.toLowerCase().startsWith('changelog:')))  // Filter changelog rows
	.then(lines => lines.map(line => line.substr(10).trim()))  // Strip the changelog prefix
	.then(changes => changes.map(line => `- ${line}`))  // Prepend "-" to each row
	.then(changes => changes.join('\n'))
	.then(changes => {
		changelog = changes;
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

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

const { getDefaultConfig } = require('metro-config');

const modulePaths = require('./modulePaths');
const resolve = require('path').resolve;
const fs = require('fs');

const ROOT_FOLDER = resolve(__dirname, '..');

module.exports = (async () => {
	const {
		resolver: { sourceExts, assetExts },
	} = await getDefaultConfig();

	const moduleMap = {};
	modulePaths.forEach(path => {
		if (fs.existsSync(path)) {
			moduleMap[resolve(path)] = true;
		}
	});

	return {
		transformer: {
			babelTransformerPath: require.resolve('react-native-svg-transformer'),
			getTransformOptions: async () => ({
				preloadedModules: moduleMap,
				transform: {
				  experimentalImportSupport: false,
				  inlineRequires: { blacklist: moduleMap },
				},
			}),
		},
		projectRoot: ROOT_FOLDER,
		resolver: {
			assetExts: assetExts.filter(ext => ext !== 'svg'),
			sourceExts: [...sourceExts, 'svg'],
		},
	};
})();

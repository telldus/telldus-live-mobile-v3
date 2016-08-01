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
 * @providesModule Bootstrap
 */

'use strict';

import React from 'React';
import { Provider } from 'react-redux';
import Dimensions from 'Dimensions';

import App from 'App';
import { configureStore } from 'Store';
import { serverURL } from 'Config';

function Bootstrap(): React.Component {

	console.disableYellowBox = true;

	class Root extends React.Component {
		constructor() {
			super();
			this.state = {
				isLoading: true,
				store: configureStore(() => this.setState({isLoading: false})),
			};
		}

		render() {
			if (this.state.isLoading) {
				return null;
			}
			const { height, width } = Dimensions.get('window');
			return (
				<Provider store={this.state.store}>
					<App />
				</Provider>
			);
		}
	}

	return Root;
}

global.LOG = (...args) => {
	console.log('/------------------------------\\');
	console.log(...args);
	console.log('\\------------------------------/');
	return args[args.length - 1];
};

module.exports = Bootstrap;

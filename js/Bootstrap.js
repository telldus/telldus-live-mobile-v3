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

import 'intl';
import 'intl/locale-data/jsonp/en';

import React from 'React';
import { NativeModules } from 'react-native';
import { Provider } from 'react-redux';
import { Crashlytics } from 'react-native-fabric';

import App from 'App';
import { configureStore } from './App/Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
import * as Translations from 'Translations';
import { forceLocale } from 'Config';

function Bootstrap(): React.Component {

	console.disableYellowBox = true;

	class Root extends React.Component {
		constructor() {
			super();
			let locale = this.getLocale();
			let messages = Translations.en;
			if (Translations[locale]) {
				messages = Translations[locale];
			}
			this.state = {
				isLoading: true,
				locale: locale,
				messages: messages,
				store: configureStore(this._configureStoreCompleted.bind(this)),
			};
		}

		_configureStoreCompleted() {
			this.setState({ isLoading: false });
			let state = this.state.store.getState();
			if (state.user && state.user.userProfile) {
				Crashlytics.setUserName(`${state.user.userProfile.firstname} ${state.user.userProfile.lastname}`);
				Crashlytics.setUserEmail(state.user.userProfile.email);
			}
		}

		getLocale() {
			if (forceLocale) {
				return forceLocale;
			}
			if (!NativeModules.I18nManager) {
				return 'en';
			}
			let localeIdentifier = NativeModules.I18nManager.localeIdentifier;
			let parts = localeIdentifier.split('_');
			if (parts.length === 0) {
				return 'en';
			}
			return parts[0];
		}

		render() {
			if (this.state.isLoading) {
				return null;
			}
			return (
				<Provider store={this.state.store}>
					<IntlProvider locale={this.state.locale} messages={this.state.messages}>
						<App />
					</IntlProvider>
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

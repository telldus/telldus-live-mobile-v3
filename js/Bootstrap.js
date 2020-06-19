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

// @flow

'use strict';

console.reportErrorsAsExceptions = false;

import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/sv';
import 'intl/locale-data/jsonp/cs';
import 'intl/locale-data/jsonp/fr';
import 'intl/locale-data/jsonp/nb';
import 'intl/locale-data/jsonp/de';

require('@formatjs/intl-pluralrules/polyfill');
require('@formatjs/intl-pluralrules/dist/locale-data/en');
require('@formatjs/intl-pluralrules/dist/locale-data/sv');
require('@formatjs/intl-pluralrules/dist/locale-data/cs');
require('@formatjs/intl-pluralrules/dist/locale-data/fr');
require('@formatjs/intl-pluralrules/dist/locale-data/nb');
require('@formatjs/intl-pluralrules/dist/locale-data/de');

require('@formatjs/intl-relativetimeformat/polyfill');
require('@formatjs/intl-relativetimeformat/dist/locale-data/en');
require('@formatjs/intl-relativetimeformat/dist/locale-data/sv');
require('@formatjs/intl-relativetimeformat/dist/locale-data/cs');
require('@formatjs/intl-relativetimeformat/dist/locale-data/fr');
require('@formatjs/intl-relativetimeformat/dist/locale-data/nb');
require('@formatjs/intl-relativetimeformat/dist/locale-data/de');

import React from 'react';
import { Text } from './BaseComponents';
import {
	Provider,
	useDispatch,
	useSelector,
} from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SplashScreen from 'react-native-splash-screen';

import App from './App';
import { configureStore } from './App/Store/ConfigureStore';
import { IntlProvider } from 'react-intl';
import * as Translations from './App/Translations';
import {
	enableCrashlyticsCollection,
} from './App/Lib/Analytics';
import {
	getLocale,
	getLanguageInfoFromLangCode,
	isDeviceLanguageAndHasChanged,
} from './App/Lib/appUtils';
import {
	setAppLanguage,
} from './App/Actions/App';
import {
	setUserIdentifierFirebaseCrashlytics,
	setUserNameFirebaseCrashlytics,
} from './App/Actions/Analytics';

const {
	store,
	persistor,
} = configureStore();

function Bootstrap(): Object {

	console.disableYellowBox = true;

	class Root extends React.Component<null, null> {

		constructor() {
			super();

			enableCrashlyticsCollection();
		}

		onBeforeLift = () => {
			SplashScreen.hide();
			const { getState, dispatch } = store;
			let state = getState();
			if (state.user && state.user.userProfile) {
				dispatch(setUserIdentifierFirebaseCrashlytics());
				dispatch(setUserNameFirebaseCrashlytics());
			}
		}

		render(): Provider {
			return (
				<Provider store={store}>
					<PersistGate
						persistor={persistor}
						onBeforeLift={this.onBeforeLift}>
						<WithIntlProvider/>
					</PersistGate>
				</Provider>
			);
		}
	}

	return Root;
}

const WithIntlProvider = (props: Object): Object => {
	const { defaultSettings = {} } = useSelector((state: Object): Object => state.app);
	let { language = {} } = defaultSettings;

	let locale = language.code;
	const dispatch = useDispatch();
	if (!locale || isDeviceLanguageAndHasChanged(language)) {
		const code = getLocale();
		let { name } = getLanguageInfoFromLangCode(code) || {};
		dispatch(setAppLanguage({code, key: `${code}-device`, name}));
		locale = code;
	}

	let messages = Translations.en;
	if (Translations[locale]) {
		messages = Translations[locale];
	}
	return (
		<IntlProvider
			locale={locale}
			messages={messages}
			textComponent={Text}
			key={locale}>
			<App locale={locale}/>
		</IntlProvider>
	);
};

global.LOG = (...args: any): Array<any> => {
	console.log('/------------------------------\\');
	console.log(...args);
	console.log('\\------------------------------/');
	return args[args.length - 1];
};
// ignoring react-intl errors on missing translated strings[Except the errors in development mode, the behaviour is fine].
if (process.env.NODE_ENV !== 'production') {
	const originalConsoleError = console.error;
	if (console.error === originalConsoleError) {
		console.error = (...args: Array<any>) => {
			if (args[0].indexOf('[React Intl] Missing message:') === 0) {
				return;
			}
			originalConsoleError.call(console, ...args);
		};
	}
}
// Fixes a warning! https://github.com/facebook/react-native/issues/18868
// Can be removed once upgraded to RNv0.56
global.__old_console_warn = global.__old_console_warn || console.warn;
global.console.warn = (str: string): any => {
	let tst = `${str || ''}`;
	if (tst.startsWith('Warning: isMounted(...) is deprecated')) {
		return;
	}
	return global.__old_console_warn.apply(console, [str]);
};

module.exports = {
	Bootstrap,
	store,
};

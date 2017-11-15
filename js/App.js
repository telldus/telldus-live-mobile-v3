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
 * @providesModule App
 */

'use strict';

import React from 'react';
import { connect } from 'react-redux';

import {
	PreLoginNavigator,
	AppNavigator,
	Push,
} from 'Components';

class App extends React.Component {

	componentDidMount() {
		this.pushConf();
	}

	componentDidUpdate() {
		this.pushConf();
	}

	/*
	 * calls the push configuration methods, for logged in users, which will generate push token and listen for local and
	 * remote push notifications.
	 */
	pushConf() {
		if (this.props.accessToken) {
			Push.configure(this.props);
		}
	}

	render() {
		if ((!this.props.accessToken) || (this.props.accessToken && !this.props.isTokenValid)) {
			return <PreLoginNavigator />;
		}
		return (
			<AppNavigator {...this.props}/>
		);
	}
}

function mapStateToProps(store) {
	return {
		accessToken: store.user.accessToken,
		pushToken: store.user.pushToken,
		isTokenValid: store.user.isTokenValid,
	};
}

module.exports = connect(mapStateToProps)(App);

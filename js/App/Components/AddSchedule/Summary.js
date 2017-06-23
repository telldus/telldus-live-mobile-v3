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
 */

// @flow

'use strict';

import React from 'react';
import { View, Text } from 'BaseComponents';
import HeaderImage from './HeaderImage';
import { Button } from 'react-native';
import { NavigationActions } from 'react-navigation';

class Summary extends View {

	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<HeaderImage
					h1="5. Summary"
					h2="Please confirm the schedule"
					goBack={this.props.navigation.goBack}
				/>
				<Button title="Finish" onPress={() => this.props.navigation.navigate('Scheduler')}/>
			</View>
		);
	}
}

module.exports = Summary;

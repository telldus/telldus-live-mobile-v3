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
 * @providesModule StackScreenContainer
 */

// @flow

'use strict';

import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'BaseComponents';

let deviceHeight = Dimensions.get('window').height;
let deviceWidth = Dimensions.get('window').width;

export default class StackScreenContainer extends View {
	render() {
		return (
			<View style={styles.container}>
				<Image style={styles.deviceIconBackG} resizeMode={'stretch'} source={require('../TabViews/img/telldus-geometric-header-bg.png')}/>
				{this.props.children}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
	},
	deviceIconBackG: {
		height: (deviceHeight * 0.2),
		width: deviceWidth,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

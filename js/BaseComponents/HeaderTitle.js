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

import React, { Component } from 'react';
import { Image, Dimensions, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Props = {
	appLayout: Object,
};

class HeaderTitle extends Component<Props, null> {
	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		let { appLayout } = this.props;
		return (
			<Image style={appLayout.height > appLayout.width ? styles.port : styles.land} resizeMode={'contain'} source={{ uri: 'telldus_logo'}}/>
		);
	}
}

const styles = StyleSheet.create({
	port: {
		height: deviceWidth * 0.046666667,
		width: deviceWidth * 0.277333333,
		marginHorizontal: deviceWidth * 0.22,
	},
	land: {
		height: deviceHeight * 0.046666667,
		width: deviceHeight * 0.277333333,
		marginHorizontal: deviceHeight * 0.32,
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
	};
}

export default connect(mapStateToProps, null)(HeaderTitle);

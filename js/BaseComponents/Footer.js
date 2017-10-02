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
import { View } from 'react-native';
import Base from './Base';
import computeProps from './computeProps';

type Props = {
	children: Object,
};

export default class Footer extends Base {
	props: Props;

	getInitialStyle(): Object {
		return {
			navbar: {
				shadowColor: '#000',
				shadowOffset: {
					width: 0,
					height: 2,
				},
				shadowOpacity: 0.1,
				shadowRadius: 1.5,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: (!Array.isArray(this.props.children)) ? 'center' : 'space-between',
				height: this.getTheme().footerHeight,
				backgroundColor: this.getTheme().footerDefaultBg,
			},
		};
	}

	prepareRootProps(): Object {

		let defaultProps = {
			style: this.getInitialStyle().navbar,
		};

		return computeProps(this.props, defaultProps);

	}

	render(): React$Element<any> {

		return (
			<View {...this.prepareRootProps()}>
				{ !Array.isArray(this.props.children) &&
				  <View >
					  {this.props.children}
				  </View>}

				{ Array.isArray(this.props.children) &&
				  <View style={{
					  flex: 1,
					  alignItems: 'center',
					  justifyContent: 'flex-start',
					  flexDirection: 'row',
				  }}>
					  {this.props.children[0]}
				  </View>}

				{ Array.isArray(this.props.children) &&
				  <View style={{
					  flex: 3,
					  alignSelf: 'center',
				  }}>
					  {this.props.children[1]}
				  </View>}

				{ Array.isArray(this.props.children) &&
				  <View style={{
					  flex: 1,
					  alignItems: 'center',
					  justifyContent: 'flex-end',
					  flexDirection: 'row',
				  }}>
					  {this.props.children[2]}
				  </View>}
			</View>
		);
	}
}

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
 *
 */

// @flow

'use strict';

import React from 'react';
import { Platform } from 'react-native';
import {
	View,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

class LabelBox extends View {
	render(): Object {
		let { containerStyle, label, children, showIcon, appLayout } = this.props;
		const styles = this.getStyle(appLayout);

		return (
			<View style={[styles.container, containerStyle]}>
				{!!label &&
					<Text style={styles.label}>
						{label}
					</Text>
				}
				{!!showIcon &&
					<IconTelldus icon={'location'} size={styles.iconSize} color={'#A59F9A'} style={styles.icon}/>
				}
				{!!children && children}
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSize = Math.floor(deviceWidth * 0.045);
		const iconSize = Math.floor(deviceWidth * 0.09);

		return {
			container: {
				flexDirection: 'column',
				backgroundColor: '#fff',
				marginTop: deviceWidth * Theme.Core.paddingFactor,
				padding: deviceWidth * 0.05,
				alignItems: 'flex-start',
				justifyContent: 'center',
				...Theme.Core.shadow,
				borderRadius: 2,
			},
			label: {
				position: 'absolute',
				color: '#e26901',
				fontSize,
				top: deviceWidth * 0.04,
				left: 18 + (fontSize * 0.5),
			},
			iconSize,
			icon: {
				position: 'absolute',
				top: 10 + (Platform.OS === 'android' ? deviceWidth * 0.125 : deviceWidth * 0.1),
				left: 15 + (fontSize * 0.5),
			},
		};
	}
}

export default LabelBox;

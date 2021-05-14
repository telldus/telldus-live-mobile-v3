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
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { Text, View } from '../../../../BaseComponents';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

type Props = PropsThemedComponent & {
	day: string,
	isSelected: boolean,
	onPress?: (index: number) => void,
	appLayout: Object,
	intl: Object,
};

class Day extends View<null, Props, null> {

	static propTypes = {
		day: PropTypes.string.isRequired,
		isSelected: PropTypes.bool.isRequired,
		onPress: PropTypes.func,
	};

	handlePress = () => {
		this.props.onPress(this.props.day);
	};

	render(): React$Element<any> {
		const { day, onPress, appLayout, intl, isSelected } = this.props;
		const { container, name } = this._getStyle(appLayout);
		const labelIfActive = isSelected ? `, ${intl.formatMessage(i18n.labelActive)}` : '';
		const accessibilityLabel = `${day}, ${labelIfActive}`;

		return (
			<TouchableOpacity onPress={this.handlePress} disabled={!onPress} style={container} accessibilityLabel={accessibilityLabel}>
				<Text style={name}>
					{day.charAt(0).toUpperCase()}
				</Text>
			</TouchableOpacity>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const {
			isSelected,
			colors,
		} = this.props;

		const {
			inAppBrandSecondary,
		} = colors;

		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const {
			inactiveGray,
			fontSizeFactorFive,
		} = Theme.Core;

		const size = deviceWidth * 0.101333333;
		const backgroundColor = isSelected ? inAppBrandSecondary : inactiveGray;

		return {
			container: {
				backgroundColor,
				alignItems: 'center',
				justifyContent: 'center',
				height: size,
				width: size,
			},
			name: {
				backgroundColor: 'transparent',
				color: '#fff',
				fontSize: deviceWidth * fontSizeFactorFive,
			},
		};
	};
}

export default (withTheme(Day): Object);

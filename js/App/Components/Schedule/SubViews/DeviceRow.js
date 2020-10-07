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
import { BlockIcon, Row, View } from '../../../../BaseComponents';
import TextRowWrapper from './TextRowWrapper';
import Title from './Title';

import { getDeviceIcons } from '../../../Lib/DeviceUtils';
import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

import i18n from '../../../Translations/common';

type Props = PropsThemedComponent & {
	row: Object,
	onPress?: Function,
	containerStyle?: Object,
	appLayout: Object,
	labelPostScript?: string,
};

class DeviceRow extends View<null, Props, null> {

	static propTypes = {
		row: PropTypes.object.isRequired,
		onPress: PropTypes.func,
		containerStyle: PropTypes.object,
	};

	render(): React$Element<any> {
		const { row, onPress, appLayout, intl, labelPostScript = '', containerStyle } = this.props;
		const { row: rowStyle, icon: iconStyle, iconContainer, descriptionContainer, titleStyle } = this._getStyle(appLayout);
		const { name, deviceType } = row;
		const deviceName = name ? name : intl.formatMessage(i18n.noName);
		const accessibilityLabel = `${deviceName}, ${labelPostScript}`;
		const icon = getDeviceIcons(deviceType);

		return (
			<Row layout="row" row={row} onPress={onPress} style={rowStyle} containerStyle={containerStyle}
				accessible={true} accessibilityLabel={accessibilityLabel} importantForAccessibility={'yes'}>
				<BlockIcon
					icon={icon}
					style={iconStyle}
					containerStyle={iconContainer}
					blockLevel={13}
				/>
				<TextRowWrapper appLayout={appLayout} style={descriptionContainer}>
					<Title numberOfLines={1} ellipsizeMode="tail" appLayout={appLayout} style={titleStyle}>
						{deviceName}
					</Title>
				</TextRowWrapper>
			</Row>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const {
			colors,
		} = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const iconSize = deviceWidth * 0.06;
		const containerSize = deviceWidth * 0.09;
		const borderRadius = deviceWidth * 0.045;

		return {
			row: {
				flex: 1,
				alignItems: 'center',
				paddingVertical: 2 + Math.floor(iconSize * 0.3),
				paddingHorizontal: 5 + Math.floor(iconSize * 0.55),
				justifyContent: 'center',
			},
			icon: {
				fontSize: iconSize,
				textAlign: 'center',
				alignSelf: 'center',
				borderRadius: borderRadius,
			},
			iconContainer: {
				width: containerSize,
				height: containerSize,
				borderRadius: borderRadius,
				alignItems: 'center',
				justifyContent: 'center',
			},
			descriptionContainer: {
				flex: 1,
				paddingLeft: 10,
				paddingRight: 10,
			},
			titleStyle: {
				color: colors.textSix,
			},
		};
	};

}

export default withTheme(DeviceRow);

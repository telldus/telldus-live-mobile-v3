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

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	row: Object,
	onPress?: Function,
	containerStyle?: Object,
	appLayout: Object,
	labelPostScript?: string,
};

export default class DeviceRow extends View<null, Props, null> {

	static propTypes = {
		row: PropTypes.object.isRequired,
		onPress: PropTypes.func,
		containerStyle: PropTypes.object,
	};

	render(): React$Element<any> {
		const { row, onPress, appLayout, intl, labelPostScript = '', containerStyle } = this.props;
		const { row: rowStyle, icon: iconStyle, iconContainer, descriptionContainer } = this._getStyle(appLayout);
		const { name, deviceType } = row;
		const deviceName = name ? name : intl.formatMessage(i18n.noName);
		const accessibilityLabel = `${deviceName}, ${labelPostScript}`;
		const icon = getDeviceIcons(deviceType);

		return (
			<Row layout="row" row={row} onPress={onPress} style={rowStyle} containerStyle={containerStyle} accessible={true} accessibilityLabel={accessibilityLabel}>
				<BlockIcon
					icon={icon}
					style={iconStyle}
					containerStyle={iconContainer}
				/>
				<TextRowWrapper appLayout={appLayout} style={descriptionContainer}>
					<Title numberOfLines={1} ellipsizeMode="tail" appLayout={appLayout}>
						{deviceName}
					</Title>
				</TextRowWrapper>
			</Row>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const { borderRadiusRow, brandSecondary } = Theme.Core;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const iconSize = deviceWidth * 0.06;
		const containerSize = deviceWidth * 0.1;
		const borderRadius = deviceWidth * 0.05;

		return {
			row: {
				flex: 1,
				alignItems: 'stretch',
				paddingVertical: Math.floor(iconSize * 0.5),
				paddingHorizontal: Math.floor(iconSize * 0.8),
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
				backgroundColor: brandSecondary,
			},
			descriptionContainer: {
				flex: 1,
				paddingLeft: 10,
				paddingRight: 10,
			},
			// borderTopLeftRadius: borderRadiusRow,
			// 	borderBottomLeftRadius: borderRadiusRow,
		};
	};

}

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
 * along with Telldus Live! app.  If not, see <http://www.gnu.
 * org/licenses/>.
 */

// @flow

'use strict';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
	View,
	Text,
	IconTelldus,
	RippleButton,
} from '../../../../BaseComponents';

import shouldUpdate from '../../../Lib/shouldUpdate';

import Theme from '../../../Theme';

type Props = {
	legendData: Array<any>,
	appLayout: Object,
	onPressToggleView: () => void,
	onPressResetChartView: () => void,
	fullscreen: boolean,
};

export default class ChartLegend extends View<Props, null> {
	props: Props;
	constructor(props: Props) {
		super(props);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const propsChange = shouldUpdate(this.props, nextProps, [
			'legendData', 'appLayout', 'fullscreen',
		]);
		if (propsChange) {
			return propsChange;
		}
		return false;
	}

	render(): Object | null {
		const { legendData, appLayout, onPressToggleView, onPressResetChartView, fullscreen } = this.props;
		const { rowTextColor } = Theme.Core;
		const {
			containerStyle,
			labelContainerStyle,
			iconStyle,
			labelStyle,
			fontSizeFullscreenIcon,
			legendsContainerStyle,
			btnContainerIconStyle,
		} = this.getStyles(appLayout);

		return (
			<View style={containerStyle}>
				<View style={legendsContainerStyle}>
					{legendData.map((item: Object, index: number): Object | null => {
						const { icon, onPress, value, color } = item;
						if (!value) {
							return null;
						}
						return (
							<RippleButton
								key={index}
								style={labelContainerStyle}
								onPress={onPress}>
								<IconTelldus icon={icon} style={{ ...iconStyle, color }} />
								<Text style={[labelStyle, { color }]} numberOfLines={1}>
									{value}
								</Text>
							</RippleButton>
						);
					})
					}
				</View>
				<View style={[btnContainerIconStyle]}>
					<TouchableOpacity onPress={onPressToggleView}>
						<Icon name={fullscreen ? 'fullscreen-exit' : 'fullscreen'} size={fontSizeFullscreenIcon} color={rowTextColor} />
					</TouchableOpacity>
					{!fullscreen &&
						<TouchableOpacity onPress={onPressResetChartView}>
							<IconTelldus icon={'resetzoom'} style={{ fontSize: fontSizeFullscreenIcon - 4, color: rowTextColor }} />
						</TouchableOpacity>
					}
				</View>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSizeLabel = deviceWidth * 0.038;
		const fontSizeIcon = deviceWidth * 0.06;
		const fontSizeFullscreenIcon = deviceWidth * 0.07;

		return {
			containerStyle: {
				flex: 0,
				flexDirection: 'row',
				marginTop: 20,
				marginLeft: 10,
				paddingBottom: 20,
			},
			legendsContainerStyle: {
				flex: 1,
				flexDirection: 'row',
			},
			labelContainerStyle: {
				flex: 1,
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				marginRight: 10,
			},
			iconStyle: {
				fontSize: fontSizeIcon,
				marginRight: 5,
			},
			labelStyle: {
				flex: 1,
				fontSize: fontSizeLabel,
			},
			btnContainerIconStyle: {
				flex: 0,
				padding: 0,
				width: 30,
				height: 40,
				alignItems: 'center',
				justifyContent: 'center',
			},
			fontSizeFullscreenIcon,
		};
	}
}

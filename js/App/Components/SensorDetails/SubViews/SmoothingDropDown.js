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
import { Dropdown } from 'react-native-material-dropdown';
import Ripple from 'react-native-material-ripple';

import { View, Text, IconTelldus, FormattedMessage } from '../../../../BaseComponents';

import shouldUpdate from '../../../Lib/shouldUpdate';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	smoothing: boolean,

	intl: Object,
	onValueChange: (string, number, Array<any>) => void,
};

export default class SmoothingDropDown extends View<Props, null> {
	props: Props;
	renderBase: () => Object;
	constructor(props: Props) {
		super(props);

		const { formatMessage } = this.props.intl;
		this.on = formatMessage(i18n.on);
		this.off = formatMessage(i18n.off);
		this.Options = [{ key: true, value: this.on }, { key: false, value: this.off }];
		this.renderBase = this.renderBase.bind(this);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(this.props, nextProps, ['smoothing', 'appLayout']);
	}

	renderBase(items: Object): Object {
		const { title } = items;
		const { appLayout } = this.props;

		const {
			pickerBaseCoverStyle,
			pickerBaseTextStyle,
			rightIconStyle,
		} = this.getStyle(appLayout);
		const { rippleColor, rippleDuration, rippleOpacity } = Theme.Core;

		return (
			<Ripple
				rippleColor={rippleColor}
				rippleOpacity={rippleOpacity}
				rippleDuration={rippleDuration}
				style={pickerBaseCoverStyle}
				onPress={this.onPressPickerOne}>
				<Text style={pickerBaseTextStyle} numberOfLines={1}>
					{title}
				</Text>
				<IconTelldus icon={'down'} style={rightIconStyle}/>
			</Ripple>
		);
	}

	render(): Object {
		const { appLayout, smoothing, onValueChange } = this.props;
		const {
			pickerContainerStyle,
			fontSize,
			rowTextColor,
			itemPadding,
			itemCount,
			dropDownHeaderStyle,
			dropDownContainerStyle,
			dropDownListsContainerStyle,
		} = this.getStyle(appLayout);
		const itemSize = Math.ceil(fontSize * 1.5 + itemPadding * 2);
		const iCount = this.Options.length < itemCount ? this.Options.length : itemCount;
		const dropdownTop = -(iCount * itemSize);
		return (
			<View style={dropDownContainerStyle}>
				<FormattedMessage {...i18n.labelSmoothing} style={dropDownHeaderStyle}/>
				<View style={dropDownListsContainerStyle}>
					<Dropdown
						data={this.Options}
						value={smoothing ? this.on : this.off}
						onChangeText={onValueChange}
						renderBase={this.renderBase}
						containerStyle={pickerContainerStyle}
						fontSize={fontSize}
						itemCount={iCount}
						itemPadding={itemPadding}
						baseColor={'#000'}
						itemColor={'#000'}
						selectedItemColor={rowTextColor}
						dropdownPosition={0}
						dropdownOffset={{
							top: dropdownTop,
							left: 0,
						}}
					/>
				</View>
			</View>
		);
	}
	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { shadow, paddingFactor, rowTextColor, inactiveTintColor, brandDanger, brandInfo } = Theme.Core;

		const padding = deviceWidth * paddingFactor;
		const outerPadding = padding * 2;
		const pickerItemsWidth = width - outerPadding;

		const fontSizeText = deviceWidth * 0.04;
		const fontSizeRightIcon = deviceWidth * 0.04;

		const itemCount = 4;
		const itemPadding = 8;

		return {
			dropDownContainerStyle: {
				flex: 0,
				alignItems: 'flex-start',
			},
			dropDownHeaderStyle: {
				marginLeft: padding / 2,
				color: inactiveTintColor,
				fontSize: fontSizeText * 1.2,
				marginBottom: (fontSizeText * 0.5),
			},
			dropDownListsContainerStyle: {
				flex: 0,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
			},
			pickerContainerStyle: {
				width: pickerItemsWidth,
				...shadow,
				marginLeft: padding / 2,
				marginBottom: padding / 2,
				backgroundColor: '#fff',
			},
			pickerBaseCoverStyle: {
				width: pickerItemsWidth,
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				padding: 5 + (fontSizeText * 0.4),
			},
			pickerBaseTextStyle: {
				flex: 1,
				fontSize: fontSizeText,
				color: rowTextColor,
				marginRight: (fontSizeText * 0.4),
			},
			rightIconStyle: {
				fontSize: fontSizeRightIcon,
				color: rowTextColor,
			},
			brandInfo,
			rowTextColor,
			brandDanger,
			fontSize: fontSizeText,
			itemCount,
			itemPadding,
		};
	}
}

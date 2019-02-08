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
import { Dropdown } from 'react-native-material-dropdown';
import Ripple from 'react-native-material-ripple';
import { intlShape, injectIntl } from 'react-intl';

import View from './View';
import Text from './Text';
import IconTelldus from './IconTelldus';

import shouldUpdate from '../App/Lib/shouldUpdate';

import Theme from '../App/Theme';

import i18n from '../App/Translations/common';

type DDMargin = {
	min: number,
	max: number,
};

type Props = {
    appLayout: Object,
    items: Array<Object>,
    value: string,
    label: string,

	fontSize?: number,
	baseColor?: string,
	itemColor?: string,
	selectedItemColor?: string,
	dropdownPosition?: number,
	itemCount?: number,
	itemPadding?: number,
    baseLeftIcon?: string,
	onValueChange: (string, number, Array<any>) => void,
    pickerContainerStyle: Array<any> | number | Object,
    dropDownHeaderStyle: Array<any> | number | Object,
    dropDownContainerStyle: Array<any> | number | Object,
	dropDownListsContainerStyle: Array<any> | number | Object,
	accessibilityLabelPrefix?: string,
	intl: intlShape.isRequired,
	pickerStyle?: Array<any> | number | Object,
	overlayStyle?: Array<any> | number | Object,
	dropdownMargins?: DDMargin,
};

type DefaultProps = {
	baseLeftIcon: string,
	baseColor: string,
	itemColor: string,
	selectedItemColor: string,
	dropdownPosition: number,
	itemCount: number,
	itemPadding: number,
};

type State = {
};

class DropDown extends Component<Props, State> {
props: Props;
state: State = {
};
static defaultProps: DefaultProps = {
	baseLeftIcon: 'down',
	baseColor: '#000',
	itemColor: '#000',
	selectedItemColor: Theme.Core.rowTextColor,
	dropdownPosition: 0,
	itemCount: 4,
	itemPadding: 8,
};
	renderBase: () => Object;
	onPressPicker: () => void;
	phraseOne: string;
	phraseTwo: string;
	phraseThree: string;
	constructor(props: Props) {
		super(props);

		this.renderBase = this.renderBase.bind(this);
		this.onPressPicker = this.onPressPicker.bind(this);

		const { accessibilityLabelPrefix = '', intl } = this.props;
		this.phraseOne = `${accessibilityLabelPrefix} ${intl.formatMessage(i18n.labelDropdown)}`;
		this.phraseTwo = intl.formatMessage(i18n.labelSelected);
		this.phraseThree = intl.formatMessage(i18n.defaultDescriptionButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const propsChange = shouldUpdate(this.props, nextProps, ['value', 'appLayout', 'label']);
		if (propsChange) {
			return true;
		}
		if (this.props.items.length !== nextProps.items.length) {
			return true;
		}
		return false;
	}

	onPressPicker() {
		this.refs.dropdown.focus();
	}

	renderBase(items: Object): Object {
		const { title } = items;
		const { appLayout, baseLeftIcon, baseColor } = this.props;

		const {
			pickerBaseCoverStyle,
			pickerBaseTextStyle,
			rightIconStyle,
		} = this.getStyle(appLayout);
		const { rippleColor, rippleOpacity } = Theme.Core;
		const accessibilityLabel = `${this.phraseOne}, ${this.phraseTwo} ${title}, ${this.phraseThree}`;

		return (
			<Ripple
				rippleColor={rippleColor}
				rippleOpacity={rippleOpacity}
				rippleDuration={250}
				style={pickerBaseCoverStyle}
				onPress={this.onPressPicker}
				accessible={true}
				accessibilityLabel={accessibilityLabel}>
				<Text style={[pickerBaseTextStyle, {color: baseColor}]} numberOfLines={1}>
					{title}
				</Text>
				<IconTelldus icon={baseLeftIcon} accessible={false} style={rightIconStyle}/>
			</Ripple>
		);
	}

	render(): Object {
		const {
			appLayout,
			onValueChange,
			items,
			value,
			label,
			pickerContainerStyle,
			dropDownHeaderStyle,
			dropDownContainerStyle,
			dropDownListsContainerStyle,
			dropdownPosition,
			selectedItemColor,
			itemColor,
			baseColor,
			itemPadding = 8,
			itemCount = 4,
			pickerStyle,
			overlayStyle,
			dropdownMargins,
		} = this.props;
		const {
			pickerContainerStyleDef,
			fontSize,
			dropDownHeaderStyleDef,
			dropDownContainerStyleDef,
			dropDownListsContainerStyleDef,
		} = this.getStyle(appLayout);
		const itemSize = Math.ceil(fontSize * 1.5 + itemPadding * 2);
		const iCount = items.length < itemCount ? items.length : itemCount;
		const dropdownTop = -(iCount * itemSize);

		return (
			<View style={[dropDownContainerStyleDef, dropDownContainerStyle]}>
				{!!label && (
					<Text style={[dropDownHeaderStyleDef, dropDownHeaderStyle]}>
						{label}
					</Text>
				)}
				<View style={[dropDownListsContainerStyleDef, dropDownListsContainerStyle]}>
					<Dropdown
						ref={'dropdown'}
						data={items}
						value={value}
						onChangeText={onValueChange}
						renderBase={this.renderBase}
						containerStyle={[pickerContainerStyleDef, pickerContainerStyle]}
						pickerStyle={pickerStyle}
						overlayStyle={overlayStyle}
						fontSize={fontSize}
						itemCount={iCount}
						itemPadding={itemPadding}
						baseColor={baseColor}
						itemColor={itemColor}
						selectedItemColor={selectedItemColor}
						dropdownPosition={dropdownPosition}
						dropdownOffset={{
							top: dropdownTop,
							left: 0,
						}}
						dropdownMargins={dropdownMargins}
					/>
				</View>
			</View>
		);
	}
	getStyle(appLayout: Object): Object {
		const { fontSize } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { shadow, paddingFactor, rowTextColor, inactiveTintColor, brandDanger, brandInfo } = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		const fontSizeText = fontSize ? fontSize : deviceWidth * 0.04;
		const fontSizeRightIcon = deviceWidth * 0.04;

		return {
			dropDownContainerStyleDef: {
				flex: 0,
				alignItems: 'flex-start',
			},
			dropDownHeaderStyleDef: {
				color: inactiveTintColor,
				fontSize: fontSizeText * 1.2,
				marginBottom: 5,
			},
			dropDownListsContainerStyleDef: {
				flex: 0,
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
			},
			pickerContainerStyleDef: {
				flex: 1,
				...shadow,
				marginBottom: padding / 2,
				backgroundColor: '#fff',
			},
			pickerBaseCoverStyle: {
				flex: 1,
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				padding: fontSizeText,
			},
			pickerBaseTextStyle: {
				flex: 1,
				fontSize: fontSizeText,
				color: rowTextColor,
				marginRight: fontSizeText,
			},
			rightIconStyle: {
				fontSize: fontSizeRightIcon,
				color: rowTextColor,
			},
			brandInfo,
			rowTextColor,
			brandDanger,
			fontSize: fontSizeText,
		};
	}
}

export default injectIntl(DropDown);

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

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    selectedOne: Object,
	selectedTwo: Object,
	list: Array<string>,
    onValueChangeOne: (itemValue: string, itemIndex: number, data: Array<Object>) => void,
	onValueChangeTwo: (itemValue: string, itemIndex: number, data: Array<Object>) => void,
	appLayout: Object,
	intl: Object,
};

type State = {
};

class GraphValuesDropDown extends View<Props, State> {
	props: Props;
	state: State;

	renderBaseOne: (Object) => Object;
	renderBaseTwo: (Object) => Object;
	onPressPickerOne: () => void;
	onPressPickerTwo: () => void;

	propsExtractorOne: (Object, number) => Object;
	propsExtractorTwo: (Object, number) => Object;

	onValueChangeOne: (itemValue: string, itemIndex: number, data: Array<Object>) => void;
	onValueChangeTwo: (itemValue: string, itemIndex: number, data: Array<Object>) => void;

	constructor(props: Props) {
		super(props);
		this.state = {
		};

		this.renderBaseOne = this.renderBaseOne.bind(this);
		this.renderBaseTwo = this.renderBaseTwo.bind(this);
		this.onPressPickerOne = this.onPressPickerOne.bind(this);
		this.onPressPickerTwo = this.onPressPickerTwo.bind(this);
		this.propsExtractorTwo = this.propsExtractorTwo.bind(this);
		this.propsExtractorOne = this.propsExtractorOne.bind(this);

		this.onValueChangeOne = this.onValueChangeOne.bind(this);
		this.onValueChangeTwo = this.onValueChangeTwo.bind(this);

		const { intl } = this.props;
		this.phraseOne = `${intl.formatMessage(i18n.labelGraphValues)} ${intl.formatMessage(i18n.labelDropdown)}`;
		this.phraseTwo = props.intl.formatMessage(i18n.labelSelected);
		this.phraseThree = props.intl.formatMessage(i18n.defaultDescriptionButton);
	}

	renderBaseOne(items: Object): Object {
		const { data, title } = items;
		const { appLayout } = this.props;

		const {
			pickerBaseCoverStyle,
			pickerBaseTextStyle,
			leftIconStyle,
			rightIconStyle,
		} = this.getStyle(appLayout);
		const { rippleColor, rippleOpacity } = Theme.Core;
		const {icon} = data.find((item: Object): boolean => {
			return item.value === title;
		});

		const accessibilityLabel = `${this.phraseOne}, ${this.phraseTwo} ${title}, ${this.phraseThree}`;

		return (
			<Ripple
				rippleColor={rippleColor}
				rippleOpacity={rippleOpacity}
				rippleDuration={250}
				style={pickerBaseCoverStyle}
				onPress={this.onPressPickerOne}
				accessible={true}
				accessibilityLabel={accessibilityLabel}>
				<IconTelldus icon={icon} style={leftIconStyle} accessible={false}/>
				<Text style={pickerBaseTextStyle} numberOfLines={1}>
					{title}
				</Text>
				<IconTelldus icon={'down'} style={rightIconStyle} accessible={false}/>
			</Ripple>
		);
	}

	onPressPickerOne() {
		this.refs.listOne.focus();
	}

	onPressPickerTwo() {
		this.refs.listTwo.focus();
	}

	onValueChangeOne(itemValue: string, itemIndex: number, data: Array<Object>) {
		this.refs.listOne.blur();
		const { onValueChangeOne } = this.props;
		if (onValueChangeOne) {
			onValueChangeOne(itemValue, itemIndex, data);
		}
	}

	onValueChangeTwo(itemValue: string, itemIndex: number, data: Array<Object>) {
		this.refs.listTwo.blur();
		const { onValueChangeTwo } = this.props;
		if (onValueChangeTwo) {
			onValueChangeTwo(itemValue, itemIndex, data);
		}
	}

	propsExtractorOne(item: Object, index: number): Object {
		const { selectedTwo } = this.props;
		if (selectedTwo.value === item.value) {
			return {
				...item,
				disabled: true,
			};
		}
		return {
			...item,
			disabled: false,
		};
	}

	propsExtractorTwo(item: Object, index: number): Object {
		const { selectedOne } = this.props;
		if (selectedOne.value === item.value) {
			return {
				...item,
				disabled: true,
			};
		}
		return {
			...item,
			disabled: false,
		};
	}

	renderBaseTwo(items: Object): Object {
		const { data, title } = items;
		const { appLayout } = this.props;

		const {
			pickerBaseCoverStyle,
			pickerBaseTextStyle,
			leftIconStyle,
			rightIconStyle,
		} = this.getStyle(appLayout);
		const { rippleColor, rippleOpacity } = Theme.Core;
		const {icon} = data.find((item: Object): boolean => {
			return item.value === title;
		});

		const accessibilityLabel = `${this.phraseOne}, ${this.phraseTwo} ${title}, ${this.phraseThree}`;

		return (
			<Ripple
				rippleColor={rippleColor}
				rippleOpacity={rippleOpacity}
				rippleDuration={250}
				style={pickerBaseCoverStyle}
				onPress={this.onPressPickerTwo}
				accessible={true}
				accessibilityLabel={accessibilityLabel}>
				<IconTelldus icon={icon} style={leftIconStyle} accessible={false}/>
				<Text style={pickerBaseTextStyle} numberOfLines={1}>
					{title}
				</Text>
				<IconTelldus icon={'down'} style={rightIconStyle} accessible={false}/>
			</Ripple>
		);
	}

	render(): Object | null {
		const {
			selectedOne,
			selectedTwo,
			list,
			appLayout,
		} = this.props;

		if (list.length <= 2) {
			return null;
		}

		const {
			dropDownContainerStyle,
			dropDownListsContainerStyle,
			pickerContainerStyle,
			fontSize,
			rowTextColor,
			dropDownHeaderStyle,
			brandDanger,
			brandInfo,
			itemPadding,
			itemCount,
			padding,
		} = this.getStyle(appLayout);
		const itemSize = Math.ceil(fontSize * 1.5 + itemPadding * 2);
		const iCount = list.length < itemCount ? list.length : itemCount;
		const dropdownTop = -(iCount * itemSize);

		return (
			<View style={dropDownContainerStyle}>
				<FormattedMessage {...i18n.labelGraphValues} style={dropDownHeaderStyle}/>
				<View style={dropDownListsContainerStyle}>
					<Dropdown
						ref={'listOne'}
						data={list}
						value={selectedOne.value}
						onChangeText={this.onValueChangeOne}
						renderBase={this.renderBaseOne}
						containerStyle={pickerContainerStyle}
						fontSize={fontSize}
						itemCount={iCount}
						itemPadding={itemPadding}
						baseColor={'#000'}
						itemColor={'#000'}
						disabledItemColor={rowTextColor}
						selectedItemColor={brandDanger}
						dropdownPosition={0}
						dropdownOffset={{
							top: dropdownTop,
							left: 0,
						}}
						dropdownMargins={{
							min: padding,
							max: padding,
						}}
						propsExtractor={this.propsExtractorOne}
					/>
					<Dropdown
						ref={'listTwo'}
						data={list}
						value={selectedTwo.value}
						onChangeText={this.onValueChangeTwo}
						renderBase={this.renderBaseTwo}
						containerStyle={pickerContainerStyle}
						fontSize={fontSize}
						itemCount={iCount}
						itemPadding={itemPadding}
						baseColor={'#000'}
						itemColor={'#000'}
						disabledItemColor={rowTextColor}
						selectedItemColor={brandInfo}
						dropdownPosition={0}
						dropdownOffset={{
							top: dropdownTop,
							left: 0,
						}}
						dropdownMargins={{
							min: padding,
							max: padding,
						}}
						propsExtractor={this.propsExtractorTwo}
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
		const innerPadding = padding / 2;
		const pickerItemsWidth = (width - (outerPadding + innerPadding)) / 2;

		const fontSizeText = deviceWidth * 0.04;
		const fontSizeLeftIcon = deviceWidth * 0.057;
		const fontSizeRightIcon = deviceWidth * 0.04;

		const itemCount = 4;
		const itemPadding = 8;

		return {
			padding,
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
			leftIconStyle: {
				fontSize: fontSizeLeftIcon,
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

module.exports = GraphValuesDropDown;

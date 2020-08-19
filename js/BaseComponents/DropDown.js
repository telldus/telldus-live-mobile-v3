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

import React, {
	Component,
} from 'react';
import { Dropdown } from 'react-native-material-dropdown';
import { intlShape } from 'react-intl';

import View from './View';
import Text from './Text';
import IconTelldus from './IconTelldus';
import RippleButton from './RippleButton';

import shouldUpdate from '../App/Lib/shouldUpdate';

import Theme from '../App/Theme';
import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

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
	extraData?: Object,
	disabled?: boolean,
	dropDownPosition: 'top' | 'bottom',
	dropdownOffsetTopCount?: number,

	fontSize?: number,
	baseColor?: string,
	itemColor?: string,
	selectedItemColor?: string,
	dropdownPosition?: number,
	itemCount?: number,
	itemPadding?: number,
    baseLeftIcon?: string | Object,
	onValueChange: (string, number, Array<any>) => void,
    pickerContainerStyle: Array<any> | Object,
    dropDownHeaderStyle: Array<any> | Object,
    dropDownContainerStyle: Array<any> | Object,
	dropDownListsContainerStyle: Array<any> | Object,
	accessibilityLabelPrefix?: string,
	intl: intlShape.isRequired,
	pickerStyle?: Array<any> | Object,
	overlayStyle?: Array<any> | Object,
	dropdownMargins?: DDMargin,
	pickerBaseCoverStyle?: Array<any> | Object,
	textColor?: string,
	animationDuration?: number,
	pickerBaseTextStyle?: Array<any> | Object,
	iconLeftPickerBase?: Object,
	renderItem?: Function,
	valueExtractor?: Function,
	labelExtractor?: Function,
	itemSize?: number,
};

type PropsDropDownComponent = Props & PropsThemedComponent;

type DefaultProps = {
	baseLeftIcon: string | Object,
	dropdownPosition: number,
	itemCount: number,
	itemPadding: number,
	disabled: boolean,
	dropDownPosition: 'top' | 'bottom',
};

type State = {
};
class DropDown extends Component<PropsDropDownComponent, State> {
props: PropsDropDownComponent;
state: State = {
};
static defaultProps: DefaultProps = {
	baseLeftIcon: 'down',
	dropdownPosition: 0,
	itemCount: 4,
	itemPadding: 8,
	disabled: false,
	dropDownPosition: 'top',
};
	renderBase: () => Object;
	onPressPicker: () => void;
	phraseOne: string;
	phraseTwo: string;
	phraseThree: string;

	blur: Function;

	constructor(props: PropsDropDownComponent) {
		super(props);

		this.renderBase = this.renderBase.bind(this);
		this.onPressPicker = this.onPressPicker.bind(this);

		const { accessibilityLabelPrefix = '', intl } = this.props;
		this.phraseOne = `${accessibilityLabelPrefix} ${intl.formatMessage(i18n.labelDropdown)}`;
		this.phraseTwo = intl.formatMessage(i18n.labelSelected);
		this.phraseThree = intl.formatMessage(i18n.defaultDescriptionButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		const propsChange = shouldUpdate(this.props, nextProps, [
			'value',
			'appLayout',
			'label',
			'extraData',
			'disabled',
			'itemSize',
			'colorScheme',
			'themeInApp',
			'dropdownOffsetTopCount',
		]);
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

	blur = () => {
		this.refs.dropdown.blur();
	}

	renderBase(items: Object): Object {
		const { title } = items;
		const {
			appLayout,
			baseLeftIcon,
			pickerBaseCoverStyle,
			pickerBaseTextStyle,
			disabled,
			iconLeftPickerBase,
			colors,
		} = this.props;

		const {
			pickerBaseCoverStyleDef,
			pickerBaseTextStyleDef,
			rightIconStyle,
		} = this.getStyle(appLayout);
		const accessibilityLabel = `${this.phraseOne}, ${this.phraseTwo} ${title}, ${this.phraseThree}`;

		return (
			<RippleButton
				rippleDuration={250}
				style={[pickerBaseCoverStyleDef, pickerBaseCoverStyle]}
				onPress={this.onPressPicker}
				accessible={true}
				accessibilityLabel={accessibilityLabel}
				disabled={disabled}>
				{React.isValidElement(iconLeftPickerBase) && iconLeftPickerBase}
				<Text style={[pickerBaseTextStyleDef, {
					color: colors.textFour,
				}, pickerBaseTextStyle]} numberOfLines={1}>
					{title}
				</Text>
				{React.isValidElement(baseLeftIcon) ?
					baseLeftIcon
					:
					<IconTelldus
						level={6}
						icon={baseLeftIcon}
						accessible={false}
						style={rightIconStyle}/>
				}
			</RippleButton>
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
			textColor,
			animationDuration,
			disabled,
			renderItem,
			valueExtractor,
			labelExtractor,
			itemSize,
			dropDownPosition,
			colors,
			dropdownOffsetTopCount,
		} = this.props;
		const {
			pickerContainerStyleDef,
			fontSize,
			dropDownHeaderStyleDef,
			dropDownContainerStyleDef,
			dropDownListsContainerStyleDef,
			pickerStyleDef,
		} = this.getStyle(appLayout);
		const _itemSize = itemSize || Math.ceil(fontSize * 1.5 + itemPadding * 2);
		const iCount = items.length < itemCount ? items.length : itemCount;

		const _dropdownOffsetTopCount = typeof dropdownOffsetTopCount === 'number' ? dropdownOffsetTopCount : iCount;
		let dropdownTop = dropDownPosition === 'bottom' ? ((_dropdownOffsetTopCount * _itemSize) - itemPadding) : -(_dropdownOffsetTopCount * _itemSize);

		return (
			<View style={[dropDownContainerStyleDef, dropDownContainerStyle]}>
				{!!label && (
					<Text
						level={2}
						style={[dropDownHeaderStyleDef, dropDownHeaderStyle]}>
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
						pickerStyle={[pickerStyleDef, pickerStyle]}
						overlayStyle={overlayStyle}
						fontSize={fontSize}
						itemCount={iCount}
						itemPadding={itemPadding}
						baseColor={baseColor || colors.textThree}
						itemColor={itemColor || colors.textThree}
						selectedItemColor={selectedItemColor || colors.inActiveTintOne}
						dropdownPosition={dropdownPosition}
						dropdownOffset={{
							top: dropdownTop,
							left: 0,
						}}
						disabled={disabled}
						dropdownMargins={dropdownMargins}
						textColor={textColor}
						animationDuration={animationDuration}
						useNativeDriver={false}
						renderItem={renderItem}
						valueExtractor={valueExtractor}
						labelExtractor={labelExtractor}
					/>
				</View>
			</View>
		);
	}
	getStyle(appLayout: Object): Object {
		const { fontSize, colors } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			card,
		} = colors;

		const { shadow, paddingFactor } = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		const fontSizeText = fontSize ? fontSize : deviceWidth * 0.04;
		const fontSizeRightIcon = deviceWidth * 0.04;

		return {
			pickerStyleDef: {
				width: width - (2 * padding),
				left: padding,
				backgroundColor: card,
			},
			dropDownContainerStyleDef: {
				flex: 0,
				alignItems: 'flex-start',
			},
			dropDownHeaderStyleDef: {
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
				backgroundColor: card,
			},
			pickerBaseCoverStyleDef: {
				flex: 1,
				flexDirection: 'row',
				justifyContent: 'flex-start',
				alignItems: 'center',
				padding: fontSizeText,
			},
			pickerBaseTextStyleDef: {
				flex: 1,
				fontSize: fontSizeText,
				marginRight: fontSizeText,
				textAlignVertical: 'center',
			},
			rightIconStyle: {
				fontSize: fontSizeRightIcon,
			},
			fontSize: fontSizeText,
		};
	}
}

export default withTheme(DropDown);

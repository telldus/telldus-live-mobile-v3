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

import React, { Component } from 'react';
import { Platform } from 'react-native';

import IconTelldus from './IconTelldus';
import View from './View';
import MaterialTextInput from './MaterialTextInput';

import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

import Theme from '../App/Theme';

type Props = PropsThemedComponent & {
    value: string,
	appLayout: Object,
	extraData?: string | number,

	placeholder?: string,
	placeholderTextColor?: string,
    onChangeText: (string) => void,
	containerStyle: Array<any> | Object,
	textStyle: Array<any> | Object,
	iconStyle: Array<any> | Object,
	labelStyle: Array<any> | Object,
    label?: string,
	icon?: string,
	header?: Object,
    onSubmitEditing: () => void,
	onChangeText: (string) => void,
	autoFocus?: boolean,
	setRef: (any) => void,
	keyboardType?: string,
	autoCapitalize?: string,
};

type DefaultProps = {
	value: string,
	placeholderTextColor: string,
	autoFocus: boolean,
	keyboardType: string,
	placeholder: string,
};

class EditBox extends Component<Props, null> {
props: Props;

onChangeText: (string) => void;
onSubmitEditing: () => void;
setRef: (any) => void;

static defaultProps: DefaultProps = {
	value: '',
	placeholder: '',
	placeholderTextColor: Theme.Core.offlineColor,
	autoFocus: true,
	keyboardType: 'default',
};

constructor(props: Props) {
	super();

	this.onChangeText = this.onChangeText.bind(this);
	this.onSubmitEditing = this.onSubmitEditing.bind(this);
	this.setRef = this.setRef.bind(this);
}

shouldComponentUpdate(nextProps: Object): boolean {
	const { appLayout, value, extraData } = this.props;
	return (nextProps.value !== value) || (nextProps.appLayout.width !== appLayout.width) || extraData !== nextProps.extraData;
}

onSubmitEditing() {
	const { onSubmitEditing } = this.props;
	if (onSubmitEditing) {
		onSubmitEditing();
	}
}

onChangeText(value: string) {
	const { onChangeText } = this.props;
	if (onChangeText) {
		onChangeText(value);
	}
}

setRef(ref: any) {
	const { setRef } = this.props;
	if (setRef && typeof setRef === 'function') {
		setRef(ref);
	}
}

render(): Object {
	const {
		value,
		containerStyle,
		label,
		icon,
		appLayout,
		header,
		placeholder,
		placeholderTextColor,
		autoFocus,
		textStyle,
		iconStyle,
		labelStyle,
		keyboardType,
		autoCapitalize = 'sentences',
	} = this.props;
	const styles = this.getStyle(appLayout);

	return (
		<View
			level={2}
			style={[styles.container, containerStyle]}>
			{!!header && header}
			<View style={styles.inputCover}>
				<MaterialTextInput
					value={value}
					label={label}
					labelFontSize={styles.label.fontSize}
					labelTextStyle={[styles.label, labelStyle]}
					style={[styles.textField, textStyle]}
					onChangeText={this.onChangeText}
					onSubmitEditing={this.onSubmitEditing}
					autoCapitalize={autoCapitalize}
					autoCorrect={false}
					autoFocus={autoFocus}
					baseColor={styles.baseColorFour}
					tintColor={styles.baseColorFour}
					returnKeyType={'done'}
					placeholder={placeholder}
					placeholderTextColor={placeholderTextColor}
					setRef={this.setRef}
					keyboardType={keyboardType}
					labelOffset={{
						x0: 5,
						y0: 0,
						x1: 0,
						y1: -5,
					}}
					renderLeftAccessory={!!icon && (
						<IconTelldus icon={icon} style={[styles.icon, iconStyle]}/>
					)}
				/>
			</View>
		</View>
	);
}

getStyle(appLayout: Object): Object {
	const {
		colors,
	} = this.props;
	const {
		baseColorFour,
	} = colors;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		shadow,
		editBoxPaddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);
	const iconSize = Math.floor(deviceWidth * 0.09);

	const fontSizeText = deviceWidth * 0.06;
	const padding = deviceWidth * editBoxPaddingFactor;

	return {
		baseColorFour,
		container: {
			width: '100%',
			flexDirection: 'column',
			alignItems: 'flex-start',
			justifyContent: 'center',
			padding,
			...shadow,
			borderRadius: 2,
		},
		inputCover: {
			width: '100%',
			alignItems: 'flex-start',
			justifyContent: 'center',
			marginTop: Platform.OS === 'ios' ? 10 : 0,
		},
		label: {
			color: baseColorFour,
			fontSize,
		},
		icon: {
			textAlign: 'left',
			fontSize: iconSize,
			color: '#A59F9A',
		},
		textField: {
			color: '#A59F9A',
			fontSize: fontSizeText,
			paddingLeft: 3,
		},
	};
}
}

export default (withTheme(EditBox): Object);

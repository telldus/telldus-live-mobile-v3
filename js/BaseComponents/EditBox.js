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
import { Platform, TextInput } from 'react-native';

import IconTelldus from './IconTelldus';
import Text from './Text';
import View from './View';

import Theme from '../App/Theme';

type Props = {
    value: string,
	appLayout: Object,
	extraData?: string | number,

	placeholder?: string,
	placeholderTextColor?: string,
    onChangeText: (string) => void,
    containerStyle: number | Object | Array<any>,
    label?: string,
	icon?: string,
	header?: Object,
    onSubmitEditing: () => void,
	onChangeText: (string) => void,
	autoFocus?: boolean,
	setRef: (any) => void,
};

type DefaultProps = {
	value: string,
	placeholderTextColor: string,
	autoFocus: boolean,
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
	const { value, containerStyle, label, icon, appLayout, header, placeholder, placeholderTextColor, autoFocus } = this.props;
	const styles = this.getStyle(appLayout);

	return (
		<View style={[styles.container, containerStyle]}>
			{!!header && header}
			{!!label && (
				<Text style={styles.label}>
					{label}
				</Text>
			)}
			<View style={styles.inputCover}>
				{!!icon && (
					<IconTelldus icon={icon} size={styles.iconSize} color={'#A59F9A'} style={styles.icon}/>
				)}
				<TextInput
					value={value}
					style={styles.textField}
					onChangeText={this.onChangeText}
					onSubmitEditing={this.onSubmitEditing}
					autoCapitalize="sentences"
					autoCorrect={false}
					autoFocus={autoFocus}
					underlineColorAndroid={Theme.Core.brandSecondary}
					returnKeyType={'done'}
					placeholder={placeholder}
					placeholderTextColor={placeholderTextColor}
					ref={this.setRef}
				/>
			</View>
		</View>
	);
}

getStyle(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { shadow, brandSecondary, editBoxPaddingFactor } = Theme.Core;

	const fontSize = Math.floor(deviceWidth * 0.045);
	const iconSize = Math.floor(deviceWidth * 0.09);

	const fontSizeText = deviceWidth * 0.06;
	const padding = deviceWidth * editBoxPaddingFactor;

	return {
		container: {
			width: '100%',
			flexDirection: 'column',
			alignItems: 'flex-start',
			justifyContent: 'center',
			backgroundColor: '#fff',
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
			color: brandSecondary,
			fontSize,
		},
		iconSize,
		icon: {
			position: 'absolute',
			textAlign: 'left',
		},
		textField: {
			width: '100%',
			color: '#A59F9A',
			fontSize: fontSizeText,
			paddingLeft: iconSize + 8,
		},
	};
}
}

export default EditBox;

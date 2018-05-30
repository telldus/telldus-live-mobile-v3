/**
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
import { TextInput, Platform } from 'react-native';

import { View, Text, IconTelldus } from '../../../../BaseComponents';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,
    intl: Object,
    icon: string,
    value: string,
    onValueChange: (number) => void,
};

type State = {
    value: string,
};

export default class TimeField extends View<Props, State> {
props: Props
onEdit: (string) => void;

constructor(props: Props) {
	super(props);
	const { intl, value } = this.props;
	const { formatMessage } = intl;
	this.minutes = formatMessage(i18n.minutes);

	this.state = {
		value: value === '0' ? '' : value,
	};
	this.onEdit = this.onEdit.bind(this);
}

onEdit(value: string) {
	this.setState({
		value,
	});
	const newValue = value === '' ? 0 : parseInt(value, 10);
	const { onValueChange } = this.props;
	if (onValueChange) {
		onValueChange(newValue);
	}
}

render(): Object {
	const { appLayout, icon } = this.props;
	const { value } = this.state;

	const {
		container,
		inputStyle,
		iconStyle,
		labelStyle,
	} = this.getStyles(appLayout);

	return (
		<View style={container}>
			<Text style={labelStyle}>
				{this.minutes}
			</Text>
			<IconTelldus icon={icon} color={'#D9D5DC'} style={iconStyle}/>
			<TextInput
				style={inputStyle}
				underlineColorAndroid={Theme.Core.brandSecondary}
				autoFocus
				value={value}
				onChangeText={this.onEdit}
				autoCapitalize="none"
				autoCorrect={false}
				keyboardType="numeric"/>
		</View>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const inputFontSize = deviceWidth * 0.04;
	const labelFontSize = deviceWidth * 0.035;
	const iconFontSize = deviceWidth * 0.054;

	return {
		container: {
			flex: 1,
			marginLeft: deviceWidth * 0.045,
		},
		inputStyle: {
			flex: 1,
			fontSize: inputFontSize,
			paddingLeft: 5 + (inputFontSize * 2.5),
			color: '#000000',
		},
		iconStyle: {
			position: 'absolute',
			bottom: Platform.OS === 'android' ? deviceWidth * 0.045 : deviceWidth * 0.002,
			fontSize: iconFontSize,
			left: 0,
		},
		labelStyle: {
			fontSize: labelFontSize,
			color: Theme.Core.brandSecondary,
			marginBottom: 5 + (inputFontSize * 0.2),
		},
	};
}
}

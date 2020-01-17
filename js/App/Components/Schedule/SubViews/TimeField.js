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
import { Platform, InteractionManager } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import {
	View,
	IconTelldus,
	MaterialTextInput,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,
    intl: Object,
    icon: string,
    value: string,
	onValueChange: (number) => void,
	max: number,
	min: number,
	autoFocus?: boolean,

	onFocus: () => void,
	setRef: (any) => void,
	onSubmitEditing: () => void,
};

type State = {
    value: string,
};

export default class TimeField extends View<Props, State> {
props: Props
onEdit: (string) => void;
setRef: (any) => void;
onFocus: () => void;

constructor(props: Props) {
	super(props);
	const { intl, value } = this.props;
	const { formatMessage } = intl;
	this.minutes = formatMessage(i18n.minutes);

	this.state = {
		value: value === '0' ? '' : value,
	};
	this.onEdit = this.onEdit.bind(this);
	this.setRef = this.setRef.bind(this);
	this.input = null;

	this.onFocus = this.onFocus.bind(this);

	const brand = DeviceInfo.getBrand() || '';
	const isSamsung = brand.trim().toLowerCase() === 'samsung';
	this.keyboardType = Platform.OS === 'ios' ? 'numbers-and-punctuation' : isSamsung ? 'default' : 'decimal-pad';
}

componentDidMount() {
	InteractionManager.runAfterInteractions(() => {
		if (this.input && this.props.autoFocus) {
			this.input.focus();
		}
	});
}

setRef(ref: any) {
	this.input = ref;
	const { setRef } = this.props;
	if (setRef) {
		setRef(ref);
	}
}

onEdit(value: string) {
	const { onValueChange, max, min } = this.props;

	let newValue = value === '' ? 0 : parseInt(value, 10);
	let acceptValue = (newValue <= max) && (newValue >= min);

	// A work around to accept negative values, 'parseInt' return 'NaN' on giving hyphen(-).
	if (value === '-') {
		acceptValue = true;
		newValue = 0;
	}

	if (acceptValue) {
		this.setState({
			value,
		});
		if (onValueChange) {
			onValueChange(newValue);
		}
	} else {
		const { value: prevValue } = this.state;
		this.setState({
			value: prevValue,
		});
	}
}

onFocus = () => {
	const { onFocus } = this.props;
	if (onFocus) {
		onFocus();
	}
}

onSubmitEditing = () => {
	const { onSubmitEditing } = this.props;
	if (onSubmitEditing) {
		onSubmitEditing();
	}
}

render(): Object {
	const { appLayout, icon } = this.props;
	const { value } = this.state;

	const {
		container,
		inputStyle,
		iconStyle,
	} = this.getStyles(appLayout);

	return (
		<View style={container}>
			<MaterialTextInput
				label={this.minutes}
				style={inputStyle}
				baseColor={Theme.Core.brandSecondary}
				tintColor={Theme.Core.brandSecondary}
				autoFocus={false}
				value={value}
				onChangeText={this.onEdit}
				autoCapitalize="characters"
				autoCorrect={false}
				keyboardType={this.keyboardType}
				ref={this.setRef}
				onFocus={this.onFocus}
				blurOnSubmit={true}
				onSubmitEditing={this.onSubmitEditing}
				labelOffset={{
					x0: 5,
					y0: 0,
					x1: 0,
					y1: -5,
				}}
				renderLeftAccessory={<IconTelldus icon={icon} color={'#D9D5DC'} style={iconStyle}/>}/>
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
			fontSize: inputFontSize,
			paddingLeft: 5 + (inputFontSize * 2.5),
			color: '#000000',
		},
		iconStyle: {
			fontSize: iconFontSize,
		},
		labelStyle: {
			fontSize: labelFontSize,
			color: Theme.Core.brandSecondary,
			marginBottom: Platform.OS === 'android' ? 0 : inputFontSize,
		},
	};
}
}

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
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import Base from './Base';
import Text from './Text';
import IconTelldus from './IconTelldus';

import Theme from '../App/Theme';

type Props = {
    style?: Array<any> | Object | number,
    iconStyle?: Object,
    textStyle?: Array<any> | Object | number,
    onToggleCheckBox: (boolean) => void,
    isChecked: boolean,
    text?: string,
    appLayout: Object,
};

type DefaultProps = {
    isChecked: boolean,
};

class CheckBoxIconText extends Base {

    onToggleCheckBox: () => void;

static defaultProps: DefaultProps = {
	isChecked: false,
	checkBoxColor: '#fff',
};
constructor(props: Props) {
	super(props);
	this.onToggleCheckBox = this.onToggleCheckBox.bind(this);
}

onToggleCheckBox() {
	const { onToggleCheckBox } = this.props;
	if (onToggleCheckBox) {
		onToggleCheckBox();
	}
}

render(): Object {
	const {
		style,
		iconStyle,
		textStyle,
		text,
		isChecked,
		appLayout,
	} = this.props;

	const {
		checkIconStyleActive,
		checkIconStyleInactive,
		textDefaultStyle,
		checkIconCommon,
		container,
	} = this.getStyle(appLayout);

	const checkIconStyle = isChecked ? checkIconStyleActive : checkIconStyleInactive;

	return (
		<TouchableOpacity
			style={[style, container]}
			onPress={this.onToggleCheckBox}>
			<IconTelldus icon={'checkmark'} style={{ ...checkIconCommon, ...checkIconStyle, ...iconStyle }}/>
			{text && (
				<Text style={[textDefaultStyle, textStyle]}>
					{text}
				</Text>
			)}
		</TouchableOpacity>
	);
}

getStyle(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const fontSize = Math.floor(deviceWidth * 0.035);
	const fontSizeIcon = Math.floor(deviceWidth * 0.038);

	return {
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			borderTopLeftRadius: 2,
			borderBottomLeftRadius: 2,
			overflow: 'hidden',
		},
		textDefaultStyle: {
			marginLeft: 5 + (fontSize * 0.4),
			fontSize: fontSize,
			color: '#fff',
			fontFamily: Theme.Core.fonts.robotoLight,
		},
		checkIconCommon: {
			borderWidth: 1,
			fontSize: fontSizeIcon,
			textAlign: 'center',
			textAlignVertical: 'center',
			padding: fontSizeIcon * 0.05,
			borderRadius: 2,
			overflow: 'hidden',
		},
		checkIconStyleActive: {
			color: Theme.Core.brandSecondary,
			backgroundColor: '#fff',
			borderColor: Theme.Core.brandSecondary,
		},
		checkIconStyleInactive: {
			color: 'transparent',
			backgroundColor: 'transparent',
			borderColor: '#fff',
		},
	};
}
}

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
	};
}

export default connect(mapStateToProps, null)(CheckBoxIconText);

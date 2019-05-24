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
import { TouchableOpacity, LayoutAnimation } from 'react-native';

import {
	View,
	Text,
	EditBox,
} from '../../../BaseComponents';

import { LayoutAnimations } from '../../Lib';
import Theme from '../../Theme';
import IconTelldus from '../../../BaseComponents/IconTelldus';

type Props = {
	baseColor: string,
    title: string,
    currentValue: string,
    appLayout: Object,
};

type State = {
	editValue: boolean,
	editBoxValue: string,
};

class ControlInfoBlock extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	this.state = {
		editValue: false,
		editBoxValue: props.currentValue.toString(),
	};
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

onPressEdit = () => {
	this.setState({
		editValue: true,
	});
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

onChangeText = (value: string) => {
	this.setState({
		editBoxValue: value,
	});
}

onSubmitEditing = (value: string) => {
	this.setState({
		editValue: false,
	});
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

render(): Object {

	const {
		baseColor,
		title,
		currentValue,
		appLayout,
	} = this.props;

	const {
		editValue,
		editBoxValue,
	} = this.state;

	const {
		InfoCover,
		infoTitleStyle,
		selectedInfoCoverStyle,
		sValueStyle,
		sUnitStyle,
		cLabelStyle,
		cValueStyle,
		lastUpdatedInfoStyle,
		cUnitStyle,
		editBoxStyle,
		textStyle,
		leftIconStyle,
		labelStyle,
		doneIconStyle,
		doneIconCoverStyle,
	} = this.getStyles();

	return (
		<View style={InfoCover}>
			<Text style={[infoTitleStyle, {
				color: baseColor,
			}]}>
				{title.toUpperCase()}
			</Text>
			<View style={selectedInfoCoverStyle}>
				{editValue ?
					<>
					<EditBox
						value={editBoxValue}
						appLayout={appLayout}
						containerStyle={editBoxStyle}
						textStyle={textStyle}
						labelStyle={labelStyle}
						iconStyle={leftIconStyle}
						icon="temperature"
						label="Temperature"
						onChangeText={this.onChangeText}
						onSubmitEditing={this.onSubmitEditing}/>
						<TouchableOpacity style={doneIconCoverStyle} onPress={this.onSubmitEditing}>
							<IconTelldus icon={'checkmark'} style={doneIconStyle}/>
						</TouchableOpacity>
					</>
					:
					<Text style={{ textAlignVertical: 'center' }} onPress={this.onPressEdit}>
						<Text style={[sValueStyle, {
							color: baseColor,
						}]}>
							{currentValue}
						</Text>
						<Text style={Theme.Styles.hiddenText}>
								!
						</Text>
						<Text style={[sUnitStyle, {
							color: baseColor,
						}]}>
								°C
						</Text>
					</Text>
				}
			</View>
			<Text style={cLabelStyle}>
						Current temperature
			</Text>
			<Text>
				<Text style={cValueStyle}>
							23.3
				</Text>
				<Text style={cUnitStyle}>
							°C
				</Text>
			</Text>
			<Text style={lastUpdatedInfoStyle}>
						Last updated info
			</Text>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		rowTextColor,
		brandSecondary,
	} = Theme.Core;

	return {
		InfoCover: {
			position: 'absolute',
			top: 0,
			left: 0,
			bottom: 0,
			right: 0,
			alignItems: 'center',
			justifyContent: 'center',
		},
		infoTitleStyle: {
			fontSize: deviceWidth * 0.045,
			marginTop: 10,
		},
		selectedInfoCoverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
		},
		sValueStyle: {
			fontSize: deviceWidth * 0.15,
		},
		sUnitStyle: {
			fontSize: deviceWidth * 0.08,
		},
		cLabelStyle: {
			fontSize: deviceWidth * 0.032,
			color: rowTextColor,
			marginTop: 5,
		},
		cValueStyle: {
			fontSize: deviceWidth * 0.06,
			color: rowTextColor,
		},
		cUnitStyle: {
			fontSize: deviceWidth * 0.05,
			color: rowTextColor,
		},
		lastUpdatedInfoStyle: {
			fontSize: deviceWidth * 0.03,
			color: rowTextColor,
		},
		iconSize: deviceWidth * 0.14,
		editBoxStyle: {
			width: deviceWidth * 0.36,
			height: deviceWidth * 0.23,
			elevation: 0,
			shadowColor: 'transparent',
			shadowRadius: 0,
			shadowOpacity: 0,
			shadowOffset: {
				width: 0,
				height: 0,
			},
			padding: deviceWidth * 0.02,
		},
		textStyle: {
			fontSize: deviceWidth * 0.054,
			color: rowTextColor,
		},
		leftIconStyle: {
			fontSize: deviceWidth * 0.1,
			left: -8,
		},
		labelStyle: {
			fontSize: deviceWidth * 0.04,
		},
		doneIconStyle: {
			fontSize: deviceWidth * 0.055,
			color: brandSecondary,
			textAlign: 'center',
			textVerticalAlign: 'center',
			marginTop: deviceWidth * 0.02,
			padding: 3,
		},
		doneIconCoverStyle: {
			alignItems: 'center',
			justifyContent: 'center',
		},
	};
}
}

module.exports = ControlInfoBlock;

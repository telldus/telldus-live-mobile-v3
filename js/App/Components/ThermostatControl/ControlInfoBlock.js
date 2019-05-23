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

import {
	View,
	Text,
	IconTelldus,
} from '../../../BaseComponents';

import Theme from '../../Theme';

type Props = {
	baseColor: string,
    title: string,
    currentValue: string,
    appLayout: Object,
};

class ControlInfoBlock extends View<Props, null> {
props: Props;

constructor(props: Props) {
	super(props);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return true;
}

render(): Object {

	const {
		baseColor,
		title,
		currentValue,
	} = this.props;

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
		iconSize,
	} = this.getStyles();

	return (
		<View style={InfoCover}>
			<Text style={[infoTitleStyle, {
				color: baseColor,
			}]}>
				{title.toUpperCase()}
			</Text>
			<View style={selectedInfoCoverStyle}>
				<IconTelldus icon="temperature" size={iconSize} color={baseColor}/>
				<Text style={{ textAlignVertical: 'center' }}>
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
		},
		selectedInfoCoverStyle: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			left: -(deviceWidth * 0.025),
		},
		sValueStyle: {
			fontSize: deviceWidth * 0.15,
			left: -(deviceWidth * 0.025),
		},
		sUnitStyle: {
			fontSize: deviceWidth * 0.08,
		},
		cLabelStyle: {
			fontSize: deviceWidth * 0.04,
			color: rowTextColor,
			marginTop: 10,
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
	};
}
}

module.exports = ControlInfoBlock;

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
 */

// @flow

'use strict';

import React from 'react';
import {
	ScrollView,
} from 'react-native';

import {
	View,
	TouchableButton,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	infoMessage: string,

	onPressExit: () => void,
};

class CantEnterInclusionExclusionUI extends View<Props, null> {
props: Props;

onPressExit: () => void;
constructor(props: Props) {
	super(props);

	this.onPressExit = this.onPressExit.bind(this);
}

onPressExit() {
	const { onPressExit } = this.props;
	if (onPressExit) {
		onPressExit();
	}
}

render(): Object {
	const { infoMessage } = this.props;

	const {
		container,
		infoContainer,
		infoTextStyle,
		statusIconStyle,
		buttonStyle,
	} = this.getStyles();


	return (
		<ScrollView>
			<View style={container}>
				<View style={infoContainer}>
					<IconTelldus icon={'info'} style={statusIconStyle}/>
					<Text style={infoTextStyle}>
						{infoMessage}
					</Text>
				</View>
				<TouchableButton
					text={i18n.exit}
					onPress={this.onPressExit}
					style={buttonStyle}/>
			</View>
		</ScrollView>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor, eulaContentColor, brandSecondary, shadow } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const innerPadding = 5 + padding;

	const infoTextFontSize = deviceWidth * 0.04;

	return {
		padding,
		container: {
			flex: 1,
			margin: padding,
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			padding: innerPadding,
			backgroundColor: '#fff',
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
			marginBottom: padding / 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * 0.16,
			color: brandSecondary,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: infoTextFontSize,
			color: eulaContentColor,
			flexWrap: 'wrap',
			marginLeft: innerPadding,
		},
		buttonStyle: {
			marginTop: padding,
		},
	};
}
}

export default CantEnterInclusionExclusionUI;

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
	View,
	TouchableButton,
	InfoBlock,
	ThemedScrollView,
} from '../../../../BaseComponents';

import capitalize from '../../../Lib/capitalize';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	route: Object,

    intl: Object,
	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
};

class NoDeviceFound extends View<Props, null> {
props: Props;

onPressExclude: () => void;
onPressTryAgain: () => void;
onPressExit: () => void;
constructor(props: Props) {
	super(props);

	this.onPressExclude = this.onPressExclude.bind(this);
	this.onPressTryAgain = this.onPressTryAgain.bind(this);
	this.onPressExit = this.onPressExit.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(capitalize(formatMessage(i18n.noDeviceFound)), formatMessage(i18n.checkAndTryAgain));
}

onPressExit() {
	const { navigation } = this.props;
	navigation.popToTop();
}

onPressExclude() {
	const { navigation, route } = this.props;
	const { params = {}} = route;
	navigation.navigate('ExcludeScreen', {...params});
}

onPressTryAgain() {
	const { navigation, route } = this.props;
	const { params = {}} = route;
	navigation.navigate('IncludeDevice', {...params});
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { formatMessage } = intl;

	const {
		container,
		infoContainer,
		infoTextStyle,
		statusIconStyle,
		buttonStyle,
		brandDanger,
	} = this.getStyles();


	return (
		<ThemedScrollView
			level={3}>
			<View style={container}>
				<InfoBlock
					text={formatMessage(i18n.noDeviceFoundMessageInclude)}
					appLayout={appLayout}
					infoContainer={infoContainer}
					textStyle={infoTextStyle}
					infoIconStyle={statusIconStyle}/>
				<TouchableButton
					text={capitalize(formatMessage(i18n.tryAgain))}
					onPress={this.onPressTryAgain}
					style={buttonStyle}/>
				<TouchableButton
					text={i18n.headerExclude}
					onPress={this.onPressExclude}
					style={[buttonStyle, {
						backgroundColor: brandDanger,
					}]}/>
				<TouchableButton
					text={i18n.exit}
					onPress={this.onPressExit}
					style={buttonStyle}/>
			</View>
		</ThemedScrollView>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		paddingFactor,
		shadow,
		brandDanger,
		fontSizeFactorFour,
		fontSizeFactorNine,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const innerPadding = 5 + padding;

	const infoTextFontSize = deviceWidth * fontSizeFactorFour;

	return {
		padding,
		brandDanger,
		container: {
			flex: 1,
			margin: padding,
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			padding: innerPadding,
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
			marginBottom: padding / 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * fontSizeFactorNine,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: infoTextFontSize,
			flexWrap: 'wrap',
			marginLeft: innerPadding,
		},
		buttonStyle: {
			marginTop: padding,
		},
	};
}
}

export default (NoDeviceFound: Object);

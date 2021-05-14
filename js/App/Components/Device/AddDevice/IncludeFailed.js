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
	InfoBlock,
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

class IncludeFailed extends View<Props, null> {
props: Props;

onPressExclude: () => void;
onPressTryAgain: () => void;
onPressExit: () => void;
constructor(props: Props) {
	super(props);

	this.onPressExclude = this.onPressExclude.bind(this);
	this.onPressExit = this.onPressExit.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(capitalize(formatMessage(i18n.cantInclude)), formatMessage(i18n.alreadyIncluded));
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
		<ScrollView>
			<View style={container}>
				<InfoBlock
					text={formatMessage(i18n.includeFailedMessage)}
					appLayout={appLayout}
					infoContainer={infoContainer}
					textStyle={infoTextStyle}
					infoIconStyle={statusIconStyle}/>
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
		</ScrollView>
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

export default (IncludeFailed: Object);

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
	onDidMount(formatMessage(i18n.cantInclude), formatMessage(i18n.alreadyIncluded));
}

onPressExit() {
	const { navigation } = this.props;
	const { params = {}} = navigation.state;
	navigation.navigate({
		routeName: 'Devices',
		key: 'Devices',
		params,
	});
}

onPressExclude() {
	const { navigation } = this.props;
	const { params = {}} = navigation.state;
	navigation.navigate({
		routeName: 'ExcludeScreen',
		key: 'ExcludeScreen',
		params,
	});
}

render(): Object {
	const { intl } = this.props;
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
				<View style={infoContainer}>
					<IconTelldus icon={'info'} style={statusIconStyle}/>
					<Text style={infoTextStyle}>
						{formatMessage(i18n.includeFailedMessage)}
					</Text>
				</View>
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
	const { paddingFactor, eulaContentColor, brandSecondary, shadow, brandDanger } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const innerPadding = 5 + padding;

	const infoTextFontSize = deviceWidth * 0.04;

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

export default IncludeFailed;

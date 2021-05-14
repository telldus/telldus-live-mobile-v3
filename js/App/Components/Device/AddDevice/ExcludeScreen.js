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
	LayoutAnimation,
} from 'react-native';
import { connect } from 'react-redux';

import {
	View,
	TouchableButton,
	InfoBlock,
	ThemedScrollView,
} from '../../../../BaseComponents';
import { ExcludeDevice } from '../Common';

import {
	showToast,
	registerForWebSocketEvents,
} from '../../../Actions';

import { LayoutAnimations } from '../../../Lib';
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
	showToast: (?string) => void,
	dispatch: Function,
};

type State = {
    excludeSuccess: boolean,
};

class ExcludeScreen extends View<Props, State> {
props: Props;
state: State;

onPressCancelExclude: () => void;
onExcludeSuccessImmediate: () => void;
onPressExit: () => void;
onPressInclude: () => void;
onExcludeTimedoutImmediate: () => void;
onCantEnterExclusionTimeout: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		excludeSuccess: false,
	};

	this.onPressCancelExclude = this.onPressCancelExclude.bind(this);
	this.onExcludeSuccessImmediate = this.onExcludeSuccessImmediate.bind(this);
	this.onPressExit = this.onPressExit.bind(this);
	this.onPressInclude = this.onPressInclude.bind(this);
	this.onExcludeTimedoutImmediate = this.onExcludeTimedoutImmediate.bind(this);
	this.onCantEnterExclusionTimeout = this.onCantEnterExclusionTimeout.bind(this);
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

onExcludeSuccessImmediate() {
	LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	this.setState({
		excludeSuccess: true,
	});
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(capitalize(formatMessage(i18n.excluded)), formatMessage(i18n.excludedSuccessfully));
}

onPressCancelExclude() {
	const { navigation } = this.props;
	navigation.goBack();
}

onPressInclude() {
	const { navigation, route } = this.props;
	const { params = {}} = route;
	navigation.navigate('IncludeDevice', {...params});
}

onExcludeTimedoutImmediate() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.noDeviceFound), formatMessage(i18n.couldNotExclude));
}

onCantEnterExclusionTimeout() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(capitalize(formatMessage(i18n.couldNotExclude)), formatMessage(i18n.cantEnterExclusionTwo));
}

registerForWebSocketEvents = (callbacks: Object): () => Object => {
	const { dispatch, route } = this.props;
	const {
		gateway = {},
	} = route.params || {};
	return dispatch(registerForWebSocketEvents(gateway.id, callbacks));
}

render(): Object {

	const {
		appLayout,
		intl,
		route,
	} = this.props;
	const { excludeSuccess } = this.state;

	const {
		buttonStyle,
		infoContainer,
		statusIconStyle,
		infoTextStyle,
	} = this.getStyles();

	const {
		gateway = {},
		deviceProdInfo,
	} = route.params || {};

	return (
		<ThemedScrollView
			level={3}>
			{excludeSuccess ?
				<View style={{
					flex: 1,
				}}>
					<InfoBlock
						text={intl.formatMessage(i18n.excludedSuccessfullyMessage)}
						appLayout={appLayout}
						infoContainer={infoContainer}
						textStyle={infoTextStyle}
						infoIconStyle={statusIconStyle}/>
					<TouchableButton
						text={i18n.includeDevice}
						onPress={this.onPressInclude}
						style={buttonStyle}/>
					<TouchableButton
						text={i18n.exit}
						onPress={this.onPressExit}
						style={buttonStyle}/>
				</View>
				:
				<ExcludeDevice
					clientId={gateway.id}
					appLayout={appLayout}
					intl={intl}
					registerForWebSocketEvents={this.registerForWebSocketEvents}
					showToast={this.props.showToast}
					onExcludeSuccessImmediate={this.onExcludeSuccessImmediate}
					onExcludeTimedoutImmediate={this.onExcludeTimedoutImmediate}
					onPressCancelExclude={this.onPressCancelExclude}
					onCantEnterExclusionTimeout={this.onCantEnterExclusionTimeout}
					manufacturerAttributes={deviceProdInfo}/>
			}
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
		fontSizeFactorFour,
		fontSizeFactorNine,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	const innerPadding = 5 + padding;

	const infoTextFontSize = deviceWidth * fontSizeFactorFour;

	return {
		buttonStyle: {
			marginTop: padding,
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			margin: padding,
			padding: innerPadding,
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
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
	};
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		showToast: (message: string): any => dispatch(showToast(message)),
		dispatch,
	};
}

module.exports = (connect(null, mapDispatchToProps)(ExcludeScreen): Object);

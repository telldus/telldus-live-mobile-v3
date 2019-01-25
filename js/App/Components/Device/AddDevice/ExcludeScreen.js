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
	LayoutAnimation,
} from 'react-native';
import { connect } from 'react-redux';

import {
	View,
	TouchableButton,
	IconTelldus,
	Text,
} from '../../../../BaseComponents';
import { ExcludeDevice } from '../DeviceDetails/SubViews';

import {
	showToast,
	getSocketObject,
	sendSocketMessage,
	processWebsocketMessageForDevice,
} from '../../../Actions';

import { LayoutAnimations } from '../../../Lib';
import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,

    intl: Object,
	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
	showToast: (?string) => void,
	getSocketObject: (number) => any,
	sendSocketMessage: (number, string, string, Object) => any,
	processWebsocketMessageForDevice: (string, Object) => null,
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
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.noDeviceFound), formatMessage(i18n.checkAndTryAgain));
}

onPressExit() {
	const { navigation } = this.props;
	navigation.navigate({
		routeName: 'Devices',
		key: 'Devices',
	});
}

onExcludeSuccessImmediate() {
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
	this.setState({
		excludeSuccess: true,
	});
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.excluded), formatMessage(i18n.excludedSuccessfully));
}

onPressCancelExclude() {
	const { navigation } = this.props;
	navigation.goBack();
}

onPressInclude() {
	const { navigation } = this.props;
	const { params = {}} = navigation.state;
	navigation.navigate({
		routeName: 'IncludeDevice',
		key: 'IncludeDevice',
		params,
	});
}

onExcludeTimedoutImmediate() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.noDeviceFound), formatMessage(i18n.couldNotExclude));
}

render(): Object {

	const {
		appLayout,
		intl,
		navigation,
	} = this.props;
	const { excludeSuccess } = this.state;

	const {
		container,
		buttonStyle,
		infoContainer,
		statusIconStyle,
		infoTextStyle,
	} = this.getStyles();

	const gateway = navigation.getParam('gateway', {});

	return (
		<View style={container}>
			<ScrollView>
				{excludeSuccess ?
					<View style={{
						flex: 1,
					}}>
						<View style={infoContainer}>
							<IconTelldus icon={'info'} style={statusIconStyle}/>
							<Text style={infoTextStyle}>
								{intl.formatMessage(i18n.excludedSuccessfullyMessage)}
							</Text>
						</View>
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
						sendSocketMessage={this.props.sendSocketMessage}
						getSocketObject={this.props.getSocketObject}
						showToast={this.props.showToast}
						processWebsocketMessageForDevice={this.props.processWebsocketMessageForDevice}
						onExcludeSuccessImmediate={this.onExcludeSuccessImmediate}
						onExcludeTimedoutImmediate={this.onExcludeTimedoutImmediate}
						onPressCancelExclude={this.onPressCancelExclude}/>
				}
			</ScrollView>
		</View>
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
		container: {
			flex: 1,
		},
		buttonStyle: {
			marginTop: padding,
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			margin: padding,
			padding: innerPadding,
			backgroundColor: '#fff',
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
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
	};
}
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		sendSocketMessage: (id: number, module: string, action: string, data: Object): any => dispatch(sendSocketMessage(id, module, action, data)),
		getSocketObject: (id: number): any => dispatch(getSocketObject(id)),
		showToast: (message: string): any => dispatch(showToast(message)),
		processWebsocketMessageForDevice: (action: string, data: Object): any => dispatch(processWebsocketMessageForDevice(action, data)),
	};
}

module.exports = connect(null, mapDispatchToProps)(ExcludeScreen);

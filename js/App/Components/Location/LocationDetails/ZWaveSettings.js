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
import { LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';

import {
	View,
	TouchableButton,
	ThemedScrollView,
} from '../../../../BaseComponents';
import { ExcludeDevice } from '../../Device/Common';

import {
	showToast,
	registerForWebSocketEvents,
} from '../../../Actions';

import { LayoutAnimations } from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	screenProps: Object,
	location: Object,
	currentScreen: string,

	navigation: Object,
	showToast: (?string) => void,
	dispatch: Function,
};

type State = {
	excludeActive: boolean,
};

class ZWaveSettings extends View<Props, State> {

props: Props;
state: State;

onPressExcludeDevice: () => void;
onPressCancelExclude: () => void;
goBack: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		excludeActive: false,
	};

	this.onPressExcludeDevice = this.onPressExcludeDevice.bind(this);
	this.onPressCancelExclude = this.onPressCancelExclude.bind(this);
	this.goBack = this.goBack.bind(this);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'ZWaveSettings';
}

onPressExcludeDevice() {
	LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	this.setState({
		excludeActive: true,
	});
}

onPressCancelExclude() {
	LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
	this.setState({
		excludeActive: false,
	});
}

goBack() {
	this.props.navigation.goBack();
	this.setState({
		excludeActive: false,
	});
}

supportZWave(transports: string = ''): boolean {
	const items = transports.split(',');
	return items.indexOf('zwave') !== -1;
}

registerForWebSocketEvents = (callbacks: Object): () => Object => {
	const { location, dispatch } = this.props;
	return dispatch(registerForWebSocketEvents(location.id, callbacks));
}

render(): Object {
	const { excludeActive } = this.state;
	const { screenProps, location } = this.props;
	const { intl, appLayout } = screenProps;

	if (!location || !location.id) {
		return <View style={Theme.Styles.emptyBackgroundFill}/>;
	}

	const { id, online = false, websocketOnline = false, transports = '' } = location;
	const canExclude = this.supportZWave(transports);

	const {
		container,
		brandDanger,
		btnDisabledBg,
		padding,
	} = this.getStyles(appLayout);

	return (
		<ThemedScrollView
			level={3}
			style={container}>
			{excludeActive && (
				<ExcludeDevice
					clientId={id}
					appLayout={appLayout}
					intl={intl}
					showToast={this.props.showToast}
					registerForWebSocketEvents={this.registerForWebSocketEvents}
					onExcludeSuccess={this.goBack}
					onPressCancelExclude={this.onPressCancelExclude}/>
			)}
			{(!excludeActive && canExclude) && (<TouchableButton
				text={intl.formatMessage(i18n.headerExclude)}
				onPress={this.onPressExcludeDevice}
				disabled={!(online && websocketOnline)}
				style={{
					backgroundColor: (online && websocketOnline) ? brandDanger : btnDisabledBg,
					marginTop: padding * 1.5,
				}}/>
			)}
		</ThemedScrollView>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor, brandDanger, btnDisabledBg } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		padding,
		brandDanger,
		btnDisabledBg,
		container: {
			flex: 1,
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

function mapStateToProps(store: Object, ownProps: Object): Object {
	const {
		location: {id},
	} = ownProps.route.params || {};
	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		location: store.gateways.byId[id],
		currentScreen,
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(ZWaveSettings): Object);

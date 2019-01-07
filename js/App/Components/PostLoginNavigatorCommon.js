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
import { NetInfo } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { View } from '../../BaseComponents';
import AppNavigatorRenderer from './AppNavigatorRenderer';
import UserAgreement from './UserAgreement/UserAgreement';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';
import { DimmerPopup } from './TabViews/SubViews';

import {
	setAppLayout,
	resetSchedule,
	getUserProfile,
	appStart,
	appState,
	syncLiveApiOnForeground,
	getAppData,
	getGateways,
	initiateGatewayLocalTest,
	closeUDPSocket,
	autoDetectLocalTellStick,
	resetLocalControlSupport,
} from '../Actions';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';
import { hideDimmerStep } from '../Actions/Dimmer';

import {
	getRSAKey,
} from '../Lib';

type Props = {
    showEULA: boolean,
    dimmer: Object,
	screenReaderEnabled: boolean,

    intl: intlShape.isRequired,
    dispatch: Function,
};

type State = {
};

class PostLoginNavigatorCommon extends View<Props, State> {

props: Props;
state: State;

onLayout: (Object) => void;
onDoneDimming: (Object) => void;
autoDetectLocalTellStick: () => void;
handleConnectivityChange: () => void;
constructor(props: Props) {
	super(props);

	this.timeOutConfigureLocalControl = null;

	this.onLayout = this.onLayout.bind(this);
	this.onDoneDimming = this.onDoneDimming.bind(this);
	this.autoDetectLocalTellStick = this.autoDetectLocalTellStick.bind(this);

	this.handleConnectivityChange = this.handleConnectivityChange.bind(this);

	getRSAKey(true);
}

componentDidMount() {
	this.props.dispatch(appStart());
	this.props.dispatch(appState());
	// Calling other API requests after resolving the very first one, in order to avoid the situation, where
	// access_token has expired and the API requests, all together goes for fetching new token with refresh_token,
	// and results in generating multiple tokens.
	const { dispatch } = this.props;
	dispatch(getUserProfile()).then(() => {
		dispatch(syncLiveApiOnForeground());
		dispatch(getGateways());
		dispatch(getAppData());
		dispatch(resetSchedule());

		// test gateway local control end-point on app restart.
		dispatch(initiateGatewayLocalTest());

		// Auto discover TellStick's that support local control.
		this.autoDetectLocalTellStick();
	});

	NetInfo.addEventListener(
		'connectionChange',
		this.handleConnectivityChange,
	);
}

componentWillUnmount() {
	clearTimeout(this.timeOutConfigureLocalControl);
	NetInfo.removeEventListener(
		'connectionChange',
		this.handleConnectivityChange,
	);
	closeUDPSocket();
}

handleConnectivityChange(connectionInfo: Object) {
	const { dispatch } = this.props;
	const { type } = connectionInfo;

	// When ever user's connection change reset the previously auto-discovered ip address, before it is auto-discovered and updated again.
	dispatch(resetLocalControlSupport());

	// When user's connection change and if it there is connection to internet, auto-discover TellStick and update it's ip address.
	if (type && type !== 'none') {
		dispatch(initiateGatewayLocalTest());
		dispatch(autoDetectLocalTellStick());
	}
}

// Sends UDP package to the broadcast IP to detect gateways connected in the same LAN.
autoDetectLocalTellStick() {
	const { dispatch } = this.props;
	this.timeOutConfigureLocalControl = setTimeout(() => {
		dispatch(autoDetectLocalTellStick());
	}, 15000);
}

onLayout(ev: Object) {
	this.props.dispatch(setAppLayout(ev.nativeEvent.layout));
}

onDoneDimming() {
	this.props.dispatch(hideDimmerStep());
}

render(): Object {
	const {
		showEULA,
		dimmer,
		intl,
		screenReaderEnabled,
	} = this.props;
	const { show, name, value, showStep, deviceStep } = dimmer;

	return (
		<View style={{flex: 1}}>
			<AppNavigatorRenderer {...this.props}/>
			<DimmerPopup
				isVisible={show}
				name={name}
				value={value / 255}
			/>
			{screenReaderEnabled && (
				<DimmerStep
					showModal={showStep}
					deviceId={deviceStep}
					onDoneDimming={this.onDoneDimming}
					intl={intl}
				/>
			)}
			<UserAgreement showModal={showEULA} onLayout={this.onLayout}/>
		</View>
	);
}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const {
		screenReaderEnabled,
	} = state.app;

	return {
		showEULA: !getUserProfileSelector(state).eula,
		dimmer: state.dimmer,
		screenReaderEnabled,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PostLoginNavigatorCommon));

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
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import { View } from '../../BaseComponents';
import AppNavigatorRenderer from './AppNavigatorRenderer';
import UserAgreement from './UserAgreement/UserAgreement';
import DimmerStep from './TabViews/SubViews/Device/DimmerStep';

import {
	setAppLayout,
} from '../Actions';
import { getUserProfile as getUserProfileSelector } from '../Reducers/User';
import { hideDimmerStep } from '../Actions/Dimmer';

type Props = {
    showEULA: boolean,
    dimmer: Object,

    dispatch: Function,
};

type State = {
};

class PostLoginNavigatorCommon extends View<Props, State> {

props: Props;
state: State;

onLayout: (Object) => void;
onDoneDimming: (Object) => void;
constructor(props: Props) {
	super(props);

	this.onLayout = this.onLayout.bind(this);
	this.onDoneDimming = this.onDoneDimming.bind(this);
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
	const { showStep, deviceStep } = dimmer;

	return (
		<View style={{flex: 1}}>
			<AppNavigatorRenderer {...this.props}/>
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

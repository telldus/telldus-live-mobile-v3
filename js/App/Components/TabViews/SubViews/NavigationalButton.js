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

import { View } from 'BaseComponents';
import { StyleSheet } from 'react-native';

import StopButton from './Navigational/StopButton';
import UpButton from './Navigational/UpButton';
import DownButton from './Navigational/DownButton';

type Props = {
	device: Object,
	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	appLayout: Object,
};

class NavigationalButton extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render() {

		let { device, isGatewayActive, intl, style } = this.props;
		const { supportedMethods, methodRequested, isInState, id } = device;
		const { UP, DOWN, STOP } = supportedMethods;

		return (
			<View style={style}>
				<UpButton supportedMethod={UP} methodRequested={methodRequested} intl={intl}
					iconSize={30} isGatewayActive={isGatewayActive} isInState={isInState}
					id={id} style={styles.navigationButton}/>
				<DownButton supportedMethod={DOWN} methodRequested={methodRequested} intl={intl}
					iconSize={30} isGatewayActive={isGatewayActive} isInState={isInState}
					id={id} style={styles.navigationButton}/>
				<StopButton supportedMethod={STOP} methodRequested={methodRequested} intl={intl}
					iconSize={20} isGatewayActive={isGatewayActive} isInState={isInState}
					id={id} style={styles.navigationButton}/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	navigationButton: {
		justifyContent: 'center',
		alignItems: 'center',
		width: 60,
		height: 60,
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
});

module.exports = NavigationalButton;

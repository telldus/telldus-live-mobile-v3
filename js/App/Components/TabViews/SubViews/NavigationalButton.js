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

import { View } from '../../../../BaseComponents';
import { StyleSheet } from 'react-native';

import StopButton from './Navigational/StopButton';
import UpButton from './Navigational/UpButton';
import DownButton from './Navigational/DownButton';
import Theme from '../../../Theme';

type Props = {
	device: Object,
	style: Object,
	intl: Object,
	isGatewayActive: boolean,
	appLayout: Object,
	upButtonStyle?: number | Object | Array<any>,
	downButtonStyle?: number | Object | Array<any>,
	stopButtonStyle?: number | Object | Array<any>,
	showStopButton?: boolean,
};

type DefaultProps = {
	showStopButton: boolean,
};

class NavigationalButton extends View {
	props: Props;

	static defaultProps: DefaultProps = {
		showStopButton: true,
	};

	constructor(props: Props) {
		super(props);
	}

	render(): Object {

		let { device, isGatewayActive, intl, style, upButtonStyle, downButtonStyle, stopButtonStyle, showStopButton } = this.props;
		const { supportedMethods, methodRequested, isInState, id, name, local } = device;
		const { UP, DOWN, STOP } = supportedMethods;

		return (
			<View style={style}>
				<UpButton supportedMethod={UP} methodRequested={methodRequested} intl={intl}
					iconSize={30} isGatewayActive={isGatewayActive} isInState={isInState}
					id={id} style={[styles.navigationButton, upButtonStyle]} name={name} local={local}/>
				<DownButton supportedMethod={DOWN} methodRequested={methodRequested} intl={intl}
					iconSize={30} isGatewayActive={isGatewayActive} isInState={isInState}
					id={id} style={[styles.navigationButton, downButtonStyle]} name={name} local={local}/>
				{!!showStopButton && (<StopButton supportedMethod={STOP} methodRequested={methodRequested} intl={intl}
					iconSize={20} isGatewayActive={isGatewayActive} isInState={isInState}
					id={id} style={[styles.navigationButton, stopButtonStyle]} name={name} local={local}/>
				)}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	navigationButton: {
		justifyContent: 'center',
		alignItems: 'center',
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
});

module.exports = NavigationalButton;

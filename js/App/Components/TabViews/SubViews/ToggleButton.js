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
import PropTypes from 'prop-types';
import { View } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import OnButton from './OnButton';
import OffButton from './OffButton';

type Props = {
	device: Object,
	enabled: Boolean,
	onTurnOff: number => void,
	onTurnOn: number => void,
	intl: Object,
	isGatewayActive: boolean,
	appLayout: Object,
};

class ToggleButton extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render() {
		const { intl, device, isGatewayActive} = this.props;
		const { TURNON, TURNOFF } = device.supportedMethods;
		const { id, isInState, methodRequested, name } = device;

		const onButton = <OnButton id={id} name={name} isInState={isInState} enabled={!!TURNON}
			style={styles.turnOn} methodRequested={methodRequested} intl={intl} isGatewayActive={isGatewayActive}/>;
		const offButton = <OffButton id={id} name={name} isInState={isInState} enabled={!!TURNOFF}
			style={styles.turnOff} methodRequested={methodRequested} intl={intl} isGatewayActive={isGatewayActive}/>;

		return (
			<View style={styles.container}>
				{ offButton }
				{ onButton }
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 0,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	turnOff: {
		width: 60,
		alignItems: 'center',
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
	},
	turnOn: {
		width: 60,
		alignItems: 'center',
	},
});

ToggleButton.propTypes = {
	device: PropTypes.object,
	enabled: PropTypes.bool,
};

ToggleButton.defaultProps = {
	enabled: true,
};

module.exports = ToggleButton;

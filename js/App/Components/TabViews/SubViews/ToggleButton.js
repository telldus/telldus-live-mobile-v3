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
import { View } from '../../../../BaseComponents';
import { StyleSheet } from 'react-native';
import OnButton from './OnButton';
import OffButton from './OffButton';

import Theme from '../../../Theme';

type Props = {
	device: Object,
	enabled: boolean,
	onTurnOff: number => void,
	onTurnOn: number => void,
	intl: Object,
	isGatewayActive: boolean,
	appLayout: Object,
	style?: Object | number,
	onButtonStyle?: Object | number,
	offButtonStyle?: Object | number,
};

class ToggleButton extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { intl, device, isGatewayActive, style, onButtonStyle, offButtonStyle } = this.props;
		const { TURNON, TURNOFF } = device.supportedMethods;
		const { id, isInState, methodRequested, name } = device;
		const width = Theme.Core.buttonWidth;

		const onButton = <OnButton id={id} name={name} isInState={isInState} enabled={!!TURNON}
			style={[styles.turnOn, TURNON ? {width} : {width: width * 2}, onButtonStyle]} methodRequested={methodRequested} intl={intl} isGatewayActive={isGatewayActive}/>;
		const offButton = <OffButton id={id} name={name} isInState={isInState} enabled={!!TURNOFF}
			style={[styles.turnOff, TURNOFF ? {width} : {width: width * 2}, offButtonStyle]} methodRequested={methodRequested} intl={intl} isGatewayActive={isGatewayActive}/>;

		return (
			<View style={style}>
				{(TURNOFF || (!TURNOFF && isInState === 'TURNOFF')) && offButton }
				{(TURNON || (!TURNON && isInState === 'TURNON')) && onButton }
			</View>
		);
	}
}

const styles = StyleSheet.create({
	turnOff: {
		height: Theme.Core.rowHeight,
		borderLeftWidth: 1,
		borderLeftColor: '#ddd',
		justifyContent: 'center',
		alignItems: 'center',
	},
	turnOn: {
		height: Theme.Core.rowHeight,
		justifyContent: 'center',
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

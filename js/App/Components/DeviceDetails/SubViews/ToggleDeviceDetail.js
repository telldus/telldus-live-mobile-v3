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

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { RoundedCornerShadowView, View } from '../../../../BaseComponents';
import { StyleSheet, Dimensions } from 'react-native';
import { OnButton, OffButton } from '../../TabViews/SubViews';

const deviceHeight = Dimensions.get('window').height;
import Theme from '../../../Theme';

const ToggleButton = ({ device, intl }) => {
	return (
		<RoundedCornerShadowView style={styles.toggleContainer}>
			<OffButton id={device.id} isInState={device.isInState} name={device.name} fontSize={16} style={styles.turnOff} methodRequested={device.methodRequested} intl={intl}/>
			<OnButton id={device.id} isInState={device.isInState} name={device.name} fontSize={16} style={styles.turnOn} methodRequested={device.methodRequested} intl={intl}/>
		</RoundedCornerShadowView>
	);
};

type Props = {
	device: Object,
	intl: Object,
};

class ToggleDeviceDetailModal extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render() {
		const { device, intl } = this.props;
		const { TURNON, TURNOFF } = device.supportedMethods;
		let toggleButton = null;

		if (TURNON || TURNOFF) {
			toggleButton = <ToggleButton device={device} onTurnOn={this.onTurnOn} onTurnOff={this.onTurnOff} intl={intl}/>;
		}

		return (
			<View style={styles.container}>
				<View style={[styles.toggleButtonContainer, styles.shadow]}>
					{toggleButton}
				</View>
			</View>
		);
	}

}

ToggleDeviceDetailModal.propTypes = {
	device: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	toggleButtonContainer: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		marginTop: 20,
		height: (deviceHeight * 0.2),
	},
	shadow: {
		borderRadius: 2,
		...Theme.Core.shadow,
	},
	toggleContainer: {
		flexDirection: 'row',
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
	},
	turnOff: {
		flex: 1,
		alignItems: 'stretch',
		borderTopLeftRadius: 7,
		borderBottomLeftRadius: 7,
	},
	turnOn: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
		borderBottomRightRadius: 7,
	},
});

module.exports = ToggleDeviceDetailModal;

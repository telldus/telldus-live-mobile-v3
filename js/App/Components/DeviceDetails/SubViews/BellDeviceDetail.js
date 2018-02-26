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
import { StyleSheet, Dimensions } from 'react-native';
import { BellButton } from '../../TabViews/SubViews';

const deviceHeight = Dimensions.get('window').height;

type Props = {
	device: Object,
	onBell: number => void,
	intl: Object,
};

class BellDeviceDetailModal extends View {
	props: Props;
	onBell : number => void;
	constructor(props: Props) {
		super(props);
		this.onBell = this.onBell.bind(this);
	}
	onBell() {
		this.props.onBell(this.props.device.id);
	}
	render() {
		const { device, intl } = this.props;
		const { BELL } = device.supportedMethods;
		let bellButton = null;

		if (BELL) {
			bellButton = <BellButton device={device} style={styles.bell} intl={intl}/>;
		}

		return (
			<View style={styles.container}>
				<View style={[styles.bellButtonContainer, styles.shadow]}>
					{bellButton}
				</View>
			</View>
		);
	}
}

BellDeviceDetailModal.propTypes = {
	device: PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	bellButtonContainer: {
		flex: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#fff',
		marginTop: 20,
		height: (deviceHeight * 0.2),
	},
	shadow: {
		borderRadius: 4,
		backgroundColor: '#fff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
	},
	bell: {
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

module.exports = BellDeviceDetailModal;

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
import { BellButton, LearnButton } from 'TabViews_SubViews';

type Props = {
  device: Object,
  onBell: number => void,
  onLearn: number => void,
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
		const { device } = this.props;
		const { BELL, LEARN } = device.supportedMethods;

		let bellButton = null;
		let learnButton = null;

		if (BELL) {
			bellButton = <BellButton id={device.id} style={styles.bell} />;
		}

		if (LEARN) {
			learnButton = <LearnButton id={device.id} style={styles.learn} />;
		}

		return (
			<View style={styles.container}>
				{bellButton}
				{learnButton}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	bell: {
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
		justifyContent: 'center',
		alignItems: 'center',
	},
	learn: {
		height: 36,
		marginHorizontal: 8,
		marginVertical: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
});

module.exports = BellDeviceDetailModal;

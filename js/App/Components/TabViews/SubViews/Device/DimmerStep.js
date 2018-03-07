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
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { View, Modal, Text, StyleSheet } from '../../../../../BaseComponents';
import Step from './Step';

import { deviceSetState, requestDeviceAction } from '../../../../Actions/Devices';

import Theme from '../../../../Theme';

import {
	toDimmerValue,
} from '../../../../Lib';

type Props = {
    showModal: boolean,
	onDoneDimming: () => void;
	deviceId: number,
	commandON?: number,
	commandDIM?: number,
	deviceSetState: (id: number, command: number, value?: number) => void,
	requestDeviceAction: (id: number, command: number) => void,
	commandON: number,
	commandDIM: number,
	intl: Object,
};

type DefaultProps = {
	commandON: number,
	commandDIM: number,
}

class DimmerStep extends View {
props: Props;
onPressDone: () => void;
onPressDim: (number) => void;

static defaultProps: DefaultProps = {
	commandON: 1,
	commandDIM: 16,
}

constructor(props: Props) {
	super(props);
	this.dimLevels = [15, 30, 45, 60, 75];

	this.onPressDone = this.onPressDone.bind(this);
	this.onPressDim = this.onPressDim.bind(this);
}

onPressDone() {
	let { onDoneDimming } = this.props;
	if (onDoneDimming) {
		onDoneDimming();
	}
}

onPressDim(value: number) {
	let { deviceId, commandDIM } = this.props;
	let dimValue = toDimmerValue(value);
	this.props.requestDeviceAction(deviceId, this.props.commandON);
	this.props.deviceSetState(deviceId, commandDIM, dimValue);
}

render(): Object {
	let { showModal, intl } = this.props;
	let importantForAccessibility = showModal ? 'yes' : 'no';

	return (
		<Modal
			showModal={showModal}
			entry= {'ZoomIn'}
			exit= {'ZoomOut'}
			entryDuration={300}
			exitDuration={100}
			modalStyle={styles.modal}
			modalContainerStyle={styles.modal}
			showOverlay={false}>
			<View style={styles.container}>
				<View style={styles.stepCover}>
					{
						this.dimLevels.map((value) => {
							return <Step key={value} value={value}
								onPressDim={this.onPressDim} intl={intl}
								importantForAccessibility={importantForAccessibility}/>;
						})
					}
				</View>
				<TouchableOpacity onPress={this.onPressDone} style={styles.buttonCover} importantForAccessibility={importantForAccessibility}>
					<Text style={styles.textCancel}>
						CLOSE
					</Text>
				</TouchableOpacity>
			</View>
		</Modal>
	);
}
}

const styles = StyleSheet.create({
	modal: {
		flex: 1,
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#C3D1E640',
		paddingHorizontal: 10,
	},
	container: {
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		...Theme.Core.shadow,
		borderRadius: 2,
		paddingVertical: 10,
		paddingHorizontal: 10,
	},
	stepCover: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textCancel: {
		fontSize: 16,
		paddingHorizontal: 10,
		paddingVertical: 10,
	},
	buttonCover: {
	},
});

function mapStateToProps(store: Object): Object {
	return {
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) => dispatch(deviceSetState(id, command, value)),
		requestDeviceAction: (id: number, command: number) => dispatch(requestDeviceAction(id, command)),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(DimmerStep);

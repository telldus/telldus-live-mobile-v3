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
import { connect } from 'react-redux';

import { Container, Text, View, Icon } from 'BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { addToDashboard, removeFromDashboard } from 'Actions';
import Modal from 'react-native-modal';

class DeviceDetailModal extends View {

	constructor(props) {
		super(props);
		this.state = {
			isVisible: this.props.isVisible,
		};

		this.onStarButtonSelected = this.onStarButtonSelected.bind(this);
	}

	onStarButtonSelected() {
		if (this.props.inDashboard) {
			this.props.onRemoveFromDashboard(this.props.device.id);
		} else {
			this.props.onAddToDashboard(this.props.device.id);
		}
	}

	render() {
		const { device, inDashboard, gateway, children } = this.props;

		// TODO: move these functions, either to Reducer or Connect

		let addToDashboardView = null;
		if (inDashboard === true) {
			addToDashboardView = (
				<View style={styles.textGuide}>
					<Text style={styles.textDeviceShownOnTheDashboard}>
						{'Device is shown on the dashboard'}
					</Text>
					<Text style={styles.textTapToRemove}>
						{'Tap to remove'}
					</Text>
				</View>
			);
		} else {
			addToDashboardView = (
				<View style={styles.textGuide}>
					<Text style={styles.textDeviceShownOnTheDashboard}>
						{'Tap to show device on dashboard'}
					</Text>
				</View>
			);
		}

		return (
			<Modal isVisible={this.state.isVisible}>
				<Container style={styles.container}>
					<View style={styles.header}>
						<Icon name="wifi" size={26} color="white" style={{
							flex: 1, marginLeft: 8,
						}}/>
						<Text ellipsizeMode="middle" style={styles.textHeaderTitle}>
							{device.name}
						</Text>
						<Icon name="close" size={26} color="white" style={{ flex: 1 }} onPress={this.props.onCloseSelected} />
					</View>
					<View style={styles.body}>
						<Text style={styles.textLocation}>
							{`Location: ${gateway.name}`}
						</Text>
						{children}
						<TouchableOpacity
							onPress={this.onStarButtonSelected}
							style={styles.bottom} >
							<Icon name="star" size={18} color="orange"
								style={{ opacity: inDashboard ? 1.0 : 0.6 }} />
							{addToDashboardView}
						</TouchableOpacity>
					</View>
				</Container>
			</Modal>
		);
	}

}

DeviceDetailModal.propTypes = {
	onCloseSelected: React.PropTypes.func.isRequired,
	onAddToDashboard: React.PropTypes.func.isRequired,
	onRemoveFromDashboard: React.PropTypes.func.isRequired,
	device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		margin: 10,
	},
	header: {
		height: 46,
		backgroundColor: '#1a355b',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	textHeaderTitle: {
		marginLeft: 8,
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
		flex: 8,
	},
	body: {
		flex: 10,
	},
	textLocation: {
		color: '#1a355b',
		fontSize: 14,
		marginTop: 12,
		marginLeft: 8,
	},
	textGuide: {
		marginLeft: 8,
	},
	textDeviceShownOnTheDashboard: {
		color: '#1a355b',
		fontSize: 13,
	},
	textTapToRemove: {
		color: '#1a355b',
		fontSize: 10,
	},
	bottom: {
		height: 36,
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 8,
	},
});

function mapStateToProps(state, props) {
	return {
		inDashboard: !!state.dashboard.devicesById[props.device.id],
		gateway: state.gateways.byId[props.device.clientId],
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onAddToDashboard: id => dispatch(addToDashboard('device', id)),
		onRemoveFromDashboard: id => dispatch(removeFromDashboard('device', id)),
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DeviceDetailModal);

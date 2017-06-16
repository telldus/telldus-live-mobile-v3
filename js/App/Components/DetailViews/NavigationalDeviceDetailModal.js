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

import { RoundedCornerShadowView, Icon, View, Text } from 'BaseComponents';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { up, down, stop, learn } from 'Actions/Devices';

const NavigationalButton = ({ device, onUp, onDown, onStop }) => (
	<RoundedCornerShadowView style={{
		flexDirection: 'row',
		height: 36,
		marginHorizontal: 8,
		marginVertical: 16,
		justifyContent: 'center',
		alignItems: 'center',
	}}>
		<TouchableOpacity
			style={styles.navigationButton}
			onPress={onUp}>
			<Icon name="caret-up" size={30} style={{ color: '#1a355b' }}/>
		</TouchableOpacity>
		<TouchableOpacity
			style={styles.navigationButton}
			onPress={onDown}>
			<Icon name="caret-down" size={30} style={{ color: '#1a355b' }}/>
		</TouchableOpacity>
		<TouchableOpacity
			style={styles.navigationButton}
			onPress={onStop}>
			<Icon name="stop" size={20} style={{ color: '#1a355b' }}/>
		</TouchableOpacity>
	</RoundedCornerShadowView>
);

const LearnButton = ({ onLearn }) => (
	<RoundedCornerShadowView style={styles.learnContainer}>
		<TouchableOpacity onPress={onLearn} style={styles.learnButton}>
			<Text style={styles.learnText}>
				{'Learn'}
			</Text>
		</TouchableOpacity>
	</RoundedCornerShadowView>
);

class NavigationalDeviceDetailModal extends View {

	constructor(props) {
		super(props);

		this.onUp = this.onUp.bind(this);
		this.onDown = this.onDown.bind(this);
		this.onStop = this.onStop.bind(this);
		this.onLearn = this.onLearn.bind(this);
	}

	onUp() {
		this.props.onUp(this.props.device.id);
	}

	onDown() {
		this.props.onDown(this.props.device.id);
	}

	onStop() {
		this.props.onStop(this.props.device.id);
	}

	onLearn() {
		this.props.onLearn(this.props.device.id);
	}

	render() {
		const { device } = this.props;
		const { UP, DOWN, STOP, LEARN } = device.supportedMethods;

		let navigationButtons = null;
		let learnButton = null;

		if (UP || DOWN || STOP) {
			navigationButtons = <NavigationalButton device={device} onUp={this.onUp} onDown={this.onDown}
			                                        onLearn={this.onLearn}/>;
		}

		if (LEARN) {
			learnButton = <LearnButton device={device} onLearn={this.onLearn}/>;
		}

		return (
			<View style={styles.container}>
				{navigationButtons}
				{learnButton}
			</View>
		);
	}

}

NavigationalDeviceDetailModal.propTypes = {
	device: React.PropTypes.object.isRequired,
};

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	navigationButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	learnContainer: {
		height: 36,
		marginHorizontal: 8,
		marginVertical: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	learnButton: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	learnText: {
		fontSize: 16,
		color: 'orange',
	},
});

function mapStateToProps(store) {
	return { store };
}

function mapDispatchToProps(dispatch) {
	return {
		onUp: (id) => dispatch(up(id)),
		onDown: (id) => dispatch(down(id)),
		onStop: (id) => dispatch(stop(id)),
		onLearn: (id) => dispatch(learn(id)),
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(NavigationalDeviceDetailModal);

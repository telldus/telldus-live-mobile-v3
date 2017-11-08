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
 *
 *
 */

// @flow

'use strict';

import React from 'react';
import { TextInput } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape } from 'react-intl';
import MapView from 'react-native-maps';

import { View, StyleSheet, Dimensions } from 'BaseComponents';
import { LabelBox } from 'AddNewLocation_SubViews';

import {activateGateway} from 'Actions';

const deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	label: {
		id: 'addNewLocation.position.label',
		defaultMessage: 'City',
		description: 'Label for the field City Name',
	},
	headerOne: {
		id: 'addNewLocation.position.headerOne',
		defaultMessage: 'Position',
		description: 'Main Header for the Position Screen',
	},
	headerTwo: {
		id: 'addNewLocation.position.headerTwo',
		defaultMessage: 'Select geographic position',
		description: 'Secondary Header for the Position Screen',
	},
	invalidAddress: {
		id: 'addNewLocation.position.invalidAddress',
		defaultMessage: 'City name can\'t be empty',
		description: 'Local validation text when city name field is left empty',
	},
});

type Props = {
	intl: intlShape.isRequired,
	onDidMount: Function,
};

type State = {
	region: string,
}

class Position extends View {
	props: Props;
	state: State;

	onAddressChange: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			region: '',
		};

		this.h1 = `4. ${props.intl.formatMessage(messages.headerOne)}`;
		this.h2 = props.intl.formatMessage(messages.headerTwo);
		this.label = props.intl.formatMessage(messages.label);

		this.onAddressChange = this.onAddressChange.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	onAddressChange(region: string) {
		this.setState({
			region,
		});
	}

	render() {

		return (
			<View style={styles.container}>
				<View style={styles.body}>
					<LabelBox
						containerStyle={styles.labelContainer}
						label={this.label}
						showIcon={true}>
						<TextInput
							style={styles.address}
							onChangeText={this.region}
							autoCapitalize="none"
							autoCorrect={false}
							underlineColorAndroid="#e26901"
							value={this.state.region}/>
					</LabelBox>
					<View style={styles.mapViewCover}>
						<MapView
							style={styles.map}
							region={{
								latitude: 37.78825,
								longitude: -122.4324,
								latitudeDelta: 0.015,
								longitudeDelta: 0.0121,
							}}
						/>
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
	  flex: 1,
	},
	body: {
		flex: 1,
	},
	mapViewCover: {
		flex: 1,
		marginTop: 10,
		borderRadius: 4,
		overflow: 'hidden',
	},
	map: {
	  flex: 1,
	  overflow: 'hidden',
	},
	locationIcon: {
	},
	address: {
		height: 50,
		width: deviceWidth - 40,
		paddingLeft: 35,
		color: '#A59F9A',
		fontSize: 20,
	},
	hContainer: {
		position: 'absolute',
		right: deviceWidth * 0.124,
		top: deviceWidth * 0.088,
		flex: 1,
		alignItems: 'flex-end',
	},
	h: {
		color: '#fff',
		backgroundColor: 'transparent',
	},
	h1: {
		fontSize: deviceWidth * 0.085333333,
	},
	h2: {
		fontSize: deviceWidth * 0.053333333,
	},

});

function mapDispatchToProps(dispatch): Object {
	return {
		activateGateway: (clientInfo) => {
			return dispatch(activateGateway(clientInfo));
		},
		dispatch,
	};
}

function mapStateToProps(store, ownProps) {
	return {
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(Position);

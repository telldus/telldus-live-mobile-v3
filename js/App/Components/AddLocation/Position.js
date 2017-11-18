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
import { TextInput, KeyboardAvoidingView, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape } from 'react-intl';
import MapView from 'react-native-maps';

import { View, StyleSheet, Dimensions, FloatingButton } from 'BaseComponents';
import { LabelBox } from 'AddNewLocation_SubViews';

import {activateGateway, showModal} from 'Actions';

const deviceWidth = Dimensions.get('window').width;

const messages = defineMessages({
	label: {
		id: 'addNewLocation.position.label',
		defaultMessage: 'Address',
		description: 'Label for the Address field',
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
});

type Props = {
	intl: intlShape.isRequired,
	onDidMount: Function,
	actions: Object,
	navigation: Object,
	activateGateway: (Object) => Promise<any>;
	dispatch: Function,
};

type State = {
	region: Object,
	address: string,
	coordinate: Object,
	latitudeDelta: number,
	longitudeDelta: number,
}

class Position extends View {
	props: Props;
	state: State;

	onAddressChange: () => void;
	onEndEditing: () => void;
	_refs: (Object | any) => mixed;
	onSubmit: () => void;
	onDragEnd: (Object) => void;
	onInfoPress: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

	constructor(props: Props) {
		super(props);

		this.state = {
			address: '',
			isKeyboardShown: false,
			region: new MapView.AnimatedRegion({
				latitude: 55.70584,
				longitude: 13.19321,
				latitudeDelta: 0.24442,
				longitudeDelta: 0.24442,
			}),
			coordinate: {
				latitude: 55.70584,
				longitude: 13.19321,
			},
			latitudeDelta: 0.24442,
			longitudeDelta: 0.24442,
		};

		this.h1 = `4. ${props.intl.formatMessage(messages.headerOne)}`;
		this.h2 = props.intl.formatMessage(messages.headerTwo);
		this.label = props.intl.formatMessage(messages.label);

		this.infoButton = {
			onPress: this.onInfoPress.bind(this),
		};

		this.onAddressChange = this.onAddressChange.bind(this);
		this.onEndEditing = this.onEndEditing.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this._refs = this._refs.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);

		this.keyboardDidShow = this.keyboardDidShow.bind(this);
		this.keyboardDidHide = this.keyboardDidHide.bind(this);
	}

	componentDidMount() {
		const { h1, h2, infoButton} = this;
		this.props.onDidMount(h1, h2, infoButton);
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
	}

	keyboardDidShow() {
		this.setState({
			isKeyboardShown: true,
		});
	}

	keyboardDidHide() {
		this.setState({
			isKeyboardShown: false,
		});
		this.onEndEditing();
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	onInfoPress() {
		this.props.dispatch(showModal(null, {source: 'Position'}));
	}

	onAddressChange(address: string) {
		this.setState({
			address,
		});
	}

	onSubmit() {
		if (this.state.isKeyboardShown) {
			Keyboard.dismiss();
		}
		let clientInfo = this.props.navigation.state.params.clientInfo;
		clientInfo.cordinates = { ...this.state.coordinate };
		this.props.activateGateway(clientInfo)
			.then(response => {
				if (response) {
					this.props.navigation.navigate('Success', {clientInfo});
				}
			});
	}

	onEndEditing() {
		if (this.state.address !== '') {
			this.props.actions.getGeoCodePosition(this.state.address).then(response => {
				if (response.status && response.status === 'OK' && response.results[0]) {
					let { location, viewport } = response.results[0].geometry;
					let latitude = location.lat, longitude = location.lng;
					let { longitudeDelta, latitudeDelta } = this.getDeltas(viewport);
					let region = new MapView.AnimatedRegion({
						latitude,
						longitude,
						latitudeDelta,
						longitudeDelta,
					});
					let coordinate = {
						latitude,
						longitude,
					};
					this.setState({
						region,
						coordinate,
						latitudeDelta,
						longitudeDelta,
					});
				}
			});
		}
	}

	getDeltas(viewport) {
		let { northeast, southwest } = viewport;
		let longitudeDelta = northeast.lng - southwest.lng, latitudeDelta = northeast.lat - southwest.lat;
		return {longitudeDelta, latitudeDelta};
	}

	_refs(map: Object) {
		this.map = map;
	}

	onDragEnd(event: Object) {
		let { coordinate } = event.nativeEvent;
		let { latitudeDelta, longitudeDelta } = this.state;
		let region = new MapView.AnimatedRegion({
			...coordinate,
			latitudeDelta,
			longitudeDelta,
		});
		this.setState({
			region,
			coordinate,
			latitudeDelta,
			longitudeDelta,
		});
	}

	render() {

		return (
			<View style={styles.container}>
				<View style={styles.body}>
					<KeyboardAvoidingView behavior="padding" contentContainerStyle={{justifyContent: 'center'}}>
						<LabelBox
							label={this.label}
							showIcon={true}>
							<TextInput
								style={styles.address}
								onChangeText={this.onAddressChange}
								onEndEditing={this.onEndEditing}
								autoCapitalize="none"
								autoCorrect={false}
								autoFocus={true}
								underlineColorAndroid="#e26901"
								value={this.state.address}/>
						</LabelBox>
					</KeyboardAvoidingView>
					<View style={styles.mapViewCover}>
						<MapView.Animated
							style={styles.map}
							ref={this._refs}
							region={this.state.region}
						>
							<MapView.Marker.Animated
								draggable
								coordinate={this.state.coordinate}
								onDragEnd={this.onDragEnd}/>
						</MapView.Animated>
						<FloatingButton
							buttonStyle={styles.buttonStyle}
							onPress={this.onSubmit}
							imageSource={require('../TabViews/img/right-arrow-key.png')}
							showThrobber={false}
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
	buttonStyle: {
		right: deviceWidth * 0.053333333,
		elevation: 10,
		shadowOpacity: 0.99,
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

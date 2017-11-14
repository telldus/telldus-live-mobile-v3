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
import {ScrollView} from 'react-native';
import { connect } from 'react-redux';
import { defineMessages, intlShape } from 'react-intl';

import { View, StyleSheet, Dimensions, TouchableButton } from 'BaseComponents';
import { Clients } from 'AddNewLocation_SubViews';
import i18n from '../../Translations/common';

let deviceWidth = Dimensions.get('window').width;
let deviceHeight = Dimensions.get('window').height;

const messages = defineMessages({
	headerOne: {
		id: 'addNewLocation.locationDetected.headerOne',
		defaultMessage: 'Select Location',
		description: 'Main header Text for the Location Detected Screen',
	},
	headerTwo: {
		id: 'addNewLocation.locationDetected.headerTwo',
		defaultMessage: 'Setup your TellStick to start',
		description: 'Seconday header Text for the Location Detected Screen',
	},
});

type Props = {
	navigation: Object,
	intl: intlShape.isRequired,
	rootNavigator: Object,
	onDidMount: Function,
}

class LocationDetected extends View {
	props: Props;

	onActivateAuto: (Object) => void;
	onActivateManual: () => void;

	constructor(props: Props) {
		super(props);

		this.h1 = `1. ${props.intl.formatMessage(messages.headerOne)}`;
		this.h2 = props.intl.formatMessage(messages.headerTwo);
		this.buttonLabel = props.intl.formatMessage(i18n.manualActivation).toUpperCase();

		this.onActivateAuto = this.onActivateAuto.bind(this);
		this.onActivateManual = this.onActivateManual.bind(this);
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'LocationDetected';
	}

	onActivateAuto(client) {
		let clientInfo = {
			clientId: client.id,
			uuid: client.uuid,
			type: client.type,
		};
		this.props.navigation.navigate('LocationName', {clientInfo});
	}

	onActivateManual() {
		this.props.navigation.navigate('LocationActivationManual');
	}

	renderClient(client, i) {
		return (
			<Clients key={i} client={client} onPress={this.onActivateAuto}/>
		);
	}

	render() {
		let items = [];
		let {rootNavigator} = this.props;

		if (rootNavigator.state.params.clients) {
			items = rootNavigator.state.params.clients.map((client, i) => {
				return this.renderClient(client, i);
			});
		}

		return (
			<View style={styles.container}>
				<ScrollView contentContainerStyle={styles.itemsContainer}>
					{items}
					<TouchableButton
						style={styles.button}
						onPress={this.onActivateManual}
						text={this.buttonLabel}
					/>
				</ScrollView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	itemsContainer: {
		justifyContent: 'center',
	},
	button: {
		marginTop: 20,
		alignSelf: 'center',
	},
	arrow: {
		position: 'absolute',
		top: deviceHeight * 0.12,
		left: deviceWidth * 0.8,
		elevation: 3,
	},
});

function mapStateToProps(store, ownProps) {
	return {
		store,
	};
}

export default connect(mapStateToProps, null)(LocationDetected);


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
import { logoutFromTelldus } from 'Actions';
import Modal from 'react-native-modal';

const Header = ({ onPress }) => (
    <View style={styles.header}>
        <Icon name="gear" size={26} color="white"
            style={styles.gear}/>
            <Text ellipsizeMode="middle" style={styles.textHeaderTitle}>
                {'Settings'}
            </Text>
            <Icon name="close" size={26} color="white" style={{ flex: 1 }} onPress={onPress} />
    </View>
);

const Button = ({ text, onPress, width }) => (
    <TouchableOpacity
        onPress={onPress}
		style={[styles.button, {
			width: width,
		}]}>
        <Text style={styles.buttonText}>
            {text}
        </Text>
    </TouchableOpacity>
);

class SettingsDetailModal extends View {

	constructor(props) {
		super(props);
		this.state = {
			isVisible: this.props.isVisible,
		};
	}

	render() {
		return (
            <Modal isVisible={this.state.isVisible}>
                <Container style={styles.container}>
                    <Header onPress={this.props.onClose} />
                    <View style={styles.body}>
                        <Text style={styles.versionInfo}>
                            {'You are using version 3.2.0 of Telldus Live! mobile.'}
                        </Text>
                        <Button text={'Submit Push Token'} onPress={this.props.onSubmitPushToken} width={200} />
                        <Button text={'Logout'} onPress={this.props.onLogout} width={100} />
                    </View>
                </Container>
            </Modal>
		);
	}

}

SettingsDetailModal.propTypes = {
	onClose: React.PropTypes.func.isRequired,
	onSubmitPushToken: React.PropTypes.func.isRequired,
	onLogout: React.PropTypes.func.isRequired,
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
		justifyContent: 'center',
		alignItems: 'center',
	},
	button: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#1a355b',
		height: 40,
		marginVertical: 10,
	},
	buttonText: {
		justifyContent: 'center',
		alignItems: 'center',
		color: 'white',
		fontSize: 14,
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	versionInfo: {
		color: '#1a355b',
		fontSize: 14,
		textAlign: 'center',
		textAlignVertical: 'center',
		width: 200,
		height: 45,
		marginVertical: 20,
	},
	gear: {
		flex: 1,
		marginLeft: 8,
	},
});

function mapStateToProps(store) {
	return {
		store,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onSubmitPushToken: () => console.log('TODO: Implement onSubmitPushToken'),
		onLogout: () => dispatch(logoutFromTelldus()),
		dispatch,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SettingsDetailModal);

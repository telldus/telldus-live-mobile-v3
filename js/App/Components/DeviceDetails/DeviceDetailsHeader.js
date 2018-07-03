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
 */

// @flow

'use strict';

import React from 'react';
import { StyleSheet, TouchableOpacity, BackHandler } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';

import { NavigationHeader } from './SubViews';
import { Text, View, Poster, IconTelldus } from '../../../BaseComponents';
import { closeDatabase } from '../../Actions/LocalStorage';
import i18n from '../../Translations/common';
import { hideModal } from '../../Actions';

type Props = {
	hideModal: () => Function,
	device: Object,
	screenProps: Object,
	isModalOpen: boolean,
	navigation: Object,
};

class DeviceDetailsHeader extends View {
	props: Props;

	goBack: () => void;
	handleBackPress: () => boolean;

	constructor(props: Props) {
		super(props);
		this.goBack = this.goBack.bind(this);
		this.handleBackPress = this.handleBackPress.bind(this);

		this.isTablet = DeviceInfo.isTablet();

		let { formatMessage } = props.screenProps.intl;

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;
	}

	goBack() {
		this.props.navigation.goBack();
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let { isModalOpen, hideModal: hideModalProp, screenProps } = this.props;
		let { currentScreen } = screenProps;
		if (isModalOpen) {
			hideModalProp();
			return true;
		}
		if (currentScreen === 'Overview') {
			this.goBack();
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		closeDatabase();
	}

	render(): Object {
		const { navigation, device, screenProps } = this.props;
		const { appLayout } = screenProps;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const {
			posterCover,
			iconBackground,
			deviceIcon,
			textDeviceName,
		} = this.getStyles(appLayout);

		return (
			<View style={styles.container}>
				<NavigationHeader navigation={navigation}/>
				<Poster>
					<View style={posterCover}>
						{(!this.isTablet) && (!isPortrait) &&
							<TouchableOpacity
								style={styles.backButtonLand}
								onPress={this.goBack}
								accessibilityLabel={this.labelLeftIcon}>
								<Icon name="arrow-back" size={width * 0.047} color="#fff"/>
							</TouchableOpacity>
						}
						<View style={iconBackground}>
							<IconTelldus icon="device-alt" style={deviceIcon} />
						</View>
						<Text style={textDeviceName}>
							{device.name}
						</Text>
					</View>
				</Poster>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;

		return {
			posterCover: {
				position: 'absolute',
				top: 0,
				left: 0,
				bottom: 0,
				right: 0,
				alignItems: 'center',
				justifyContent: 'center',
			},
			iconBackground: {
				backgroundColor: '#fff',
				alignItems: 'center',
				justifyContent: 'center',
				width: isPortrait ? height * 0.12 : height * 0.10,
				height: isPortrait ? height * 0.12 : height * 0.10,
				borderRadius: isPortrait ? height * 0.06 : height * 0.05,
				marginRight: isPortrait ? 0 : 10,
			},
			deviceIcon: {
				fontSize: isPortrait ? height * 0.08 : height * 0.06,
				color: '#F06F0C',
			},
			textDeviceName: {
				fontSize: isPortrait ? width * 0.05 : height * 0.05,
				color: '#fff',
			},
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 0,
	},
	backButtonLand: {
		position: 'absolute',
		alignItems: 'flex-start',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		left: 10,
		top: 10,
	},
});

function mapStateToProps(store: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const device = store.devices.byId[id];
	return {
		device,
		isModalOpen: store.modal.openModal,
	};
}
function mapDispatchToProps(dispatch: Function): Object {
	return {
		hideModal: (): Function => dispatch(hideModal()),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDetailsHeader);

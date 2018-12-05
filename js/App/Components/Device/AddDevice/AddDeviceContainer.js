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
import { BackHandler, KeyboardAvoidingView } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
	View,
	DialogueBox,
	NavigationHeaderPoster,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

import * as modalActions from '../../../Actions/Modal';
import {
	getGateways,
	sendSocketMessage,
	getSocketObject,
	setDeviceName,
	getDevices,
	getDeviceManufacturerInfo,
	showToast,
	processWebsocketMessageForDevice,
	processWebsocketMessageForZWave,
} from '../../../Actions';

type Props = {
	gateways: Array<string>,
	addDevice: Object,
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	showModal: boolean,
	validationMessage: any,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
};

class AddDeviceContainer extends View<Props, State> {

	handleBackPress: () => void;

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		children: PropTypes.object.isRequired,
		actions: PropTypes.objectOf(PropTypes.func),
		screenProps: PropTypes.object,
		showModal: PropTypes.bool,
		validationMessage: PropTypes.any,
	};

	state = {
		h1: '',
		h2: '',
		infoButton: null,
	};

	constructor(props: Props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};

		this.closeModal = this.closeModal.bind(this);
		this.handleBackPress = this.handleBackPress.bind(this);
		this.getRelativeData = this.getRelativeData.bind(this);
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let {navigation} = this.props;
		navigation.pop();
		return true;
	}

	onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton,
		});
	};

	closeModal = () => {
		this.props.actions.hideModal();
	};

	getRelativeData = (styles: Object): Object => {
		let {validationMessage} = this.props;
		return {
			dialogueHeader: false,
			validationMessage: validationMessage,
			positiveText: false,
		};
	};

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			showModal,
			navigation,
			gateways,
			addDevice,
		} = this.props;
		const { appLayout } = screenProps;
		const { h1, h2, infoButton } = this.state;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const deviceWidth = isPortrait ? width : height;

		const styles = this.getStyle(appLayout);

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const { dialogueHeader, validationMessage, positiveText } = this.getRelativeData(styles);

		return (
			<View style={{
				flex: 1,
			}}>
				<KeyboardAvoidingView behavior="padding" style={{flex: 1}} contentContainerStyle={{ justifyContent: 'center'}}>
					<NavigationHeaderPoster
						h1={h1} h2={h2}
						infoButton={infoButton}
						align={'right'}
						navigation={navigation}
						{...screenProps}/>
					<View style={[styles.style, {paddingHorizontal: padding}]}>
						{React.cloneElement(
							children,
							{
								onDidMount: this.onChildDidMount,
								actions,
								...screenProps,
								navigation,
								dialogueOpen: showModal,
								paddingHorizontal: padding,
								gateways,
								addDevice,
							},
						)}
					</View>
				</KeyboardAvoidingView>
				<DialogueBox
					dialogueContainerStyle={{elevation: 0}}
					header={dialogueHeader}
					showDialogue={showModal}
					text={validationMessage}
					showPositive={true}
					positiveText={positiveText}
					onPressPositive={this.closeModal}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		return {
			style: {
				flex: 1,
			},
		};
	}
}

const mapStateToProps = (store: Object): Object => {
	const { openModal, data, extras } = store.modal;
	return {
		showModal: openModal,
		validationMessage: data,
		modalExtras: extras,
		gateways: store.gateways.allIds,
		addDevice: store.addDevice,
	};
};

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				...modalActions,
				getGateways,
				sendSocketMessage,
				getSocketObject,
				setDeviceName,
				getDevices,
				getDeviceManufacturerInfo,
				showToast,
				processWebsocketMessageForDevice,
				processWebsocketMessageForZWave,
			}, dispatch),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(AddDeviceContainer);

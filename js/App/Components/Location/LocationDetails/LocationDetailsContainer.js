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
import { BackHandler, ScrollView, KeyboardAvoidingView } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { View, DialogueBox, NavigationHeaderPoster } from '../../../../BaseComponents';

import * as modalActions from '../../../Actions/Modal';
import * as gatewayActions from '../../../Actions/Gateways';
import * as appDataActions from '../../../Actions/AppData';

import Theme from '../../../Theme';

type Props = {
	ScreenName: string,
	screenProps: Object,
	showModal: boolean,
	validationMessage: any,

	navigation: Object,
	children: Object,
	actions?: Object,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
};

class LocationDetailsContainer extends View<null, Props, State> {

	handleBackPress: () => void;
	closeModal: () => void;

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

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		if (nextProps.ScreenName === nextProps.screenProps.currentScreen) {
			const isStateEqual = _.isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}
			const isPropsEqual = _.isEqual(this.props, nextProps);
			return isPropsEqual;
		}
		return false;
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

	getModalData(extras: any): Object {
		return {
			modalHeader: null,
			positiveText: null,
			showNegative: false,
			onPressPositive: this.closeModal,
			onPressNegative: null,
		};
	}

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			showModal,
			validationMessage,
			modalExtras,
			navigation,
		} = this.props;
		const {
			appLayout,
			currentScreen,
		} = screenProps;
		const { h1, h2, infoButton } = this.state;
		const styles = this.getStyle(appLayout);
		const { modalHeader, positiveText, showNegative, onPressPositive, onPressNegative } = this.getModalData(modalExtras);
		const location = navigation.getParam('location', {});

		let { width, height } = appLayout;
		let deviceWidth = height > width ? width : height;
		let padding = currentScreen === 'Details' ? width * Theme.Core.paddingFactor : deviceWidth * Theme.Core.paddingFactor;
		let paddingHorizontal = currentScreen === 'EditTimeZoneCity' || currentScreen === 'EditTimeZoneContinent' ? 0 : padding;
		let sharedProps = {
			...screenProps,
			infoButton,
			navigation,
		};
		let posterData = currentScreen === 'Details' ?
			{
				...sharedProps,
				icon: 'location',
				h2: location.name,
				align: 'center',
				leftIcon: 'close',
			} :
			{
				...sharedProps,
				h1,
				h2,
				align: 'right',
			};

		return (
			<View style={{
				flex: 1,
				backgroundColor: Theme.Core.appBackground,
			}}>
				<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} contentContainerStyle={{flexGrow: 1}}>
					<KeyboardAvoidingView behavior="padding" style={{flex: 1}} contentContainerStyle={{ justifyContent: 'center'}}>
						<NavigationHeaderPoster {...posterData}/>
						<View style={[styles.style, {paddingHorizontal}]}>
							{React.cloneElement(
								children,
								{
									onDidMount: this.onChildDidMount,
									actions,
									...screenProps,
									navigation,
									dialogueOpen: showModal,
									containerWidth: width - (2 * paddingHorizontal),
								},
							)}
						</View>
					</KeyboardAvoidingView>
				</ScrollView>
				<DialogueBox
					dialogueContainerStyle={{elevation: 0}}
					header={modalHeader}
					showDialogue={showModal}
					text={validationMessage}
					showPositive={true}
					showNegative={showNegative}
					positiveText={positiveText}
					onPressPositive={onPressPositive}
					onPressNegative={onPressNegative}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const posterHeight = isPortrait ? width * 0.333333333 : height * 0.333333333;

		return {
			style: {
				flex: 1,
			},
			infoButtonContainer: {
				position: 'relative',
				right: 0,
				bottom: 0,
			},
			posterCover: {
				flex: 1,
				position: 'absolute',
				alignItems: 'center',
				justifyContent: 'center',
				left: 0,
				top: 0,
				bottom: 0,
				right: 0,
			},
			posterText: {
				fontSize: isPortrait ? width * 0.053333333 : height * 0.053333333,
				color: '#fff',
				marginTop: 5,
			},
			posterIconContainer: {
				backgroundColor: '#fff',
				height: posterHeight * 0.5,
				width: posterHeight * 0.5,
				borderRadius: posterHeight * 0.25,
				alignItems: 'center',
				justifyContent: 'center',
			},
			posterIcon: {
				fontSize: posterHeight * 0.35,
				color: Theme.Core.brandSecondary,
			},
		};
	}
}

const mapStateToProps = (store: Object): Object => (
	{
		showModal: store.modal.openModal,
		validationMessage: store.modal.data,
		modalExtras: store.modal.extras,
	}
);

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({...modalActions, ...gatewayActions, ...appDataActions}, dispatch),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(LocationDetailsContainer);

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
import { BackHandler, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import { View, NavigationHeaderPoster } from '../../../../BaseComponents';

import * as modalActions from '../../../Actions/Modal';
import * as gatewayActions from '../../../Actions/Gateways';
import * as appDataActions from '../../../Actions/AppData';
import { createSupportTicketLCT, showToast } from '../../../Actions/App';

import {
	getTokenForLocalControl,
} from '../../../Lib';

import Theme from '../../../Theme';

type Props = {
	ScreenName: string,
	screenProps: Object,
	location: Object,
	email: string,
	route: Object,
	currentScreen: string,

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

	handleBackPress: () => boolean;

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
		if (nextProps.ScreenName === nextProps.currentScreen) {
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

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			currentScreen,
			navigation,
			location,
			email,
			route,
		} = this.props;
		const {
			appLayout,
		} = screenProps;
		const { h1, h2, infoButton } = this.state;
		const styles = this.getStyle(appLayout);
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
				align: 'left',
				leftIcon: currentScreen === 'TestLocalControl' || currentScreen === 'RequestSupport' ? 'close' : undefined,
			};

		return (
			<View
				level={3}
				style={{
					flex: 1,
				}}>
				<KeyboardAvoidingView
					behavior="padding"
					style={{flex: 1}}
					contentContainerStyle={{ justifyContent: 'center'}}
					keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
					<NavigationHeaderPoster {...posterData}/>
					<ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'always'} contentContainerStyle={{flexGrow: 1}}>
						<View style={[styles.style, {paddingHorizontal}]}>
							{React.cloneElement(
								children,
								{
									onDidMount: this.onChildDidMount,
									actions,
									...screenProps,
									currentScreen,
									navigation,
									containerWidth: width - (2 * paddingHorizontal),
									location,
									email,
									route,
								},
							)}
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
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
		};
	}
}

const mapStateToProps = (store: Object, ownProps: Object): Object => {
	const {
		location = {},
	} = ownProps.route.params || {};
	const { id } = location;

	const { userProfile = {} } = store.user;
	const { email } = userProfile;

	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		location: store.gateways.byId[id],
		email,
		currentScreen,
	};
};

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({
				...gatewayActions,
				...modalActions,
				...appDataActions,
				getTokenForLocalControl,
				createSupportTicketLCT,
				showToast,
			}, dispatch),
		},
	}
);

export default (connect(mapStateToProps, mapDispatchToProps)(LocationDetailsContainer): Object);

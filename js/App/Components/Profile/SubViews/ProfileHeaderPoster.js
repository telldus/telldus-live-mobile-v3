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
import { connect } from 'react-redux';

import { View, NavigationHeaderPoster } from '../../../../BaseComponents';
import i18n from '../../../Translations/common';
import { hideModal } from '../../../Actions';
import capitalize from '../../../Lib/capitalize';

type Props = {
	hideModal: () => Function,
	deviceName: string,
	deviceType: string,
	screenProps: Object,
	isModalOpen: boolean,
	navigation: Object,
	currentScreen: string,
};

class ProfileHeaderPoster extends View<Props, null> {
	props: Props;

	handleBackPress: () => boolean;

	noName: string;

	pointsToHiddenCave: number;
	openCaveTimeout: any;

	constructor(props: Props) {
		super(props);
		this.handleBackPress = this.handleBackPress.bind(this);

		this.pointsToHiddenCave = 0;
		this.openCaveTimeout = null;
	}

	goBack() {
		this.props.navigation.goBack();
	}

	handleBackPress(): boolean {
		let { isModalOpen, hideModal: hideModalProp, currentScreen } = this.props;
		if (isModalOpen) {
			hideModalProp();
			return true;
		}
		if (currentScreen === 'AppTab') {
			this.goBack();
			return true;
		}
		return false;
	}

	clearOpenCaveTimeout = () => {
		clearTimeout(this.openCaveTimeout);
		this.openCaveTimeout = null;
	}

	componentWillUnmount() {
		this.clearOpenCaveTimeout();
	}

	openHiddenCave = () => {
		this.pointsToHiddenCave++;

		if (this.openCaveTimeout) {
			this.clearOpenCaveTimeout();
		}

		this.openCaveTimeout = setTimeout(() => {
			this.pointsToHiddenCave = 0;
		}, 500);

		if (this.pointsToHiddenCave >= 5) {
			this.pointsToHiddenCave = 0;
			this.props.navigation.navigate('AdvancedSettings');
		}
	}

	render(): Object {
		const { navigation, screenProps } = this.props;
		const { appLayout, intl } = screenProps;

		return (
			<NavigationHeaderPoster
				h1={capitalize(intl.formatMessage(i18n.headerOneProfileAndSettings))}
				h2={intl.formatMessage(i18n.headerTwoProfileAndSettings)}
				appLayout={appLayout}
				intl={intl}
				navigation={navigation}
				handleBackPress={this.handleBackPress}
				leftIcon={'close'}
				align={'left'}
				onPressPoster={this.openHiddenCave}/>
		);
	}
}

function mapStateToProps(store: Object, ownProps: Object): Object {

	const {
		screen: currentScreen,
	} = store.navigation;

	return {
		isModalOpen: store.modal.openModal,
		currentScreen,
	};
}
function mapDispatchToProps(dispatch: Function): Object {
	return {
		hideModal: (): Function => dispatch(hideModal()),
	};
}

export default (connect(mapStateToProps, mapDispatchToProps)(ProfileHeaderPoster): Object);

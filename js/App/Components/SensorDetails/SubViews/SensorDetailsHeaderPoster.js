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
import { closeDatabase } from '../../../Actions/LocalStorage';
import i18n from '../../../Translations/common';

type Props = {
	sensorName: string,
	screenProps: Object,
	navigation: Object,
};

class SensorDetailsHeaderPoster extends View<Props, null> {
	props: Props;

	handleBackPress: () => boolean;

	noName: string;

	constructor(props: Props) {
		super(props);
		this.handleBackPress = this.handleBackPress.bind(this);

		let { formatMessage } = props.screenProps.intl;

		this.noName = formatMessage(i18n.noName);
	}

	goBack() {
		this.props.navigation.goBack();
	}

	handleBackPress(): boolean {
		let { screenProps } = this.props;
		let { currentScreen } = screenProps;
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
		const { navigation, screenProps } = this.props;
		const { appLayout, intl } = screenProps;

		let { sensorName } = this.props;
		sensorName = sensorName ? sensorName : this.noName;

		return (
			<NavigationHeaderPoster
				icon={'sensor'}
				h2={sensorName}
				appLayout={appLayout}
				intl={intl}
				navigation={navigation}
				handleBackPress={this.handleBackPress}
				leftIcon={'close'}
			/>
		);
	}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const { name: sensorName } = store.sensors.byId[id] ? store.sensors.byId[id] : {};
	return {
		sensorName,
	};
}

export default connect(mapStateToProps, null)(SensorDetailsHeaderPoster);

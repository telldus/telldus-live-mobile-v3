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
	gatewayName: string,
	screenProps: Object,
	navigation: Object,
};

class LocationDetailsHeaderPoster extends View<Props, null> {
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
		if (currentScreen === 'LOverview') {
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

		let { gatewayName } = this.props;
		gatewayName = gatewayName ? gatewayName : this.noName;

		return (
			<NavigationHeaderPoster
				icon={'location'}
				h2={gatewayName}
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
	const { id } = ownProps.navigation.getParam('location', {});
	const { name: gatewayName } = store.gateways.byId[id] ? store.gateways.byId[id] : {};
	return {
		gatewayName,
	};
}

export default connect(mapStateToProps, null)(LocationDetailsHeaderPoster);

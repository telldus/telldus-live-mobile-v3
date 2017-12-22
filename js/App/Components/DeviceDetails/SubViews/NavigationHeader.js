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
 * @flow
 */

'use strict';
import React from 'React';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { View, Header, StyleSheet } from 'BaseComponents';
import { hasStatusBar } from 'Lib';

type Props = {
	navigation: Object,
	appLayout: Object,
};

class NavigationHeader extends View {

	goBack: () => void;

	constructor(props: Props) {
		super(props);
		this.isTablet = DeviceInfo.isTablet();
		this.goBack = this.goBack.bind(this);
	}

	goBack() {
		this.props.navigation.goBack(null);
	}

	getLeftIcon() {
		let { appLayout } = this.props;
		let size = appLayout.height > appLayout.width ? appLayout.width * 0.075 : appLayout.height * 0.075;

		return (
			<Icon name="arrow-back" size={size} color="#fff"/>
		);
	}

	render() {
		let { appLayout } = this.props;

		if (appLayout.height < appLayout.width && !this.isTablet) {
			return <View style={styles.emptyHeader}/>;
		}

		let leftIcon = {
			component: this.getLeftIcon(),
			onPress: this.goBack,
		};
		return (
			<Header leftButton={leftIcon}/>
		);
	}
}

const styles = StyleSheet.create({
	emptyHeader: {
		marginTop: hasStatusBar() ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0,
		height: 0,
		width: 0,
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, null)(NavigationHeader);

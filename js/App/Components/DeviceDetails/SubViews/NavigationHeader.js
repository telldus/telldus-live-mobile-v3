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
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { intlShape, injectIntl } from 'react-intl';
import { isIphoneX } from 'react-native-iphone-x-helper';

import { View, Header, StyleSheet } from '../../../../BaseComponents';
import { hasStatusBar } from '../../../Lib';
import i18n from '../../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	intl: intlShape.isRequired,
	showLeftIcon?: boolean,
	topMargin?: boolean,
};

type DefaultProps = {
	topMargin: boolean,
	showLeftIcon: boolean,
};

class NavigationHeader extends View {

	goBack: () => void;

	static defaultProps: DefaultProps = {
		showLeftIcon: true,
		topMargin: true,
	}

	constructor(props: Props) {
		super(props);
		this.isTablet = DeviceInfo.isTablet();
		this.goBack = this.goBack.bind(this);

		let { formatMessage } = props.intl;

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;
	}

	goBack() {
		this.props.navigation.goBack(null);
	}

	getLeftIcon(): Object {
		let { appLayout } = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let size = isPortrait ? width * 0.06 : height * 0.06;

		return (
			<Icon name="arrow-back" size={size} color="#fff" style={styles.iconLeft}/>
		);
	}

	render(): Object {
		let { appLayout, showLeftIcon, topMargin } = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceHeight = isPortrait ? height : width;

		const statusBarHeight = topMargin && hasStatusBar() ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0;

		if (height < width && !this.isTablet) {
			return <View style={{
				marginTop: statusBarHeight,
				height: 0,
				width: 0,
			}}/>;
		}

		let leftIcon = showLeftIcon ? {
			component: this.getLeftIcon(),
			onPress: this.goBack,
			accessibilityLabel: this.labelLeftIcon,
		} : null;
		return (
			<Header leftButton={leftIcon} style={{height: (isIphoneX() ? deviceHeight * 0.08 : deviceHeight * 0.1111 )}}/>
		);
	}
}

const styles = StyleSheet.create({
	iconLeft: {
		paddingVertical: 10,
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(NavigationHeader));

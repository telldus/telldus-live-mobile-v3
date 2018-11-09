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
import React, { PureComponent } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import ExtraDimensions from 'react-native-extra-dimensions-android';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { intlShape, injectIntl } from 'react-intl';
import { isIphoneX } from 'react-native-iphone-x-helper';

import View from './View';
import Header from './Header';
import { hasStatusBar } from '../App/Lib';
import i18n from '../App/Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	intl: intlShape.isRequired,
	showLeftIcon?: boolean,
	topMargin?: boolean,
	leftIcon?: string,
};

type DefaultProps = {
	topMargin: boolean,
	showLeftIcon: boolean,
	leftIcon: string,
};

class NavigationHeader extends PureComponent<Props, null> {
	props: Props;

	goBack: () => void;
	isTablet: boolean;
	defaultDescription: string;
	labelLeftIcon: string;

	static defaultProps: DefaultProps = {
		showLeftIcon: true,
		topMargin: true,
		leftIcon: Platform.OS === 'ios' ? 'angle-left' : 'arrow-back',
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
		this.props.navigation.pop();
	}

	getLeftIcon(): Object {
		let { appLayout, leftIcon } = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let size = isPortrait ? width * 0.06 : height * 0.06;
		if (Platform.OS === 'ios' && leftIcon !== 'close') {
			return (
				<FontAwesome name={leftIcon} size={size} color="#fff" style={styles.iconLeft}/>
			);
		}

		return (
			<MaterialIcons name={leftIcon} size={size} color="#fff" style={styles.iconLeft}/>
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
			<Header
				leftButton={leftIcon}
				appLayout={appLayout}
				style={{
					height: Platform.OS === 'android' ?
						deviceHeight * 0.08
						:
						(isIphoneX() ? deviceHeight * 0.08 : deviceHeight * 0.1111 ),
				}}/>
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
		appLayout: store.app.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(NavigationHeader));

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
import { StyleSheet, Platform, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
const ExtraDimensions = Platform.OS === 'ios' ? {} : require('react-native-extra-dimensions-android');
import { intlShape, injectIntl } from 'react-intl';

import View from './View';
import Header from './Header';
import ThemedMaterialIcon from './ThemedMaterialIcon';
import Icon from './Icon';

import Theme from '../App/Theme';
import i18n from '../App/Translations/common';
import { hasStatusBar } from '../App/Lib';

type Props = {
	navigation: Object,
	appLayout: Object,
	intl: intlShape.isRequired,
	showLeftIcon?: boolean,
	topMargin?: boolean,
	leftIcon?: string,
	isFromModal?: boolean,
	onClose: () => void,
	goBack: () => void,
	forceHideStatus?: boolean,
	rightButton?: Object,
	onPressLogo?: Function,
};

type DefaultProps = {
	topMargin: boolean,
	showLeftIcon: boolean,
	leftIcon: string,
	isFromModal: boolean,
	forceHideStatus?: boolean,
};

type State = {
	keyboard: boolean,
	hasStatusBar: boolean,
};

class NavigationHeader extends PureComponent<Props, State> {
	props: Props;
	state: State;

	goBack: () => void;
	isTablet: boolean;
	isFromModal: boolean;
	defaultDescription: string;
	labelLeftIcon: string;

	_keyboardDidShow: () => void;
	_keyboardDidHide: () => void;
	keyboardDidShowListener: Object;
	keyboardDidHideListener: Object;

	_hasStatusBar: () => void;

	static defaultProps: DefaultProps = {
		isFromModal: false,
		showLeftIcon: true,
		topMargin: true,
		leftIcon: Platform.OS === 'ios' ? 'angle-left' : 'arrow-back',
		forceHideStatus: false,
	}

	constructor(props: Props) {
		super(props);
		this.isTablet = DeviceInfo.isTablet();
		this.goBack = this.goBack.bind(this);

		let { formatMessage } = props.intl;

		this.state = {
			keyboard: false,
			hasStatusBar: false,
		};

		this._hasStatusBar();

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelLeftIcon = `${formatMessage(i18n.navigationBackButton)} .${this.defaultDescription}`;
	}

	componentDidMount() {
		this.keyboardDidShowListener = Keyboard.addListener(
		  'keyboardDidShow',
		  this._keyboardDidShow,
		);
		this.keyboardDidHideListener = Keyboard.addListener(
		  'keyboardDidHide',
		  this._keyboardDidHide,
		);
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	_hasStatusBar = async () => {
		const _hasStatusBar = await hasStatusBar();
		this.setState({
			hasStatusBar: _hasStatusBar,
		});
	}


	_keyboardDidShow = () => {
		this.setState({
			keyboard: true,
		});
	}

	_keyboardDidHide = () => {
		this.setState({
			keyboard: false,
		});
	}

	goBack() {
		const { isFromModal, onClose, goBack } = this.props;
		if (goBack) {
			goBack();
			return;
		}
		if (isFromModal) {
			onClose();
		} else {
			if (this.state.keyboard) {
				Keyboard.dismiss();
				return;
			}
			this.props.navigation.pop();
		}
	}

	getLeftIcon(): Object {
		const { appLayout, leftIcon } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const {
			headerButtonIconSizeFactor,
		} = Theme.Core;

		let size = isPortrait ? width * headerButtonIconSizeFactor : height * headerButtonIconSizeFactor;
		if (Platform.OS === 'ios' && leftIcon !== 'close') {
			return (
				<Icon
					level={22}
					name={leftIcon}
					size={size}
					style={styles.iconLeft}/>
			);
		}

		return (
			<ThemedMaterialIcon
				level={22}
				name={leftIcon}
				size={size}
				style={styles.iconLeft}/>
		);
	}

	render(): Object {
		let {
			appLayout,
			showLeftIcon,
			topMargin,
			forceHideStatus,
			rightButton,
			onPressLogo,
		} = this.props;
		let { height, width } = appLayout;
		let isPortrait = height > width;
		let deviceHeight = isPortrait ? height : width;

		const statusBarHeight = (topMargin && this.state.hasStatusBar && Platform.OS === 'android') ? ExtraDimensions.get('STATUS_BAR_HEIGHT') : 0;

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

		const { land } = Theme.Core.headerHeightFactor;
		return (
			<Header
				forceHideStatus={forceHideStatus}
				leftButton={leftIcon}
				rightButton={rightButton}
				style={{
					height: Platform.OS === 'android' ?
						deviceHeight * 0.08
						:
						deviceHeight * land,
				}}
				onPressLogo={onPressLogo}/>
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

export default (connect(mapStateToProps, null)(injectIntl(NavigationHeader)): Object);

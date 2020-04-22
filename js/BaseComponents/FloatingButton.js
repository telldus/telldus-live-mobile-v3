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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Image, Platform, TouchableOpacity } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import View from './View';
import IconTelldus from './IconTelldus';
import Throbber from './Throbber';
import Theme from '../App/Theme';
import i18n from '../App/Translations/common';

type DefaultProps = {
	tabs: boolean,
	paddingRight: number,
	disabled: boolean,
};

type Props = {
	onPress?: Function,
	imageSource?: Object,
	tabs: boolean,
	iconSize: number,
	paddingRight: number,
	showThrobber: boolean,
	buttonStyle: Array<any> | Object,
	appLayout: Object,
	accessible: boolean,
	accessibilityLabel?: string,
	intl: intlShape.isRequired,
	iconStyle?: Object,
	iconName?: string,
	customComponent?: Object,
	disabled?: boolean,
	innerContainer?: Array<any> | Object,
};

class FloatingButton extends Component<Props, null> {
	defaultDescription: string;
	labelButton: string;
	defaultLabel: string;
	props: Props;

	static defaultProps: DefaultProps = {
		tabs: false,
		paddingRight: 0,
		showThrobber: false,
		accessible: true,
		disabled: false,
	};

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelButton = `${formatMessage(i18n.button)}`;
		this.defaultLabel = `${formatMessage(i18n.next)} ${this.labelButton}. ${this.defaultDescription}`;
	}

	render(): Object {
		let {
			buttonStyle,
			onPress,
			imageSource,
			iconName,
			showThrobber,
			appLayout,
			accessible,
			accessibilityLabel,
			iconStyle,
			customComponent,
			disabled,
			innerContainer,
		} = this.props;
		accessibilityLabel = accessible ? (accessibilityLabel ? accessibilityLabel : this.defaultLabel) : '';

		const { container, innerContainerDef, icon, throbber } = this._getStyle(appLayout);

		return (
			<TouchableOpacity
				style={[container, buttonStyle]}
				onPress={onPress}
				accessible={accessible}
				accessibilityLabel={accessibilityLabel}
				disabled={disabled}>
				<View style={[innerContainerDef, innerContainer]}>
					{!!imageSource &&
					(
						<Image source={imageSource} style={[icon, iconStyle]} resizeMode="contain"/>
					)
					}
					{!!iconName &&
						(
							<IconTelldus icon={iconName} style={[{
								color: '#fff',
							}, iconStyle]}/>
						)
					}
					{
						!!customComponent && customComponent
					}
					{!!showThrobber &&
					(
						<Throbber
							throbberStyle={throbber}
						/>
					)
					}
				</View>
			</TouchableOpacity>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const {
			shadow: themeShadow,
			brandSecondary,
			maxSizeFloatingButton,
			btnDisabledBg,
		} = Theme.Core;
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const maxIconSize = 40;

		let { tabs, iconSize, paddingRight, disabled } = this.props;
		iconSize = iconSize ? iconSize : isPortrait ? width * 0.056 : height * 0.056;
		iconSize = iconSize > maxIconSize ? maxIconSize : iconSize;

		const isIOSTabs = Platform.OS === 'ios' && tabs;

		let buttonSize = deviceWidth * 0.134666667;
		buttonSize = buttonSize > maxSizeFloatingButton ? maxSizeFloatingButton : buttonSize;
		const offsetBottom = deviceWidth * 0.046666667 + (isIOSTabs ? 50 : 0);
		const offsetRight = deviceWidth * 0.034666667 - paddingRight;

		const shadow = Object.assign({}, themeShadow, {
			shadowOpacity: 0.35,
			shadowOffset: {
				...themeShadow.shadowOffset,
				height: 2,
			},
			elevation: 5,
		});

		return {
			container: {
				backgroundColor: disabled ? btnDisabledBg : brandSecondary,
				borderRadius: buttonSize / 2,
				position: 'absolute',
				height: buttonSize,
				width: buttonSize,
				bottom: offsetBottom,
				right: offsetRight,
				...shadow,
			},
			innerContainerDef: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
			},
			icon: {
				width: iconSize,
				height: iconSize,
			},
			throbber: {
				color: '#ffffff',
			},
		};
	};

}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.app.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(FloatingButton));

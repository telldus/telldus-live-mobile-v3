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
import PropTypes from 'prop-types';
import { Image, Platform, TouchableOpacity } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import View from './View';
import Throbber from './Throbber';
import Theme from 'Theme';
import i18n from '../App/Translations/common';

type DefaultProps = {
	tabs: boolean,
	paddingRight: number,
};

type Props = {
	onPress: Function,
	imageSource: number | boolean,
	tabs: boolean,
	iconSize: number,
	paddingRight: number,
	showThrobber: boolean,
	buttonStyle: number | Array<any> | Object,
	appLayout: Object,
	accessible: boolean,
	accessibilityLabel?: string,
	intl: intlShape.isRequired,
};

class FloatingButton extends Component<Props, null> {
	defaultDescription: string;
	labelButton: string;
	defaultLabel: string;
	props: Props;

	static propTypes = {
		onPress: PropTypes.func.isRequired,
		imageSource: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
		tabs: PropTypes.bool,
		iconSize: PropTypes.number,
		paddingRight: PropTypes.number,
		showThrobber: PropTypes.bool,
		buttonStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.object]),
	};

	static defaultProps: DefaultProps = {
		tabs: false,
		paddingRight: 0,
		showThrobber: false,
		accessible: true,
	};

	constructor(props: Props) {
		super(props);

		let { formatMessage } = props.intl;

		this.defaultDescription = `${formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelButton = `${formatMessage(i18n.button)}`;
		this.defaultLabel = `${formatMessage(i18n.next)} ${this.labelButton}. ${this.defaultDescription}`;
	}

	render(): Object {
		let { buttonStyle, onPress, imageSource, showThrobber, appLayout, accessible, accessibilityLabel } = this.props;
		accessibilityLabel = accessible ? (accessibilityLabel ? accessibilityLabel : this.defaultLabel) : '';

		const { container, button, icon, throbber } = this._getStyle(appLayout);

		return (
			<TouchableOpacity style={[container, buttonStyle]} onPress={onPress} accessible={accessible} accessibilityLabel={accessibilityLabel}>
				<View style={button}>
					{!!imageSource &&
					(
						<Image source={imageSource} style={icon} resizeMode="contain"/>
					)
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
		const { shadow: themeShadow, brandSecondary } = Theme.Core;
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		let { tabs, iconSize, paddingRight } = this.props;
		iconSize = iconSize ? iconSize : isPortrait ? width * 0.056 : height * 0.056;

		const isIOSTabs = Platform.OS === 'ios' && tabs;

		const buttonSize = deviceWidth * 0.134666667;
		const offsetBottom = deviceWidth * 0.046666667 + (isIOSTabs ? 50 : 0);
		const offsetRight = deviceWidth * 0.034666667 - paddingRight;

		const shadow = Object.assign({}, themeShadow, {
			shadowOpacity: 0.5,
			shadowOffset: {
				...themeShadow.shadowOffset,
				height: 2,
			},
		});

		return {
			container: {
				backgroundColor: brandSecondary,
				borderRadius: buttonSize / 2,
				position: 'absolute',
				height: buttonSize,
				width: buttonSize,
				bottom: offsetBottom,
				right: offsetRight,
				...shadow,
			},
			button: {
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

function mapStateToProps(state, ownProps) {
	return {
		appLayout: state.App.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(FloatingButton));

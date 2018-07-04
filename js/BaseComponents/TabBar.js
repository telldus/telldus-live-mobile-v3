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
import { intlShape, injectIntl } from 'react-intl';

import View from './View';
import FormattedMessage from './FormattedMessage';
import { getRelativeDimensions } from '../App/Lib';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_home from '../App/Components/TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_home);

type Props = {
	icon: string,
	tintColor: number | string,
	label: any,
	appLayout: Object,
	intl: intlShape.isRequired,
	accessibilityLabel?: Object,
};

class TabBar extends Component<Props, null> {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		let { icon, tintColor, label, intl, accessibilityLabel, appLayout } = this.props;
		accessibilityLabel = intl.formatMessage(accessibilityLabel);

		const {
			iconSize,
			container,
			labelStyle,
		} = this.getStyles(appLayout);

		return (
			<View style={container} accessibilityLabel={accessibilityLabel}>
				<CustomIcon name={icon} size={iconSize} color={tintColor}/>
				<FormattedMessage {...label} style={[labelStyle, {color: tintColor}]}/>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { width, height } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const iconSize = deviceWidth * 0.05;
		const fontSize = deviceWidth * 0.03;

		return {
			container: {
				flexDirection: 'row',
				alignItems: 'center',
			},
			iconSize,
			labelStyle: {
				fontSize,
				paddingLeft: 5 + (fontSize * 0.2),
			},
		};
	}
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: getRelativeDimensions(state.app.layout),
	};
}

module.exports = connect(mapStateToProps, null)(injectIntl(TabBar));

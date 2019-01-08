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
import { TouchableOpacity } from 'react-native';
import { intlShape, injectIntl } from 'react-intl';

import i18n from '../App/Translations/common';
import Text from './Text';
import Theme from '../App/Theme';

type Props = {
	style?: Object | number | Array<any>,
	text: string | Object,
	labelStyle?: Object | number | Array<any>,
	onPress: Function,
	intl: intlShape.isRequired,
	postScript?: any,
	preScript?: any,
	appLayout: Object,
	accessible: boolean,
	accessibilityLabel?: string,
};

class TouchableButton extends Component<Props, void> {
	onPress: () => void;
	defaultDescription: string;
	labelButton: string;

	props: Props;

	constructor(props: Props) {
		super(props);
		this.onPress = this.onPress.bind(this);

		this.defaultDescription = `${props.intl.formatMessage(i18n.defaultDescriptionButton)}`;
		this.labelButton = `${props.intl.formatMessage(i18n.button)}`;
	}

	onPress = () => {
		let {onPress} = this.props;
		if (onPress) {
			if (typeof onPress === 'function') {
				onPress();
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}


	render(): Object {
		let { style, labelStyle, intl, text, preScript, postScript, accessibilityLabel, accessible } = this.props;
		let label = typeof text === 'string' ? text : intl.formatMessage(text);
		let shadow = Theme.Core.shadow;
		accessibilityLabel = !accessible ? '' :
			accessibilityLabel ? accessibilityLabel : `${label} ${this.labelButton}, ${this.defaultDescription}`;
		let importantForAccessibility = !accessible ? 'no-hide-descendants' : 'yes';

		let {
			buttonContainer,
			buttonLabel,
		} = this.getStyle();

		return (
			<TouchableOpacity
				accessible={accessible}
				importantForAccessibility={importantForAccessibility}
				accessibilityLabel={accessibilityLabel}
				style={[shadow, buttonContainer, style]}
				onPress={this.onPress}>
				<Text style={[buttonLabel, labelStyle]}
					accessible={accessible}
					importantForAccessibility={importantForAccessibility}>
					{preScript}{label.toUpperCase()}{postScript}
				</Text>
			</TouchableOpacity>
		);
	}

	getStyle = (): Object => {
		const { maxSizeTextButton, btnPrimaryBg } = Theme.Core;
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const maxFontSize = maxSizeTextButton;

		let fontSize = deviceWidth * 0.04;
		fontSize = fontSize > maxFontSize ? maxFontSize : fontSize;

		const borderRadius = 18 + fontSize;

		return {
			buttonContainer: {
				backgroundColor: btnPrimaryBg,
				paddingVertical: borderRadius / 2,
				paddingHorizontal: borderRadius / 2,
				maxWidth: width * 0.9,
				minWidth: width * 0.5,
				borderRadius,
				alignSelf: 'center',
				alignItems: 'center',
				justifyContent: 'center',
			},
			buttonLabel: {
				color: '#ffffff',
				fontSize,

				textAlign: 'center',
				textAlignVertical: 'center',
			},
		};
	}

}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.app.layout,
	};
}

export default connect(mapStateToProps, null)(injectIntl(TouchableButton));

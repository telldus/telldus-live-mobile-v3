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

import i18n from '../App/Translations/common';
import Text from './Text';
import Throbber from './Throbber';
import View from './View';
import TouchableOpacity from './TouchableOpacity';

import capitalize from '../App/Lib/capitalize';

import Theme from '../App/Theme';

type Props = {
	style?: Array<any> | Object,
	text: string | Object,
	labelStyle?: Array<any> | Object,
	throbberStyle?: Array<any> | Object,
	throbberContainerStyle?: Array<any> | Object,
	onPress: Function,
	intl: intlShape.isRequired,
	postScript?: any,
	preScript?: any,
	appLayout: Object,
	accessible: boolean,
	accessibilityLabel?: string,
	disabled?: boolean,
	showThrobber?: boolean,
	textProps?: Object,
	buttonLevel?: number,
	textLevel?: number,
	throbberLevel?: number,
	preformatted?: boolean,
	coverStyle?: Object,
};

type DefaultProps = {
	disabled: boolean,
	accessible: boolean,
	showThrobber: boolean,
	preformatted: boolean,
};

class TouchableButton extends Component<Props, void> {
	onPress: () => void;
	defaultDescription: string;
	labelButton: string;

	props: Props;

	static defaultProps: DefaultProps = {
		disabled: false,
		accessible: true,
		showThrobber: false,
		preformatted: false,
	}

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
		let {
			style,
			labelStyle,
			throbberStyle,
			throbberContainerStyle,
			intl,
			text,
			preScript,
			postScript,
			accessibilityLabel,
			accessible,
			disabled,
			showThrobber,
			textProps = {},
			buttonLevel,
			textLevel,
			throbberLevel,
			preformatted = false,
			coverStyle,
		} = this.props;
		let label = typeof text === 'string' ? text : intl.formatMessage(text);
		accessibilityLabel = !accessible ? '' :
			accessibilityLabel ? accessibilityLabel : `${label} ${this.labelButton}, ${this.defaultDescription}`;
		let importantForAccessibility = !accessible ? 'no-hide-descendants' : 'yes';

		let {
			buttonContainer,
			buttonLabel,
			throbberStyleDef,
			throbberContainerStyleDef,
			coverStyleDef,
		} = this.getStyle();

		const bLevel = buttonLevel || (disabled ? 7 : 23);
		const tLevel = textLevel || (disabled ? 13 : 12);
		const thLevel = throbberLevel || 14;

		return (
			<TouchableOpacity
				accessible={accessible}
				importantForAccessibility={importantForAccessibility}
				accessibilityLabel={accessibilityLabel}
				style={[buttonContainer, style]}
				level={bLevel}
				disabled={disabled}
				onPress={this.onPress}>
				<View style={[coverStyleDef, coverStyle]}>
					{(typeof preScript === 'object' ||
					typeof preScript === 'function') && preScript}
					<Text
						level={tLevel}
						style={[buttonLabel, labelStyle]}
						accessible={accessible}
						importantForAccessibility={importantForAccessibility}
						{...textProps}>
						{typeof preScript === 'string' && preScript}{preformatted ? label : capitalize(label)}{postScript}
					</Text>
					{!!showThrobber &&
					(
						<Throbber
							level={thLevel}
							throbberContainerStyle={[throbberContainerStyleDef, throbberContainerStyle]}
							throbberStyle={[throbberStyleDef, throbberStyle]}
						/>
					)
					}
				</View>
			</TouchableOpacity>
		);
	}

	getStyle = (): Object => {
		const {
			maxSizeTextButton,
			shadow,
			fontSizeFactorFour,
		} = Theme.Core;
		const { appLayout, disabled } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const maxFontSize = maxSizeTextButton;

		let fontSize = deviceWidth * fontSizeFactorFour;
		fontSize = fontSize > maxFontSize ? maxFontSize : fontSize;

		const borderRadius = 18 + fontSize;

		return {
			buttonContainer: {
				paddingVertical: borderRadius / 2,
				paddingHorizontal: borderRadius / 2,
				maxWidth: width * 0.9,
				minWidth: width * 0.5,
				borderRadius,
				alignSelf: 'center',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'row',
				...shadow,
				shadowOpacity: disabled ? 0.5 : 0.3,
			},
			coverStyleDef: {
				flex: 1,
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'row',
			},
			buttonLabel: {
				fontSize,

				textAlign: 'center',
				textAlignVertical: 'center',
			},
			throbberStyleDef: {
				fontSize,
			},
			throbberContainerStyleDef: {
				position: 'relative',
				marginLeft: 10,
			},
		};
	}

}

function mapStateToProps(state: Object, ownProps: Object): Object {
	return {
		appLayout: state.app.layout,
	};
}

export default (connect(mapStateToProps, null)(injectIntl(TouchableButton)): Object);

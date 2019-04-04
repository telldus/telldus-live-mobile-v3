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

import React, { PureComponent } from 'react';
import { Animated } from 'react-native';
import { intlShape } from 'react-intl';

import { Text } from '../../../../BaseComponents';
import WizardIcon from './WizardIcon';

import Theme from '../../../Theme';
import i18n from '../../../Translations/common';

type Props = {
	intl: intlShape,
	currentScreen: number,
	animatedX: Object,
	animatedOpacity: Object,
	appLayout: Object,
};

export default class WizardOne extends PureComponent<Props, null> {
	props: Props;

	titleWOne: string;
	descriptionWOne: string;

	titleWTwo: string;
	descriptionWTwo: string;

	titleWThree: string;
	descriptionWThree: string;

	titleWFour: string;
	descriptionWFour: string;

	titleWFive: string;
	descriptionWFive: string;

	constructor(props: Props) {
		super(props);
		let { formatMessage } = props.intl;

		this.titleWOne = formatMessage(i18n.wizardOneHeader310);
		this.descriptionWOne = formatMessage(i18n.wizardOneDescription310);
	}

	getScreenData(currentScreen: number, styles: Object): Object {
		const { brandSecondary } = Theme.Core;
		const {
			iconStyle,
			// iconTwoStyle,
			// iconThreeStyle,
			iconSize,
		} = styles;

		let screenData = {
			icon: null,
			iconSize,
			iconColor: brandSecondary,
			iconStyle,
			title: '',
			description: '',
		};

		switch (currentScreen) {
			case 1:
				return {
					...screenData,
					icon: 'buttononoff',
					iconSize: iconSize * 1.2,
					title: this.titleWOne,
					description: this.descriptionWOne,
				};

				// case 2:
				// 	return {
				// 		...screenData,
				// 		icon: <Image source={{uri: 'icon_plus'}} style={iconTwoStyle} resizeMode={'cover'}/>,
				// 		title: this.titleWTwo,
				// 		description: this.descriptionWTwo,
				// 	};

				// case 3:
				// 	return {
				// 		...screenData,
				// 		icon: 'push',
				// 		iconStyle: iconThreeStyle,
				// 		title: this.titleWThree,
				// 		description: this.descriptionWThree,
				// 	};

			default:
				return screenData;
		}
	}

	render(): Object {
		const { currentScreen, animatedX, animatedOpacity, appLayout } = this.props;

		const { container, titleStyle, descriptionStyle, ...otherStyles } = this.getStyles(appLayout);
		const { title, description, ...iconProps } = this.getScreenData(currentScreen, otherStyles);

		return (
			<Animated.View style={[container, {opacity: animatedOpacity, transform: [{
				translateX: animatedX,
			}]}]}>
				<WizardIcon {...iconProps}/>
				<Text style={titleStyle}>
					{title}
				</Text>
				<Text style={descriptionStyle}>
					{description}
				</Text>
			</Animated.View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { brandSecondary, shadow } = Theme.Core;
		const titleFontSize = Math.floor(deviceWidth * 0.052);
		const iconSize = Math.floor(deviceWidth * 0.315);

		return {
			iconSize,
			container: {
				...shadow,
				backgroundColor: '#fff',
				justifyContent: 'center',
				alignItems: 'center',
				paddingHorizontal: titleFontSize,
				paddingVertical: titleFontSize,
				marginHorizontal: 10,
				marginVertical: 10,
			},
			iconStyle: {
				color: brandSecondary,
				textAlign: 'center',
			},
			iconTwoStyle: {
				height: iconSize * 0.9,
				width: iconSize * 0.9,
				tintColor: brandSecondary,
				marginVertical: 5 + (iconSize * 0.14),
			},
			iconThreeStyle: {
				color: brandSecondary,
				textAlignVertical: 'center',
				textAlign: 'center',
			},
			titleStyle: {
				fontSize: titleFontSize,
				color: '#00000090',
				textAlign: 'center',
				marginVertical: 10,
			},
			descriptionStyle: {
				fontSize: Math.floor(deviceWidth * 0.042),
				color: '#00000080',
				textAlign: 'left',
			},
		};
	}
}


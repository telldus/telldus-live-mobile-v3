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
import { intlShape } from 'react-intl';
import {
	Platform,
} from 'react-native';

import {
	Text,
	View,
	IconTelldus,
	ThemedMaterialIcon,
} from '../../../../BaseComponents';
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

	constructor(props: Props) {
		super(props);
		let { formatMessage } = props.intl;

		this.titleWOne = `${formatMessage(i18n.wizardOneHeader315)}!`;
		this.descriptionWOne = formatMessage(i18n.wizardOneDescription315);

		this.titleWTwo = formatMessage(i18n.wizardTwoHeader315);
		this.descriptionWTwo = formatMessage(i18n.wizardTwoDescription315);

		this.titleWThree = formatMessage(i18n.wizardThreeHeader315);
		this.descriptionWThree = formatMessage(i18n.wizardThreeDescription315);
	}

	getScreenData(currentScreen: number, styles: Object): Object {
		const {
			iconStyle,
			// iconTwoStyle,
			// iconThreeStyle,
			iconSize,
		} = styles;

		const isIos = Platform.OS === 'ios';

		let screenData = {
			icon: null,
			iconSize,
			iconLevel: 23,
			iconStyle,
			title: '',
			description: '',
		};

		const case1 = {
			...screenData,
			icon: <ThemedMaterialIcon
				style={iconStyle}
				size={iconSize}
				name={'location-on'}
				level={23}/>,
			title: this.titleWOne,
			description: this.descriptionWOne,
			isPremiumFeature: true,
		};

		const case2 = {
			...screenData,
			icon: 'darkmode',
			title: this.titleWTwo,
			description: this.descriptionWTwo,
		};

		const case3 = {
			...screenData,
			icon: 'user',
			title: this.titleWThree,
			description: this.descriptionWThree,
			isPremiumFeature: true,
		};

		switch (currentScreen) {
			case 1:
				return isIos ? case1 : case2;
			case 2:
				return isIos ? case2 : case3;
			case 3:
				return case3;
			default:
				return screenData;
		}
	}

	getContents = ({
		iconProps,
		titleStyle,
		title,
		descriptionStyle,
		description,
		isPremiumFeature,
		premiumCoverStyle,
		premIconStyle,
		premTextStyle,
	}: Object): Object => {

		let { formatMessage } = this.props.intl;

		return (
			<>
				<WizardIcon {...iconProps}/>
				<Text
					level={26}
					style={titleStyle}>
					{title}
				</Text>
				<Text
					level={25}
					style={descriptionStyle}>
					{description}
				</Text>
				{!!isPremiumFeature && (
					<View style={premiumCoverStyle}>
						<IconTelldus icon={'premium'} style={premIconStyle}/>
						<Text
							level={25}
							style={premTextStyle}>
							{formatMessage(i18n.premFeature)}
						</Text>
					</View>
				)}
			</>
		);
	}

	render(): Object {
		const { currentScreen, animatedX, animatedOpacity, appLayout } = this.props;

		const {
			container,
			titleStyle,
			descriptionStyle,
			premiumCoverStyle,
			premIconStyle,
			premTextStyle,
			...otherStyles
		} = this.getStyles(appLayout);
		const {
			title,
			description,
			isPremiumFeature,
			...iconProps
		} = this.getScreenData(currentScreen, otherStyles);

		const contents = this.getContents({
			iconProps,
			titleStyle,
			title,
			descriptionStyle,
			description,
			isPremiumFeature,
			premiumCoverStyle,
			premIconStyle,
			premTextStyle,
		});

		return (
			<View
				level={2}
				animated
				style={[container, {opacity: animatedOpacity, transform: [{
					translateX: animatedX,
				}]}]}>
				{contents}
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			shadow,
			paddingFactor,
		} = Theme.Core;
		const titleFontSize = Math.floor(deviceWidth * 0.052);
		const iconSize = Math.floor(deviceWidth * 0.315);

		const padding = deviceWidth * paddingFactor;

		return {
			iconSize,
			container: {
				...shadow,
				justifyContent: 'center',
				alignItems: 'center',
				padding: padding * 2,
				marginHorizontal: padding,
				marginVertical: padding * 2,
			},
			iconStyle: {
				textAlign: 'center',
			},
			iconTwoStyle: {
				height: iconSize * 0.9,
				width: iconSize * 0.9,
				marginVertical: 5 + (iconSize * 0.14),
			},
			iconThreeStyle: {
				textAlignVertical: 'center',
				textAlign: 'center',
			},
			titleStyle: {
				fontSize: titleFontSize,
				textAlign: 'center',
				marginVertical: 10,
			},
			descriptionStyle: {
				fontSize: Math.floor(deviceWidth * 0.042),
				textAlign: 'left',
				marginBottom: 10,
			},
			premiumCoverStyle: {
				justifyContent: 'center',
				alignItems: 'center',
				flexDirection: 'row',
			},
			premIconStyle: {
				textAlign: 'center',
				color: Theme.Core.twine,
				fontSize: Math.floor(deviceWidth * 0.075),
			},
			premTextStyle: {
				fontSize: Math.floor(deviceWidth * 0.048),
				marginLeft: 10,
			},
		};
	}
}


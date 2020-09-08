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
	Text,
	View,
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

	constructor(props: Props) {
		super(props);
		let { formatMessage } = props.intl;

		this.titleWOne = formatMessage(i18n.wizardOneHeader314);
		this.descriptionWOne = formatMessage(i18n.wizardOneDescription314);

		this.titleWTwo = formatMessage(i18n.wizardTwoHeader314);
		this.descriptionWTwo = formatMessage(i18n.wizardTwoDescription314);
	}

	getScreenData(currentScreen: number, styles: Object): Object {
		const {
			iconStyle,
			// iconTwoStyle,
			// iconThreeStyle,
			iconSize,
		} = styles;

		let screenData = {
			icon: null,
			iconSize,
			iconLevel: 23,
			iconStyle,
			title: '',
			description: '',
		};

		switch (currentScreen) {
			case 1:
				return {
					...screenData,
					icon: 'outlet',
					title: this.titleWOne,
					description: this.descriptionWOne,
				};

			case 2:
				return {
					...screenData,
					icon: 'palette',
					title: this.titleWTwo,
					description: this.descriptionWTwo,
				};

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
	}: Object): Object => {
		return (
			<>
				<WizardIcon {...iconProps}/>
				<Text
					level={5}
					style={titleStyle}>
					{title}
				</Text>
				<Text
					level={6}
					style={descriptionStyle}>
					{description}
				</Text>
			</>
		);
	}

	render(): Object {
		const { currentScreen, animatedX, animatedOpacity, appLayout } = this.props;

		const { container, titleStyle, descriptionStyle, ...otherStyles } = this.getStyles(appLayout);
		const { title, description, ...iconProps } = this.getScreenData(currentScreen, otherStyles);

		const contents = this.getContents({
			iconProps,
			titleStyle,
			title,
			descriptionStyle,
			description,
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
			brandSecondary,
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
		};
	}
}


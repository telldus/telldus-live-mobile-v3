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

import React from 'react';
import Slider from 'react-native-slider';

import { FloatingButton, Text, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

import {
	withTheme,
} from '../HOC/withTheme';

interface Props extends ScheduleProps {
	paddingRight: number,
	colors: Object,
}

type State = {
	methodValue: number,
};

class ActionDim extends View<null, Props, State> {

	constructor(props: Props) {
		super(props);

		const { isEditMode, intl, schedule, colors } = this.props;
		const { formatMessage } = intl;

		this.h1 = isEditMode() ? formatMessage(i18n.labelAction) : formatMessage(i18n.labelAction);
		this.h2 = formatMessage(i18n.posterChooseAction);

		this.maximumValue = 255;
		const { methodValue = 0 } = schedule;
		let finalMethodValue = parseInt(methodValue, 10);
		finalMethodValue = isNaN(finalMethodValue) ? 0 : finalMethodValue;

		this.sliderColor = colors.inAppBrandSecondary;

		this.sliderConfig = {
			minimumValue: 0,
			maximumValue: this.maximumValue,
			value: finalMethodValue,
			onValueChange: this._setMethodValue,
			minimumTrackTintColor: this.sliderColor,
		};

		this.state = {
			methodValue: finalMethodValue,
		};
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'ActionDim';
	}

	selectAction = () => {
		const { actions, navigation, isEditMode, route } = this.props;

		actions.selectAction(16, Math.round(this.state.methodValue));

		if (isEditMode()) {
			navigation.navigate(route.params.actionKey, {
				...route.params,
			});
		} else {
			navigation.navigate({
				name: 'Time',
				key: 'Time',
				params: route.params,
			});
		}
	};

	render(): React$Element<any> {
		const { appLayout, intl } = this.props;
		const { container, row, caption, slider } = this._getStyle(appLayout);

		const dimValue = this._getDimValue();

		return (
			<View style={container}>
				<View
					level={2}
					style={row}>
					<Text
						level={25}
						style={caption}>
						{intl.formatMessage(i18n.setDimValue, {value: `(${dimValue}%)`})}
					</Text>
					<Slider
						{...this.sliderConfig}
						trackStyle={slider.track}
						thumbStyle={slider.thumb}
					/>
				</View>
				<FloatingButton
					onPress={this.selectAction}
					imageSource={{uri: 'right_arrow_key'}}
					paddingRight={this.props.paddingRight - 2}
				/>
			</View>
		);
	}

	_getDimValue = (): number => {
		return Math.round(this.state.methodValue / this.maximumValue * 100);
	};

	_setMethodValue = (methodValue: number) => {
		this.setState({ methodValue });
	};

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const thumbSize = deviceWidth * 0.066666667;
		const padding = deviceWidth * 0.066666667;
		const outerPadding = deviceWidth * Theme.Core.paddingFactor;

		return {
			container: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'flex-start',
				paddingVertical: outerPadding - (outerPadding / 4),
			},
			row: {
				flex: 1,
				borderRadius: 2,
				elevation: 2,
				shadowColor: '#000',
				shadowRadius: 2,
				shadowOpacity: 0.23,
				shadowOffset: {
					width: 0,
					height: 1,
				},
				paddingHorizontal: padding,
				paddingBottom: padding,
				paddingTop: deviceWidth * 0.026666667,
			},
			caption: {
				fontSize: deviceWidth * 0.032,
				marginBottom: deviceWidth * 0.092,
				textAlign: 'center',
			},
			slider: {
				track: {
					borderRadius: 0,
					height: deviceWidth * 0.010666667,
				},
				thumb: {
					backgroundColor: this.sliderColor,
					borderRadius: thumbSize / 2,
					height: thumbSize,
					width: thumbSize,
				},
			},
		};
	};

}

export default (withTheme(ActionDim): Object);

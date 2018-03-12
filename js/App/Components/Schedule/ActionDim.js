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
import PropTypes from 'prop-types';
import Slider from 'react-native-slider';

import { FloatingButton, Text, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	methodValue: number,
};

export default class ActionDim extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
		schedule: PropTypes.object,
		paddingRight: PropTypes.number,
		isEditMode: PropTypes.func,
	};

	constructor(props: Props) {
		super(props);

		let { formatMessage } = this.props.intl;

		this.h1 = `2. ${formatMessage(i18n.labelAction)}`;
		this.h2 = formatMessage(i18n.posterChooseAction);
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};

		this.maximumValue = 255;
		const { methodValue } = props.schedule;

		this.sliderColor = Theme.Core.brandSecondary;

		this.sliderConfig = {
			minimumValue: 0,
			maximumValue: this.maximumValue,
			value: methodValue,
			onValueChange: this._setMethodValue,
			minimumTrackTintColor: this.sliderColor,
		};

		this.state = {
			methodValue,
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'ActionDim';
	}

	selectAction = () => {
		const { actions, navigation, isEditMode } = this.props;

		actions.selectAction(16, this.state.methodValue);

		if (isEditMode()) {
			navigation.goBack(navigation.state.params.actionKey);
		} else {
			navigation.navigate('Time');
		}
	};

	render(): React$Element<any> {
		const { appLayout } = this.props;
		const { container, row, caption, slider } = this._getStyle(appLayout);

		const dimValue = this._getDimValue();

		return (
			<View style={container}>
				<View style={row}>
					<Text style={caption}>
						{`Set Dim value (${dimValue}%)`}
					</Text>
					<Slider
						{...this.sliderConfig}
						trackStyle={slider.track}
						thumbStyle={slider.thumb}
					/>
				</View>
				<FloatingButton
					onPress={this.selectAction}
					imageSource={require('./img/right-arrow-key.png')}
					paddingRight={this.props.paddingRight}
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

		return {
			container: {
				flex: 1,
				flexDirection: 'row',
				alignItems: 'flex-start',
			},
			row: {
				flex: 1,
				backgroundColor: '#fff',
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

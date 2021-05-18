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
import { ScrollView } from 'react-native';

import { FloatingButton, View } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import RGBColorWheel from '../RGBControl/RGBColorWheel';

import {
	shouldUpdate,
} from '../../Lib';

import Theme from '../../Theme';
import i18n from '../../Translations/common';

interface Props extends ScheduleProps {
	paddingRight: number,
}

type State = {
	methodValue: string,
};

export default class ActionRGB extends View<null, Props, State> {

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

		const { isEditMode, intl, schedule, devices } = this.props;
		const { formatMessage } = intl;

		this.h1 = isEditMode() ? formatMessage(i18n.labelAction) : formatMessage(i18n.labelAction);
		this.h2 = formatMessage(i18n.posterChooseAction);

		this.device = devices.byId[schedule.deviceId];

		this.state = {
			methodValue: '#FF0000',
		};
	}

	componentDidMount() {
		const { h1, h2 } = this;
		this.props.onDidMount(h1, h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		if (shouldUpdate(this.state, nextState, ['methodValue'])) {
			return true;
		}
		return nextProps.currentScreen === 'ActionRGB' && shouldUpdate(this.props, nextProps, ['schedule', 'appLayout']);
	}

	selectAction: Function = () => {
		const { actions, navigation, isEditMode, route } = this.props;
		const { methodValue } = this.state;

		actions.selectAction(1024, methodValue);

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

	deviceSetStateRGBOverride: Function = (deviceId: string, methodValue: string) => {
		this.setState({
			methodValue,
		});
	};

	render(): React$Element<any> | null {
		const {
			appLayout,
		} = this.props;
		const {
			container,
			colorWheel,
			thumStyle,
			swatchStyle,
			swatchesCover,
			colorWheelCover,
			swatchWheelCover,
		} = this._getStyle(appLayout);

		if (!this.device) {
			return null;
		}

		return (
			<View style={container}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
					}}
					keyboardShouldPersistTaps={'always'}>
					<RGBColorWheel
						device={this.device}
						appLayout={appLayout}
						style={colorWheel}
						thumStyle={thumStyle}
						swatchStyle={swatchStyle}
						swatchesCover={swatchesCover}
						colorWheelCover={colorWheelCover}
						swatchWheelCover={swatchWheelCover}
						thumbSize={15}
						deviceSetStateRGBOverride={this.deviceSetStateRGBOverride}/>
				</ScrollView>
				<FloatingButton
					onPress={this.selectAction}
					imageSource={{uri: 'right_arrow_key'}}
					paddingRight={this.props.paddingRight - 2}
				/>
			</View>
		);
	}

	_getStyle = (appLayout: Object): Object => {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const padding = deviceWidth * Theme.Core.paddingFactor;

		const swatchMaxSize = 100;
		const numOfItemsPerRow = 5;
		const itemsBorder = numOfItemsPerRow * 4;
		const outerPadding = padding * 2;
		const itemsPadding = Math.ceil(numOfItemsPerRow * padding * 2);
		let swatchSize = Math.floor((deviceWidth - (itemsPadding + outerPadding + itemsBorder)) / numOfItemsPerRow);
		swatchSize = swatchSize > swatchMaxSize ? swatchMaxSize : swatchSize;

		const colorWheelSize = deviceWidth * 0.6;

		return {
			container: {
				flex: 1,
				paddingVertical: padding - (padding / 4),
			},
			swatchWheelCover: {
				flex: 1,
			},
			colorWheel: {
				width: colorWheelSize,
				height: colorWheelSize,
				alignItems: 'center',
				borderRadius: deviceWidth * 0.25,
			},
			thumStyle: {
				height: 30,
				width: 30,
				borderRadius: 30,
			},
			swatchesCover: {
				width: '100%',
				flexDirection: 'row',
				flexWrap: 'wrap',
				...Theme.Core.shadow,
				borderRadius: 2,
				paddingHorizontal: padding,
				paddingTop: padding / 2,
				paddingBottom: padding,
				alignItems: 'center',
				justifyContent: 'center',
			},
			swatchStyle: {
				height: swatchSize,
				width: swatchSize,
				borderRadius: swatchSize / 2,
				marginHorizontal: padding,
				marginTop: padding,
			},
			colorWheelCover: {
				...Theme.Core.shadow,
				borderRadius: 2,
				marginVertical: padding,
				width: width - (padding * 2),
				height: colorWheelSize * 1.1,
				alignItems: 'center',
			},
			wheelCover: {
				flex: 1,
				marginHorizontal: padding,
				marginBottom: padding,
			},
		};
	};

}

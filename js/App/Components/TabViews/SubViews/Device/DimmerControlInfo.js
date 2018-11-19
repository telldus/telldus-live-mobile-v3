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

import {
	View,
	Text,
	DialogueHeader,
	FloatingButton,
} from '../../../../../BaseComponents';
import DimSlider from './DimSlider';

import shouldUpdate from '../../../../Lib/shouldUpdate';

import Theme from '../../../../Theme';

type Props = {
    name: string,
    id: number,
	style: Object,
	onPressButton: Function,
	isOnline: boolean,
	appLayout: Object,
};

class DimmerControlInfo extends View<Props, null> {

	constructor(props: Props) {
		super(props);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(this.props, nextProps, ['appLayout', 'isOnline']);
	}

	render(): Object {
		const {
			style,
			name,
			id,
			onPressButton,
			isOnline,
			appLayout,
		} = this.props;

		const minimumTrackTintColor = isOnline ? Theme.Core.brandSecondary : '#cccccc';
		const maximumTrackTintColor = isOnline ? 'rgba(219, 219, 219, 255)' : '#e5e5e5';
		const thumbTintColor = isOnline ? Theme.Core.brandSecondary : '#cccccc';

		const {
			dimInfoDialogueContainer,
			sliderContainerStyle,
			thumbStyle,
			buttonStyle,
			iconStyle,
			iconSize,
		} = this.getStyles(appLayout);

		return (
			<View style={dimInfoDialogueContainer}>
				<DialogueHeader
					headerText={`DIM [${name}]`}
					shouldCapitalize={false}
					showIcon={false}
					headerStyle={style.dialogueHeaderStyle}
					textStyle={style.dialogueHeaderTextStyle}/>
				<View style={style.dialogueBodyStyle}>
					<Text style={style.dialogueBodyTextStyle}>
                Select dim value below. You can also click and drag the dim
                 button in the list up/right or down/left to dim your device.
					</Text>
					<View style={{
						flexDirection: 'row',
						marginTop: 8,
					}}>
						<DimSlider
							prefix={'Dim value: '}
							id={id}
							sliderContainerStyle={sliderContainerStyle}
							thumbStyle={thumbStyle}
							minimumTrackTintColor={minimumTrackTintColor}
							maximumTrackTintColor={maximumTrackTintColor}
							thumbTintColor={thumbTintColor}/>
						<FloatingButton
							buttonStyle={buttonStyle}
							iconStyle={iconStyle}
							onPress={onPressButton}
							iconName={'checkmark'}
							iconSize={iconSize}/>
					</View>
				</View>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { maxSizeFloatingButton } = Theme.Core;

		let fButtonSize = deviceWidth * 0.09;
		fButtonSize = fButtonSize > maxSizeFloatingButton ? maxSizeFloatingButton : fButtonSize;

		return {
			dialogueBodyDimTextStyle: {
				color: '#000',
				fontSize: 12,
			},
			iconSize: deviceWidth * 0.050666667,
			buttonStyle: {
				elevation: 4,
				shadowOpacity: 0.50,
				height: fButtonSize,
				width: fButtonSize,
				borderRadius: fButtonSize / 2,
				right: 0,
				top: 15,
			},
			iconStyle: {
				fontSize: deviceWidth * 0.050666667,
				color: '#fff',
			},
			sliderContainerStyle: {
				flex: 1,
				marginRight: fButtonSize * 2,
			},
			thumbStyle: {
				height: 12,
				width: 12,
				borderRadius: 6,
			},
			dialogueBoxStyle: {
				borderRadius: 8,
				elevation: 2,
				shadowColor: '#000',
				shadowRadius: 8,
				shadowOpacity: 0.23,
				shadowOffset: {
					width: 0,
					height: 1,
				},
				backgroundColor: '#fff',
			},
			dimInfoDialogueContainer: {
				borderRadius: 8,
				overflow: 'hidden',
			},
		};
	}
}

export default DimmerControlInfo;

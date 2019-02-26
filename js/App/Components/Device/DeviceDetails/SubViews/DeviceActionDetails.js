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

import { View } from '../../../../../BaseComponents';
import {
	BellButton,
	OnButton,
	OffButton,
} from '../../../TabViews/SubViews';
import SliderDetails from './SliderDetails';
import UpButton from '../../../TabViews/SubViews/Navigational/UpButton';
import DownButton from '../../../TabViews/SubViews/Navigational/DownButton';
import StopButton from '../../../TabViews/SubViews/Navigational/StopButton';

import { getDeviceActionIcon } from '../../../../Lib/DeviceUtils';

import Theme from '../../../../Theme';

type Props = {
	device: Object,
	intl: Object,
    isGatewayActive: boolean,
	appLayout: Object,
	containerStyle?: Object | Array<any> | number,
};

class DeviceActionDetails extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render(): Object {
		const { device, intl, isGatewayActive, appLayout, containerStyle } = this.props;
		const { supportedMethods = {}, deviceType, isInState } = device;
		const {
			TURNON,
			TURNOFF,
			BELL,
			DIM,
			UP,
			DOWN,
			STOP,
		} = supportedMethods;
		const buttons = [];
		const { container, shadow, buttonStyle, buttonsContainer } = this.getStyles(appLayout);
		const sharedProps = {
			...device,
			isGatewayActive,
			intl,
		};

		if (UP) {
			buttons.push(
				<UpButton {...sharedProps}
					iconSize={45} supportedMethod={UP}/>
			);
		}

		if (DOWN) {
			buttons.push(
				<DownButton {...sharedProps}
					iconSize={45} supportedMethod={DOWN}/>
			);
		}

		if (STOP) {
			buttons.push(
				<StopButton {...sharedProps}
					iconSize={20} supportedMethod={STOP}/>
			);
		}

		if (TURNOFF) {
			const { TURNOFF: actionIcon } = getDeviceActionIcon(deviceType, isInState, supportedMethods);
			buttons.push(
				<OffButton
					{...sharedProps}
					actionIcon={actionIcon}/>
			);
		}

		if (TURNON) {
			const { TURNON: actionIcon } = getDeviceActionIcon(deviceType, isInState, supportedMethods);
			buttons.push(
				<OnButton
					{...sharedProps}
					actionIcon={actionIcon}
				/>
			);
		}

		if (BELL) {
			buttons.push(
				<BellButton device={device} {...sharedProps}/>
			);
		}

		if (!TURNON && !TURNOFF && !BELL && !DIM && !UP && !DOWN && !STOP) {
			const { TURNOFF: actionIcon } = getDeviceActionIcon(deviceType, isInState, supportedMethods);
			buttons.push(
				isInState === 'TURNOFF' ?
					<OffButton
						{...sharedProps}
						actionIcon={actionIcon}/>
					:
					<OnButton
						{...sharedProps}
						actionIcon={actionIcon}/>
			);
		}

		const newButtonStyle = buttons.length > 4 ? buttonStyle : {...buttonStyle, flex: 1};

		return (
			<View style={[container, shadow, containerStyle]}>
				{!!DIM && (
					<SliderDetails
						device={device}
						intl={intl}
						isGatewayActive={isGatewayActive}
						appLayout={appLayout}/>
				)}
				<View style={{flex: 1, alignItems: 'stretch'}}>
					<View style={buttonsContainer}>
						{
							React.Children.map(buttons, (button: Object): Object | null => {
								if (React.isValidElement(button)) {
									return React.cloneElement(button, {style: newButtonStyle});
								}
								return null;
							})
						}
					</View>
				</View>
			</View>
		);
	}

	getStyles(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const outerPadding = deviceWidth * Theme.Core.paddingFactor * 2;
		const buttonPadding = 10;
		const bodyPadding = buttonPadding * 1.5;

		return {
			container: {
				flex: 1,
				alignItems: 'stretch',
				justifyContent: 'center',
				backgroundColor: '#fff',
				paddingTop: bodyPadding - 10,
				paddingBottom: bodyPadding,
				paddingLeft: bodyPadding - buttonPadding,
				paddingRight: bodyPadding,
			},
			shadow: {
				borderRadius: 2,
				...Theme.Core.shadow,
			},
			buttonsContainer: {
				flex: 1,
				flexDirection: 'row',
				flexWrap: 'wrap',
				alignItems: 'center',
				justifyContent: 'space-between',
			},
			buttonStyle: {
				minWidth: (width - outerPadding - (buttonPadding * 3) - (bodyPadding * 2)) / 4,
				justifyContent: 'center',
				alignItems: 'center',
				height: Theme.Core.rowHeight,
				marginLeft: buttonPadding,
				marginTop: buttonPadding,
				...Theme.Core.shadow,
				borderRadius: 2,
				overflow: 'hidden',
			},
		};
	}
}

DeviceActionDetails.propTypes = {
	device: PropTypes.object.isRequired,
};

module.exports = DeviceActionDetails;

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
import { StyleSheet } from 'react-native';

import { View } from '../../../../BaseComponents';
import StopButton from './Navigational/StopButton';
import UpButton from './Navigational/UpButton';
import DownButton from './Navigational/DownButton';
import Theme from '../../../Theme';

import { shouldUpdate } from '../../../Lib';

type Props = {
	device: Object,
	showStopButton?: boolean,
	isOpen: boolean,

	isGatewayActive: boolean,
	upButtonStyle?: Array<any> | Object,
	downButtonStyle?: Array<any> | Object,
	stopButtonStyle?: Array<any> | Object,
	style: Object,
	intl: Object,
	closeSwipeRow: () => void,
	onPressDeviceAction?: () => void,
	onPressOverride?: (Object) => void,
	disableActionIndicator?: boolean,
};

type DefaultProps = {
	showStopButton: boolean,
	disableActionIndicator: boolean,
};

class NavigationalButton extends View {
	props: Props;

	static defaultProps: DefaultProps = {
		showStopButton: true,
		disableActionIndicator: false,
	};

	constructor(props: Props) {
		super(props);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { isOpen, showStopButton, ...others } = this.props;
		const { isOpen: isOpenN, showStopButton: showStopButtonN, ...othersN } = nextProps;
		if (isOpen !== isOpenN || showStopButton !== showStopButtonN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, [
			'device',
			'onPressOverride']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	render(): Object {

		let {
			device,
			isGatewayActive,
			intl,
			style,
			upButtonStyle,
			downButtonStyle,
			stopButtonStyle,
			showStopButton,
			isOpen,
			closeSwipeRow,
			onPressDeviceAction,
			onPressOverride,
			disableActionIndicator = false,
		} = this.props;
		const { supportedMethods = {}, methodRequested, isInState, id, name, local } = device;
		const { UP, DOWN, STOP } = supportedMethods;

		const sharedProps = {
			id,
			name,
			isInState,
			methodRequested,
			isGatewayActive,
			local,
			isOpen,
			closeSwipeRow,
			intl,
			onPressDeviceAction,
			onPressOverride,
			disableActionIndicator,
		};

		return (
			<View style={style}>
				<UpButton
					{...sharedProps}
					supportedMethod={UP}
					iconSize={30}
					style={[styles.navigationButton, upButtonStyle]}/>
				<DownButton
					{...sharedProps}
					supportedMethod={DOWN}
					iconSize={30}
					style={[styles.navigationButton, downButtonStyle]}/>
				{!!showStopButton && (<StopButton
					{...sharedProps}
					supportedMethod={STOP}
					iconSize={20}
					style={[styles.navigationButton, stopButtonStyle]}/>
				)}
			</View>
		);
	}
}

const styles = StyleSheet.create({
	navigationButton: {
		justifyContent: 'center',
		alignItems: 'center',
		width: Theme.Core.buttonWidth,
		height: Theme.Core.rowHeight,
	},
});

module.exports = (NavigationalButton: Object);

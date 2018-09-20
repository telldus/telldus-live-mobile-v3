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
import OffButton from './OffButton';
import OnButton from './OnButton';

import { shouldUpdate } from '../../../Lib';

type Props = {
	item: Object,
	tileWidth: number,

	intl: Object,
	isGatewayActive: boolean,
	style: Object,
	containerStyle?: number | Object | Array<any>,
	offButtonStyle?: number | Object | Array<any>,
	onButtonStyle?: number | Object | Array<any>,
};

class ToggleDashboardTile extends View<Props, null> {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { tileWidth, ...others } = this.props;
		const { tileWidth: tileWidthN, ...othersN } = nextProps;
		if (tileWidth !== tileWidthN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, ['item']);
		if (propsChange) {
			return true;
		}

		return false;
	}

	render(): Object {
		const { item, tileWidth, intl, isGatewayActive, containerStyle, onButtonStyle, offButtonStyle } = this.props;
		const { id, name, isInState, supportedMethods, methodRequested, local } = item;
		const { TURNON, TURNOFF } = supportedMethods;

		const onButton = <OnButton id={id} name={name} isInState={isInState} fontSize={Math.floor(tileWidth / 8)}
			enabled={!!TURNON} style={[styles.turnOnButtonContainer, onButtonStyle]} iconStyle={styles.iconStyle}
			isGatewayActive={isGatewayActive} methodRequested={methodRequested} intl={intl} local={local}/>;
		const offButton = <OffButton id={id} name={name} isInState={isInState} fontSize={Math.floor(tileWidth / 8)}
			enabled={!!TURNOFF} style={[styles.turnOffButtonContainer, offButtonStyle]} iconStyle={styles.iconStyle}
			isGatewayActive={isGatewayActive} methodRequested={methodRequested} intl={intl} local={local}/>;

		let style = { ...this.props.style };
		style.width = tileWidth;
		style.height = tileWidth;

		return (
			<View style={containerStyle}>
				{(!!TURNOFF || (!TURNOFF && isInState === 'TURNOFF')) && offButton }
				{(!!TURNON || (!TURNON && isInState === 'TURNON')) && onButton }
			</View>
		);
	}
}

const styles = StyleSheet.create({
	turnOffButtonContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomLeftRadius: 2,
	},
	turnOnButtonContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomRightRadius: 2,
	},
	button: {
		flex: 1,
		justifyContent: 'center',
	},
	buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	buttonBackgroundEnabled: {
		backgroundColor: 'white',
	},
	buttonBackgroundDisabled: {
		backgroundColor: '#eeeeee',
	},
	buttonOnEnabled: {
		color: 'green',
	},
	buttonOnDisabled: {
		color: '#a0a0a0',
	},
	buttonOffEnabled: {
		color: 'red',
	},
	buttonOffDisabled: {
		color: '#a0a0a0',
	},
	leftCircle: {
		position: 'absolute',
		top: 3,
		left: 3,
	},
	rightCircle: {
		position: 'absolute',
		top: 3,
		right: 3,
	},
	iconStyle: {
		fontSize: 22,
	},
});

module.exports = ToggleDashboardTile;

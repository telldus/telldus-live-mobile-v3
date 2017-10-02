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

import React, { PropTypes } from 'react';
import { View } from 'BaseComponents';
import { StyleSheet } from 'react-native';
import DashboardShadowTile from './DashboardShadowTile';
import OffButton from './OffButton';
import OnButton from './OnButton';

type Props = {
	item: Object,
	style: Object,
	tileWidth: number,
	onTurnOff: number => void,
	onTurnOn: number => void,
};

class ToggleDashboardTile extends View {
	props: Props;

	constructor(props: Props) {
		super(props);
	}

	render(): React$Element<any> {
		const { item, tileWidth } = this.props;
		const { id, name, isInState, supportedMethods, methodRequested } = item;
		const { TURNON, TURNOFF } = supportedMethods;

		const onButton = <OnButton id={id} isInState={isInState} fontSize={Math.floor(tileWidth / 8)} enabled={!!TURNON} style={styles.turnOnButtonContainer} methodRequested={methodRequested} />;
		const offButton = <OffButton id={id} isInState={isInState} fontSize={Math.floor(tileWidth / 8)} enabled={!!TURNOFF} style={styles.turnOffButtonContainer} methodRequested={methodRequested} />;

		let style = { ...this.props.style };
		style.width = tileWidth;
		style.height = tileWidth;

		return (
			<DashboardShadowTile
				item={item}
				isEnabled={isInState === 'TURNON'}
				name={name}
				type={'device'}
				tileWidth={tileWidth}
				hasShadow={!!TURNON || !!TURNOFF}
				style={style}>
				<View style={{
					flexDirection: 'row',
					flex: 30,
				}}>
					{ offButton }
					{ onButton }
				</View>
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
	turnOffButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopLeftRadius: 7,
	},
	turnOnButtonContainer: {
		flex: 1,
		alignItems: 'stretch',
		borderTopRightRadius: 7,
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
});

ToggleDashboardTile.propTypes = {
	item: PropTypes.object,
	enabled: PropTypes.bool,
};

module.exports = ToggleDashboardTile;

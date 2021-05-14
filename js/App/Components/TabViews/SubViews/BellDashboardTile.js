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
import { TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import { View, IconTelldus } from '../../../../BaseComponents';
import { deviceSetState } from '../../../Actions/Devices';
import ButtonLoadingIndicator from './ButtonLoadingIndicator';

import {
	withTheme,
} from '../../HOC/withTheme';

import { shouldUpdate } from '../../../Lib';
import i18n from '../../../Translations/common';

import Theme from '../../../Theme';

type Props = {
	command: number,

	item: Object,
	tileWidth: number,
	local?: boolean,

	colors: Object,
	colorScheme: string,
	themeInApp: string,
	dBTileDisplayMode?: string,

	intl: Object,
	isGatewayActive: boolean,
	style: Object,
	containerStyle?: Array<any> | Object,
	bellButtonStyle?: Array<any> | Object,
	deviceSetState: (id: number, command: number, value?: number) => void,
};

type DefaultProps = {
	command: number,
};

class BellDashboardTile extends View<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		command: 4,
	}

	onBell: () => void;
	labelBellButton: string;

	constructor(props: Props) {
		super(props);

		this.onBell = this.onBell.bind(this);

		let { formatMessage } = props.intl;

		this.labelBellButton = `${formatMessage(i18n.bell)} ${formatMessage(i18n.button)}`;
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {

		const { tileWidth, ...others } = this.props;
		const { tileWidth: tileWidthN, ...othersN } = nextProps;
		if (tileWidth !== tileWidthN) {
			return true;
		}

		const propsChange = shouldUpdate(others, othersN, [
			'item',
			'themeInApp',
			'colorScheme',
			'local',
			'selectedThemeSet',
			'dBTileDisplayMode',
		]);
		if (propsChange) {
			return true;
		}

		return false;
	}

	onBell() {
		this.props.deviceSetState(this.props.item.id, this.props.command);
	}

	render(): Object {
		const { item, isGatewayActive, containerStyle, bellButtonStyle, colors, local } = this.props;
		const { methodRequested, name } = item;

		const styles = getStyles({colors});

		const accessibilityLabelButton = `${this.labelBellButton}, ${name}`;

		let iconColor = isGatewayActive ? colors.colorOnInActiveIcon : Theme.Core.offlineColor;

		let dotColor = local ? colors.colorOffActiveBg : colors.colorOnActiveBg;

		return (
			<TouchableOpacity
				onPress={this.onBell}
				style={[containerStyle, bellButtonStyle]}
				accessibilityLabel={accessibilityLabelButton}>
				<View style={styles.body}>
					  <IconTelldus icon="bell" size={32} color={iconColor} />
				</View>
				{
					methodRequested === 'BELL' ?
						<ButtonLoadingIndicator
							style={styles.dot}
							color={dotColor}
						/>
						:
						null
				}
			</TouchableOpacity>
		);
	}
}

const getStyles = ({colors}: Object): Object => {

	const {
		colorOnInActiveBg,
	} = colors;

	return {
		container: {
			justifyContent: 'center',
		},
		body: {
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			borderBottomLeftRadius: 2,
			borderBottomRightRadius: 2,
			backgroundColor: colorOnInActiveBg,
		},
		dot: {
			position: 'absolute',
			top: 3,
			left: 3,
		},
	};
};

function mapDispatchToProps(dispatch: Function): Object {
	return {
		deviceSetState: (id: number, command: number, value?: number) =>{
			dispatch(deviceSetState(id, command, value));
		},
	};
}

module.exports = (connect(null, mapDispatchToProps)(withTheme(BellDashboardTile)): Object);

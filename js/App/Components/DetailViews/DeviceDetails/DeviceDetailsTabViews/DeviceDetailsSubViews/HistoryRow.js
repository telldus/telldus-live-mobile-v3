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
import { connect } from 'react-redux';
import { StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_history from './../../../../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_history);

import {
	FormattedMessage,
	Text,
	View,
	ListRow,
} from 'BaseComponents';
import { getDeviceStateMethod } from 'Reducers_Devices';
import type { Dispatch } from 'Actions_Types';
import i18n from '../../../../../Translations/common';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Props = {
	item: Object,
	onOriginPress: (data: Object) => void,
	isFirst: boolean,
};

type State = {
};

class HistoryRow extends View {
	props: Props;
	state: State;

	onOriginPress: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
		};
		this.onOriginPress = this.onOriginPress.bind(this);
	}

	onOriginPress() {
		this.props.onOriginPress(this.props.item);
	}

	getIcon(deviceState: string): string {
		switch (deviceState) {
			case 'TURNON':
				return 'icon_on';
			case 'TURNOFF':
				return 'icon_off';
			case 'UP':
				return 'icon_up';
			case 'BELL':
				return 'icon_bell';
			case 'DOWN':
				return 'icon_down';
			case 'STOP':
				return 'icon_stop';
			case 'LEARN':
				return 'icon_learn';
			default:
				return '';
		}

	}

	getPercentage(value: number): number {
		return Math.round(value * 100.0 / 255);
	}

	render(): React$Element<any> {
		let time = new Date(this.props.item.ts * 1000);
		let deviceState = getDeviceStateMethod(this.props.item.state);
		let icon = this.getIcon(deviceState);
		let originText = '';
		let origin = this.props.item.origin;
		if (origin === 'Scheduler') {
			originText = <FormattedMessage {...i18n.scheduler} style={styles.originText}/>;
		} else if (origin === 'Incoming signal') {
			originText = <FormattedMessage {...i18n.incommingSignal} style={styles.originText}/>;
		} else if (origin === 'Unknown') {
			originText = <FormattedMessage {...i18n.unknown} style={styles.originText}/>;
		} else if (origin.substring(0, 5) === 'Group') {
			originText = <Text style={styles.originText}><FormattedMessage {...i18n.group} style={styles.originText}/> {origin.substring(6, (origin.length))}</Text>;
		} else if (origin.substring(0, 5) === 'Event') {
			originText = <Text style={styles.originText}><FormattedMessage {...i18n.event} style={styles.originText}/> {origin.substring(6, (origin.length))}</Text>;
		} else {
			originText = origin;
		}
		let triangleColor = this.props.item.state === 2 || (deviceState === 'DIM' && this.props.item.stateValue === 0) ? '#A59F9A' : '#F06F0C';
		let roundIcon = this.props.item.successStatus !== 0 ? 'info' : '';
		let roundIconContainer = this.props.item.successStatus !== 0 ? styles.roundIconContainer : null;
		return (
			<ListRow
				roundIcon={roundIcon}
				roundIconStyle={styles.roundIcon}
				roundIconContainerStyle={roundIconContainer}
				time={time}
				containerStyle={{paddingHorizontal: deviceWidth * 0.04}}
				triangleColor={triangleColor}
				isFirst={this.props.isFirst}
			>
				<TouchableOpacity style={styles.rowItemsContainer} onPress={this.onOriginPress}>
					{this.props.item.state === 2 || (deviceState === 'DIM' && this.props.item.stateValue === 0) ?
						<View style={[styles.statusView, { backgroundColor: '#A59F9A' }]}>
							<CustomIcon name="icon_off" size={24} color="#ffffff" />
						</View>
						:
						<View style={[styles.statusView, { backgroundColor: '#F06F0C' }]}>
							{deviceState === 'DIM' ?
								<Text style={styles.statusValueText}>{this.getPercentage(this.props.item.stateValue)}%</Text>
								:
								<CustomIcon name={icon} size={24} color="#ffffff" />
							}
						</View>
					}
					<View style={styles.locationCover}>
						<Text style={styles.originText} numberOfLines={1}>{originText}</Text>
					</View>
				</TouchableOpacity>
			</ListRow>
		);
	}

}

const styles = StyleSheet.create({
	rowItemsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusView: {
		width: deviceWidth * 0.165,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		alignItems: 'center',
		borderTopLeftRadius: 2,
		borderBottomLeftRadius: 2,
	},
	statusValueText: {
		color: '#ffffff',
		fontSize: 14,
	},
	statusTextON: {
		backgroundColor: '#fff',
		width: deviceWidth * 0.006,
		height: deviceHeight * 0.03,
	},
	statusTextOFF: {
		backgroundColor: '#A59F9A',
		width: deviceWidth * 0.07,
		height: deviceHeight * 0.04,
		borderRadius: 30,
		borderWidth: 1.5,
		borderColor: '#fff',
	},
	locationCover: {
		width: deviceWidth * 0.45,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		backgroundColor: '#fff',
		alignItems: 'flex-start',
		paddingLeft: 5,
		borderTopRightRadius: 2,
		borderBottomRightRadius: 2,
	},
	originText: {
		color: '#A59F9A',
	},
	roundIconContainer: {
		backgroundColor: 'transparent',
	},
	roundIcon: {
		color: '#d32f2f',
		fontSize: deviceWidth * 0.065555555,
	},
});

function mapDispatchToProps(dispatch: Dispatch): Object {
	return {
		onOriginPress: (data: Object) => {
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: {
					data,
				},
			});
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(HistoryRow);

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
import { StyleSheet, TouchableOpacity } from 'react-native';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_history from '../../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_history);

import { FormattedMessage, Text, View, ListRow } from 'BaseComponents';
import { getDeviceStateMethod } from 'Reducers_Devices';
import i18n from '../../../Translations/common';

type Props = {
	item: Object,
	onOriginPress: Function,
	isFirst: boolean,
	appOrientation: string,
	appLayout: Object,
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

	componentWillReceiveProps(nextProps) {
	}

	onOriginPress() {
		this.props.onOriginPress(this.props.item);
	}

	getIcon(deviceState) {
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

	getPercentage(value: number) {
		return Math.round(value * 100.0 / 255);
	}

	render() {

		let { appOrientation, appLayout } = this.props;
		let isPortrait = appOrientation === 'PORTRAIT';

		let {
			locationCover,
			containerStyle,
			roundIconStyle,
			rowContainerStyle,
			timeStyle,
			timeContainerStyle,
			statusView,
			originTextStyle,
			roundIconContainerStyle,
		} = this.getStyle(isPortrait, appLayout);

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

		return (
			<ListRow
				roundIcon={roundIcon}
				roundIconStyle={roundIconStyle}
				roundIconContainerStyle={roundIconContainerStyle}
				time={time}
				timeStyle={timeStyle}
				timeContainerStyle={timeContainerStyle}
				containerStyle={containerStyle}
				rowContainerStyle={rowContainerStyle}
				triangleColor={triangleColor}
				isFirst={this.props.isFirst}
			>
				<TouchableOpacity style={styles.rowItemsContainer} onPress={this.onOriginPress}>
					{this.props.item.state === 2 || (deviceState === 'DIM' && this.props.item.stateValue === 0) ?
						<View style={[statusView, { backgroundColor: '#A59F9A' }]}>
							<CustomIcon name="icon_off" size={24} color="#ffffff" />
						</View>
						:
						<View style={[statusView, { backgroundColor: '#F06F0C' }]}>
							{deviceState === 'DIM' ?
								<Text style={styles.statusValueText}>{this.getPercentage(this.props.item.stateValue)}%</Text>
								:
								<CustomIcon name={icon} size={24} color="#ffffff" />
							}
						</View>
					}
					<View style={locationCover}>
						<Text style={originTextStyle} numberOfLines={1}>{originText}</Text>
					</View>
				</TouchableOpacity>
			</ListRow>

		);
	}

	getStyle(isPortrait: boolean, appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;

		return {
			locationCover: {
				width: width * 0.40,
				height: isPortrait ? height * 0.07 : width * 0.07,
				justifyContent: 'center',
				backgroundColor: '#fff',
				alignItems: 'flex-start',
				paddingLeft: 5,
				borderTopRightRadius: 2,
				borderBottomRightRadius: 2,
				flexWrap: 'wrap',
			},
			statusView: {
				width: width * 0.13,
				height: isPortrait ? height * 0.07 : width * 0.07,
				justifyContent: 'center',
				alignItems: 'center',
				borderTopLeftRadius: 2,
				borderBottomLeftRadius: 2,
			},
			roundIconStyle: {
				fontSize: width * 0.067777777,
				color: '#d32f2f',
			},
			rowContainerStyle: {
				width: width * 0.55,
			},
			containerStyle: {
				paddingHorizontal: isPortrait ? width * 0.04 : height * 0.04,
			},
			timeStyle: {
				fontSize: isPortrait ? width * 0.047 : height * 0.047,
			},
			timeContainerStyle: {
				width: width * 0.30,
				zIndex: 1,
			},
			originTextStyle: {
				color: '#A59F9A',
				fontSize: isPortrait ? Math.floor(width * 0.04) : Math.floor(height * 0.04),
			},
			roundIconContainerStyle: {
				backgroundColor: this.props.item.successStatus !== 0 ? 'transparent' : '#929292',
				width: isPortrait ? width * 0.0667777777 : height * 0.0667777777,
			},
		};
	}
}

const styles = StyleSheet.create({
	rowItemsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusValueText: {
		color: '#ffffff',
		fontSize: 14,
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appOrientation: store.App.orientation,
		appLayout: store.App.layout,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		onOriginPress: (data) => {
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: {
					data,
				},
			});
		},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryRow);

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
import { StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_history from './../../../../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_history);

import { FormattedMessage, Text, View, Icon, FormattedTime } from 'BaseComponents';
import { getDeviceStateMethod } from 'Reducers_Devices';
import i18n from '../../../../../Translations/common';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Props = {
	item: Object,
	onOriginPress: Function,
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
		return (
			<View style={styles.rowItemsContainer}>
				<View style={styles.circularViewCover}>
					<View style={styles.verticalLineView}/>
					{ this.props.item.successStatus !== 0 ?
						<CustomIcon name="icon_info" size={deviceHeight * 0.03} color="#d32f2f" />
						:
						<View style={[styles.circularView, { backgroundColor: '#A59F9A' }]} />
					}
					<View style={styles.verticalLineView}/>
				</View>
				<View style={styles.timeCover}>
					<FormattedTime
						value={time}
						localeMatcher= "best fit"
						formatMatcher= "best fit"
						hour="numeric"
						minute="numeric"
						second="numeric"
						style={styles.timeText} />
				</View>
				<View style={styles.statusArrowLocationContainer}>
					<View style={styles.arrowViewContainer}>
						{this.props.item.state === 2 || (deviceState === 'DIM' && this.props.item.stateValue === 0) ?
							<Icon name="play" style={styles.carretIcon} size={deviceHeight * 0.030} color="#A59F9A" />
							:
							<Icon name="play" style={styles.carretIcon} size={deviceHeight * 0.030} color="#F06F0C" />
						}
					</View>
					<TouchableWithoutFeedback onPress={this.onOriginPress}>
						<View style={[styles.statusLocationContainer, styles.shadow]}>
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
						</View>
					</TouchableWithoutFeedback>
				</View>
			</View>
		);
	}

}

let widthStatusLocationContainer = deviceWidth * 0.615;
let widthArrowViewContainer = deviceWidth * 0.045;

let widthCircularViewCover = deviceWidth * 0.1;
let widthTimeCover = deviceWidth * 0.20;
let widthStatusArrowLocationContainer = widthStatusLocationContainer + widthArrowViewContainer;

const styles = StyleSheet.create({
	rowItemsContainer: {
		flexDirection: 'row',
		height: deviceHeight * 0.09,
		width: deviceWidth,
		justifyContent: 'center',
		alignItems: 'center',
	},
	circularViewCover: {
		width: widthCircularViewCover,
		height: deviceHeight * 0.09,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	circularView: {
		borderRadius: deviceHeight * 0.015,
		height: deviceHeight * 0.03,
		width: deviceHeight * 0.03,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	verticalLineView: {
		backgroundColor: '#A59F9A',
		height: deviceHeight * 0.045,
		width: 2,
	},
	timeCover: {
		width: widthTimeCover,
		height: deviceHeight * 0.08,
		justifyContent: 'center',
		alignItems: 'center',
	},
	timeText: {
		color: '#A59F9A',
		fontSize: 12,
	},
	statusArrowLocationContainer: {
		width: widthStatusArrowLocationContainer,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	statusLocationContainer: {
		width: widthStatusLocationContainer,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
		borderRadius: 2,
	},
	shadow: {
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
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
	arrowViewContainer: {
		width: widthArrowViewContainer,
		height: deviceHeight * 0.07,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	carretIcon: {
		left: deviceWidth * 0.015,
		position: 'absolute',
		elevation: 2,
		transform: [{ rotate: '180deg' }],
	},
	arrowViewTopON: {
		backgroundColor: '#F06F0C',
		width: deviceWidth * 0.06,
		height: deviceHeight * 0.02,
		transform: [{ rotate: '-30deg' }],
		elevation: 2,
	},
	arrowViewTopOFF: {
		backgroundColor: '#A59F9A',
		width: deviceWidth * 0.06,
		height: deviceHeight * 0.02,
		transform: [{ rotate: '-30deg' }],
		elevation: 2,
	},
	arrowViewBottom: {
		backgroundColor: '#eeeeef',
		width: deviceWidth * 0.06,
		height: deviceHeight * 0.025,
		position: 'absolute',
		top: deviceHeight * 0.04,
		transform: [{ rotate: '30deg' }],
		elevation: 2,
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
});

function mapDispatchToProps(dispatch) {
	return {
		onOriginPress: (data) => {
			dispatch({
				type: 'REQUEST_MODAL_OPEN',
				payload: data,
			});
		},
	};
}

module.exports = connect(null, mapDispatchToProps)(HistoryRow);

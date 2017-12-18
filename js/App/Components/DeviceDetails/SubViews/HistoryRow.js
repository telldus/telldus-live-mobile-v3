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
import { StyleSheet, Dimensions } from 'react-native';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_history from '../../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_history);

import { FormattedMessage, Text, View, ListRow } from 'BaseComponents';
import { getDeviceStateMethod } from 'Reducers_Devices';
import i18n from '../../../Translations/common';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Props = {
	item: Object,
	onOriginPress: Function,
	isFirst: boolean,
	appOrientation: string,
	screenProps: Object,
	toggleScroll: Function,
	scrollEnabled: boolean,
	scrollOffsetY: number,
	isScrolling: boolean,
};

type State = {
	isDragging: boolean,
};

class HistoryRow extends View {
	props: Props;
	state: State;

	onOriginPress: () => void;
	onResponderMove: (Object) => void;
	onStartShouldSetResponder: (Object) => void;
	onResponderRelease: (Object) => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			isDragging: false,
		};
		this.onOriginPress = this.onOriginPress.bind(this);

		this.onResponderMove = this.onResponderMove.bind(this);
		this.onStartShouldSetResponder = this.onStartShouldSetResponder.bind(this);
		this.onResponderRelease = this.onResponderRelease.bind(this);

		this.posterPrevTop = null;
	}

	componentWillReceiveProps(nextProps) {
	}

	onOriginPress() {
		this.props.onOriginPress(this.props.item);
	}

	onStartShouldSetResponder(ev: Object): boolean {
		this.posterPrevTop = this.posterPrevTop ? this.posterPrevTop : this.props.screenProps.posterNextTop;
		if ((this.posterPrevTop === -this.props.screenProps.posterHeight) && (this.props.scrollOffsetY !== 0)) {
			this.props.toggleScroll(true);
			return false;
		} else if (this.props.scrollEnabled) {
			this.props.toggleScroll(false);
		}
		this.position = ev.nativeEvent.pageY;
		return true;
	}

	onResponderMove(ev: Object) {
		this.posterPrevTop = this.posterPrevTop ? this.posterPrevTop : this.props.screenProps.posterNextTop;
		let dragUp = this.position > ev.nativeEvent.pageY;
		let distanceDragged = this.position - ev.nativeEvent.pageY;
		this.position = ev.nativeEvent.pageY;

		let posterNextTop = this.posterPrevTop - distanceDragged;
		// let actualDragPosition = posterNextTop;
		posterNextTop = dragUp && posterNextTop < -this.props.screenProps.posterHeight ? -this.props.screenProps.posterHeight : posterNextTop;
		posterNextTop = !dragUp && posterNextTop > this.props.screenProps.posterTop ? this.props.screenProps.posterTop : posterNextTop;
		this.posterPrevTop = posterNextTop;

		if (dragUp && !this.props.scrollEnabled && distanceDragged !== 0) {
			this.setState({
				isDragging: true,
			});
			this.props.screenProps.onListScroll(posterNextTop);
			if (posterNextTop === -this.props.screenProps.posterHeight) {
				this.props.toggleScroll(true);

			// TODO - Once the poster has been COMPLETELY dragged up and hidden start scrolling the list.

			// let listPosition = this.state.scrollOffsetY + Math.abs(actualDragPosition - posterNextTop);
			// this.refs.sectionList._wrapperListRef._listRef.scrollToOffset({offset: listPosition});
			}
		} else if (!dragUp && !this.props.scrollEnabled && distanceDragged !== 0) {
			this.setState({
				isDragging: true,
			});
			this.props.screenProps.onListScroll(posterNextTop);
		} else {
			this.setState({
				isDragging: false,
			});
		}
	}

	onMoveShouldSetResponderCapture(ev: Object) {
		return true;
	}

	onResponderRelease(ev: Object) {
		if (!this.state.isDragging) {
			this.onOriginPress();
			this.setState({
				isDragging: false,
			});
		}
	}

	onResponderTerminationRequest(ev: Object) {
		return false;
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

		let triangleColor = this.props.item.state === 2 || (deviceState === 'DIM' && this.props.item.stateValue === 0) ? '#A59F9A' : '#F06F0C';
		let roundIcon = this.props.item.successStatus !== 0 ? 'info' : '';
		let roundIconContainer = this.props.item.successStatus !== 0 ? {backgroundColor: 'transparent', width: deviceWidth * 0.0667777777} : {width: deviceWidth * 0.0667777777};

		let isPortrait = this.props.appOrientation === 'PORTRAIT';

		return (
			<View
				onStartShouldSetResponder={this.onStartShouldSetResponder}
				onResponderMove={this.onResponderMove}
				onMoveShouldSetResponderCapture={this.onMoveShouldSetResponderCapture}
				onResponderRelease={this.onResponderRelease}
				onResponderTerminationRequest={this.onResponderTerminationRequest}
			>
				<ListRow
					roundIcon={roundIcon}
					roundIconStyle={{fontSize: deviceWidth * 0.067777777, color: '#d32f2f'}}
					roundIconContainerStyle={roundIconContainer}
					time={time}
					timeStyle={isPortrait ? {width: deviceWidth * 0.30, fontSize: deviceWidth * 0.046666667} : {width: deviceHeight * 0.30, fontSize: deviceWidth * 0.046666667}}
					containerStyle={{paddingHorizontal: deviceWidth * 0.04}}
					rowContainerStyle={isPortrait ? {width: deviceWidth * 0.55} : {width: deviceHeight * 0.55}}
					triangleColor={triangleColor}
					isFirst={this.props.isFirst}
				>
					<View style={styles.rowItemsContainer}>
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
				</ListRow>
			</View>

		);
	}

}

const styles = StyleSheet.create({
	rowItemsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statusView: {
		width: deviceWidth * 0.13,
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
		width: deviceWidth * 0.40,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		backgroundColor: '#fff',
		alignItems: 'flex-start',
		paddingLeft: 5,
		borderTopRightRadius: 2,
		borderBottomRightRadius: 2,
		flexWrap: 'wrap',
	},
	originText: {
		color: '#A59F9A',
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appOrientation: store.App.orientation,
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

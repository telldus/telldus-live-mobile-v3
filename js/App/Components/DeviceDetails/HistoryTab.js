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
import { StyleSheet, SectionList, Dimensions } from 'react-native';
import _ from 'lodash';

import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_history from '../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_history);

import { FormattedMessage, Text, View, Icon, FormattedDate } from 'BaseComponents';
import { DeviceHistoryDetails, HistoryRow } from 'SubViews';
import { getDeviceHistory } from 'Actions_Devices';
import { hideModal } from 'Actions_Modal';
import { defineMessages } from 'react-intl';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const messages = defineMessages({
	historyHeader: {
		id: 'history',
		defaultMessage: 'History',
	},
	loading: {
		id: 'loading',
		defaultMessage: 'Loading',
	},
	noRecentActivity: {
		id: 'deviceSettings.noRecentActivity',
		defaultMessage: 'No recent activity',
	},
});

type Props = {
	dispatch: Function,
	history: Object,
	device: Object,
	deviceHistoryNavigator: Object,
	screenProps: Object,
};

type State = {
	dataSource: any,
	isListEmpty: boolean,
	hasRefreshed: boolean,
	scrollEnabled: boolean,
	scrollOffsetY: number,
};

class HistoryTab extends View {
	props: Props;
	state: State;

	refreshHistoryData: () => void;
	renderSectionHeader: (Object, String) => void;
	renderRow: (Object, String) => void;
	closeHistoryDetailsModal: () => void;
	onResponderMove: (Object) => void;
	onMoveShouldSetResponder: (Object) => void;
	onScroll: (Object) => void;

	static navigationOptions = ({ navigation }) => ({
		tabBarLabel: ({ tintColor }) => (<FormattedMessage {...messages.historyHeader} style={{color: tintColor}}/>),
		tabBarIcon: ({ tintColor }) => (
			<CustomIcon name="icon_history" size={24} color={tintColor}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			let {state} = navigation;
			state.params.actionOnHistoryTabPress();
			jumpToIndex(scene.index);
		},
	});

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: props.history ? this.getRowAndSectionData(props.history.data) : false,
			isListEmpty: props.history && props.history.data.length === 0 ? true : false,
			hasRefreshed: false,
			scrollEnabled: false,
			scrollOffsetY: 0,
		};

		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.closeHistoryDetailsModal = this.closeHistoryDetailsModal.bind(this);

		this.onResponderMove = this.onResponderMove.bind(this);
		this.onMoveShouldSetResponder = this.onMoveShouldSetResponder.bind(this);
		this.onScroll = this.onScroll.bind(this);

		this.posterPrevTop = null;
	}

	componentDidMount() {
		let {setParams} = this.props.deviceHistoryNavigator;
		setParams({
			actionOnHistoryTabPress: this.closeHistoryDetailsModal,
		});
	}

	closeHistoryDetailsModal() {
		this.props.dispatch(hideModal());
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.history && ((!this.props.history) || (nextProps.history.data.length !== this.props.history.data.length))) {
			this.setState({
				dataSource: this.getRowAndSectionData(nextProps.history.data),
				isListEmpty: nextProps.history.data.length === 0 ? true : false,
			});
		}
		if (nextProps.screenProps.currentTab === 'History') {
			if (!this.state.hasRefreshed) {
				this.refreshHistoryData();
				this.setState({
					hasRefreshed: true,
				});
			}
		} else {
			this.setState({
				hasRefreshed: false,
			});
		}
	}

	refreshHistoryData() {
		let that = this;
		this.delayRefreshHistoryData = setTimeout(() => {
			that.props.dispatch(getDeviceHistory(that.props.device));
		}, 2000);
	}

	// prepares the row and section data required for the List.
	getRowAndSectionData(data) {
		let result = _.groupBy(data, items => {
			let date = new Date(items.ts * 1000).toDateString();
			return date;
		});
		result = _.reduce(result, (acc, next, index) => {
			acc.push({
				key: index,
				data: next,
			});
			return acc;
		}, []);
		return result;
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
			default:
				return '';
		}

	}

	keyExtractor(item) {
		return item.ts;
	}

	renderRow(item: Object) {
		return (
			<HistoryRow id={item.item.index} item={item.item} isFirst={+item.item.index === 0}/>
		);
	}

	renderSectionHeader(item) {
		return (
			<View style={styles.sectionHeader}>
				<FormattedDate
					value={item.section.key}
					localeMatcher= "best fit"
					formatMatcher= "best fit"
					weekday="long"
					day="2-digit"
					month="long"
					style={styles.sectionHeaderText} />
			</View>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.screenProps.currentTab !== 'History') {
			return false;
		}
		return true;
	}

	onMoveShouldSetResponder(ev: Object): boolean {
		this.posterPrevTop = this.posterPrevTop ? this.posterPrevTop : this.props.screenProps.posterTop;
		if ((this.posterPrevTop === -this.props.screenProps.posterHeight) && (this.state.scrollOffsetY !== 0)) {
			this.setState({
				scrollEnabled: true,
			});
			return false;
		} else if (this.state.scrollEnabled) {
			this.setState({
				scrollEnabled: false,
			});
		}
		this.position = ev.nativeEvent.pageY;
		return true;
	}

	onResponderMove(ev: Object) {
		let dragUp = this.position > ev.nativeEvent.pageY;
		let distanceDragged = this.position - ev.nativeEvent.pageY;
		this.position = ev.nativeEvent.pageY;

		let posterNextTop = this.posterPrevTop - distanceDragged;
		// let actualDragPosition = posterNextTop;
		posterNextTop = dragUp && posterNextTop < -this.props.screenProps.posterHeight ? -this.props.screenProps.posterHeight : posterNextTop;
		posterNextTop = !dragUp && posterNextTop > this.props.screenProps.posterTop ? this.props.screenProps.posterTop : posterNextTop;
		this.posterPrevTop = posterNextTop;

		if (dragUp && !this.state.scrollEnabled) {
			this.props.screenProps.onListScroll(posterNextTop);
			if (posterNextTop === -this.props.screenProps.posterHeight) {
				this.setState({
					scrollEnabled: true,
				});

				// TODO - Once the poster has been COMPLETELY dragged up and hidden start scrolling the list.

				// let listPosition = this.state.scrollOffsetY + Math.abs(actualDragPosition - posterNextTop);
				// this.refs.sectionList._wrapperListRef._listRef.scrollToOffset({offset: listPosition});
			}
		}
		if (!dragUp && !this.state.scrollEnabled) {
			this.props.screenProps.onListScroll(posterNextTop);
		}
	}

	onScroll(ev: Object) {
		this.setState({
			scrollOffsetY: ev.nativeEvent.contentOffset.y,
		});
		if (ev.nativeEvent.contentOffset.y <= 0) {
			// TODO - drag the poster downwards when list is scrolled beyond it's top.
			// see if velocity too can be handled.
		}
	}

	render() {

		// Loader message when data has not received yet.
		if (!this.state.dataSource) {
			return (
				<View style={styles.containerWhenNoData}>
					<CustomIcon name="icon_loading" size={20} color="#F06F0C" />
					<Text style={styles.textWhenNoData}>
						<FormattedMessage {...messages.loading} style={styles.textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		// response received but, no history for the requested device, so empty list message.
		if (this.state.dataSource && this.state.isListEmpty) {
			return (
				<View style={styles.containerWhenNoData}>
					<Icon name="exclamation-circle" size={20} color="#F06F0C" />
					<Text style={styles.textWhenNoData}>
						<FormattedMessage {...messages.noRecentActivity} style={styles.textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<SectionList
					ref={'sectionList'}
					sections={this.state.dataSource}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					keyExtractor={this.keyExtractor}
					onMoveShouldSetResponder={this.onMoveShouldSetResponder}
					onResponderMove={this.onResponderMove}
					scrollEnabled={this.state.scrollEnabled}
					onScroll={this.onScroll}
				/>
				<View style={styles.line}/>
				<DeviceHistoryDetails />
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
		backgroundColor: '#eeeeef',
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	containerWhenNoData: {
		flex: 1,
		paddingTop: 20,
		backgroundColor: '#eeeeef',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
	textWhenNoData: {
		marginLeft: 10,
		color: '#A59F9A',
		fontSize: 12,
	},
	sectionHeader: {
		height: deviceHeight * 0.04,
		backgroundColor: '#ffffff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
		justifyContent: 'center',
		paddingLeft: 5,
	},
	sectionHeaderText: {
		color: '#A59F9A',
	},
	line: {
		backgroundColor: '#A59F9A',
		height: '100%',
		width: 1,
		position: 'absolute',
		left: deviceWidth * 0.069333333,
		top: 0,
		zIndex: -1,
	},

});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

function mapStateToProps(state, ownProps) {
	// some times the history data might not have received yet, so passing 'false' value.
	let data = state.devices.byId[ownProps.screenProps.device.id].history ? state.devices.byId[ownProps.screenProps.device.id].history : false;
	return {
		deviceHistoryNavigator: ownProps.navigation,
		history: data,
		device: ownProps.screenProps.device,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);

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
import { StyleSheet, ListView, Dimensions, TouchableWithoutFeedback } from 'react-native';

import moment from 'moment';
import { createIconSetFromIcoMoon } from 'react-native-vector-icons';
import icon_history from './../../../TabViews/img/selection.json';
const CustomIcon = createIconSetFromIcoMoon(icon_history);

import { Text, View, ListDataSource, Icon } from 'BaseComponents';
import { DeviceHistoryDetails } from 'DeviceDetailsSubView';
import { getDeviceHistory } from 'Actions_Devices';
import { getDeviceStateMethod } from 'Reducers_Devices';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

type Props = {
};

type State = {
};

const listDataSource = new ListDataSource({
	rowHasChanged: (r1, r2) => r1 !== r2,
	sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
});

class HistoryTab extends View {
	props: Props;
	state: State;

	onOriginPress: (Object) => void;
	refreshHistoryData: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: props.history ? listDataSource
			.cloneWithRowsAndSections(this.getRowAndSectionData(props.history.data)) : false,
			isListEmpty: props.history && props.history.data.length === 0 ? true : false,
			hasRefreshed: false,
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.onOriginPress = this.onOriginPress.bind(this);
		this.renderFillerComponent = this.renderFillerComponent.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		tabBarLabel: 'History',
		tabBarIcon: ({ tintColor }) => (
			<CustomIcon name="icon_history" size={24} color={tintColor}/>
		),
		tabBarOnPress: (scene, jumpToIndex) => {
		},
	});

	componentWillReceiveProps(nextProps) {
		if (nextProps.history && ((!this.props.history) || (nextProps.history.data.length !== this.props.history.data.length))) {
			this.setState({
				dataSource: listDataSource.cloneWithRowsAndSections(this.getRowAndSectionData(nextProps.history.data)),
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
		let rowSectionData = data.reduce((result, key) => {
			let date = moment.unix(key.ts).format('dddd, MMMM D');
			if (!result[date]) {
				result[date] = [];
			}
			result[date].push(key);
			return result;
		}, {});
		return rowSectionData;
	}

	onOriginPress(data) {
		this.props.dispatch({
			type: 'REQUEST_MODAL_OPEN',
			payload: data,
		});
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

	renderRow(item, id) {
		let time = moment.unix(item.ts).format('HH:mm:ss');
		let deviceState = getDeviceStateMethod(item.state);
		let icon = this.getIcon(deviceState);
		return (
			<View style={styles.rowItemsContainer}>
				<View style={styles.circularViewCover}>
					<View style={styles.verticalLineView}/>
					{ item.successStatus !== 0 ?
						<View style={[styles.circularView, { backgroundColor: 'red' }]} >
							<View style={styles.verticalDash} />
							<View style={styles.dot} />
						</View>
					:
						<View style={[styles.circularView, { backgroundColor: '#A59F9A' }]} />
					}
					<View style={styles.verticalLineView}/>
				</View>
				<View style={styles.timeCover}>
					<Text style={styles.timeText}>
						{time}
					</Text>
				</View>
				<View style={styles.statusViewCover}>
					<View style={styles.arrowViewContainer}>
						<View style={item.state === 2 || (deviceState === 'DIM' && item.stateValue === 0) ? styles.arrowViewTopOFF : styles.arrowViewTopON} />
						<View style={styles.arrowViewBottom} />
					</View>
					{item.state === 2 || (deviceState === 'DIM' && item.stateValue === 0) ?
						<View style={styles.statusViewOFF}>
							<CustomIcon name={icon} size={24} color="#ffffff" />
						</View>
					:
					<View style={styles.statusViewON}>
						{deviceState === 'DIM' ?
							<Text>{item.stateValue}%</Text>
							:
							<CustomIcon name={icon} size={24} color="#ffffff" />
						}
					</View>
					}
				</View>
				<TouchableWithoutFeedback onPress={() => {
					this.onOriginPress(item);
				}}>
				<View style={styles.locationCover}>
					<Text style={styles.originText} numberOfLines={1}>{item.origin}</Text>
				</View>
				</TouchableWithoutFeedback>
			</View>
		);
	}

	renderSectionHeader(sectionData, timestamp) {
		return (
			<View style={styles.sectionHeader}>
				<Text style={styles.sectionHeaderText}>{timestamp}</Text>
			</View>
		);
	}

	renderFillerComponent() {
		return (
			<View style={styles.fillerComponent}>
				<View style={styles.fillerViewToAlign}>
					<View style={styles.fillerVerticalLine}/>
				</View>
			</View>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	render() {
		// Loader message when data has not received yet.
		if (!this.state.dataSource) {
			return (
			<View style={styles.containerWhenNoData}>
				<CustomIcon name="icon_loading" size={20} color="#F06F0C" />
				<Text style={styles.textWhenNoData}>
					Loading...
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
					No recent activity on device
				</Text>
			</View>
			);
		}
		return (
			<View style={styles.container}>
				<ListView
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
				/>
				{this.renderFillerComponent()}
				<DeviceHistoryDetails />
			</View>
		);
	}

}

HistoryTab.propTypes = {
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
		backgroundColor: '#E5E7E9',
		flexDirection: 'row',
		width: deviceWidth,
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	containerWhenNoData: {
		flex: 1,
		paddingTop: 20,
		backgroundColor: '#E5E7E9',
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
		width: deviceWidth,
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
	},
	sectionHeaderText: {
		color: '#A59F9A',
		marginLeft: 5,
	},
	rowItemsContainer: {
		flexDirection: 'row',
		height: deviceHeight * 0.09,
		width: deviceWidth,
		justifyContent: 'center',
		alignItems: 'center',
	},
	circularViewCover: {
		width: deviceWidth * 0.15,
		height: deviceHeight * 0.095,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	circularView: {
		borderRadius: deviceHeight * 0.025,
		height: deviceHeight * 0.05,
		width: deviceHeight * 0.05,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	verticalDash: {
		width: 2,
		backgroundColor: '#ffffff',
		height: deviceHeight * 0.025,
	},
	dot: {
		backgroundColor: '#ffffff',
		marginTop: 2,
		width: 2,
		height: 2,
	},
	verticalLineView: {
		backgroundColor: '#A59F9A',
		height: deviceHeight * 0.025,
		width: 2,
	},
	timeCover: {
		width: deviceWidth * 0.25,
		height: deviceHeight * 0.08,
		justifyContent: 'center',
		alignItems: 'center',
	},
	timeText: {
		color: '#A59F9A',
		fontSize: 16,
	},
	statusViewCover: {
		width: deviceWidth * 0.15,
		height: deviceHeight * 0.09,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	statusViewON: {
		backgroundColor: '#F06F0C',
		width: deviceWidth * 0.115,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		alignItems: 'center',
	},
	statusViewOFF: {
		backgroundColor: '#A59F9A',
		width: deviceWidth * 0.115,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		alignItems: 'center',
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
		backgroundColor: 'transparent',
		width: deviceWidth * 0.035,
		height: deviceHeight * 0.07,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		paddingLeft: 5,
		paddingTop: deviceHeight * 0.015,
	},
	arrowViewTopON: {
		backgroundColor: '#F06F0C',
		width: deviceWidth * 0.06,
		height: deviceHeight * 0.02,
		transform: [{ rotate: '-30deg' }],
	},
	arrowViewTopOFF: {
		backgroundColor: '#A59F9A',
		width: deviceWidth * 0.06,
		height: deviceHeight * 0.02,
		transform: [{ rotate: '-30deg' }],
	},
	arrowViewBottom: {
		backgroundColor: '#E5E7E9',
		width: deviceWidth * 0.06,
		height: deviceHeight * 0.025,
		position: 'absolute',
		top: deviceHeight * 0.04,
		transform: [{ rotate: '30deg' }],
	},
	locationCover: {
		width: deviceWidth * 0.4,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		backgroundColor: '#fff',
		alignItems: 'center',
		paddingLeft: 10,
	},
	originText: {
		color: '#A59F9A',
	},
	fillerComponent: {
		flex: 1,
		width: deviceWidth * 0.15,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		marginLeft: deviceWidth * 0.025,
	},
	fillerViewToAlign: {
		flex: 1,
		width: deviceWidth * 0.15,
		justifyContent: 'center',
		alignItems: 'center',
	},
	fillerVerticalLine: {
		flex: 1,
		backgroundColor: '#A59F9A',
		width: 2,
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
		history: data,
		device: ownProps.screenProps.device,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);

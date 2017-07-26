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
const Icon = createIconSetFromIcoMoon(icon_history);

import { Text, View, ListDataSource } from 'BaseComponents';
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

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: props.history ? listDataSource
			.cloneWithRowsAndSections(this.getRowAndSectionData(props.history.data)) : false,
			isListEmpty: props.history && props.history.data.length === 0 ? true : false,
			deviceDetailsShow: false,
			deviceDetailsData: {},
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);
		this.onOriginPress = this.onOriginPress.bind(this);
	}

	static navigationOptions = ({ navigation }) => ({
		tabBarLabel: 'History',
		tabBarIcon: ({ tintColor }) => (
			<Icon name="icon_history" size={24} color={tintColor}/>
		),
		tabBarOnPress: (scene, jumpToIndex) => {
		},
	});

	componentWillReceiveProps(nextProps) {
		this.setState({
			dataSource: nextProps.history ? listDataSource
			.cloneWithRowsAndSections(this.getRowAndSectionData(nextProps.history.data)) : false,
			isListEmpty: nextProps.history && nextProps.history.data.length === 0 ? true : false,
		});
		if (this.props.screenProps.currentTab !== 'History') {
			this.setState({
				deviceDetailsShow: false,
			});
		}
	}

	// prepares the row and section data required for the List.
	getRowAndSectionData(data) {
		let rowSectionData = data.reduce((result, key) => {
			let date = moment.unix(key.ts).format('dddd, MMMM Do');
			if (!result[date]) {
				result[date] = [];
			}
			result[date].push(key);
			return result;
		}, {});
		return rowSectionData;
	}

	onOriginPress(data) {
		this.setState({
			deviceDetailsShow: true,
			deviceDetailsData: data,
		});
	}

	renderRow(item, id) {
		let time = moment.unix(item.ts).format('HH:mm:ss');
		let deviceState = getDeviceStateMethod(item.state);
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
						<View style={item.state === 1 ? styles.arrowViewTopON : styles.arrowViewTopOFF} />
						<View style={styles.arrowViewBottom} />
					</View>
					{item.state === 2 || (deviceState === 'DIM' && item.stateValue === 0) ?
						<View style={styles.statusViewOFF}>
							<View style={styles.statusTextOFF} />
						</View>
					:
					<View style={styles.statusViewON}>
						{deviceState === 'DIM' ?
							<Text>{item.stateValue}%</Text>
							:
							<View style={styles.statusTextON} />
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

	componentDidMount() {
		// if history data not received yet make an API call.[previous call's result will reach, just a matter of time
		// and this one is just for precaution, can remove if seems unnecessary]
		if (!this.props.history) {
			this.props.dispatch(getDeviceHistory(this.props.device));
		}
	}

	render() {
		// Loader message when data has not received yet.
		if (!this.state.dataSource) {
			return (
			<View style={styles.container}>
				<Text>
					Loading...
				</Text>
			</View>
			);
		}
		// response received but, no history for the requested device, so empty list message.
		if (this.state.dataSource && this.state.isListEmpty) {
			return (
			<View style={styles.container}>
				<Text>
					No history found for this device.
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
				<DeviceHistoryDetails
					showDetails={this.state.deviceDetailsShow}
					detailsData={this.state.deviceDetailsData} />
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
		borderRadius: 30,
		height: deviceHeight * 0.05,
		width: deviceWidth * 0.08,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
	},
	verticalDash: {
		width: 2,
		backgroundColor: '#ffffff',
		height: deviceHeight * 0.022,
	},
	dot: {
		backgroundColor: '#ffffff',
		marginTop: 2,
		width: 2,
		height: 2,
	},
	verticalLineView: {
		backgroundColor: '#A59F9A',
		height: deviceHeight * 0.022,
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

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
						<CustomIcon name="icon_info" size={deviceHeight * 0.03} color="#d32f2f" />
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
					<View style={styles.statusArrowLocationContainer}>
						<View style={styles.arrowViewContainer}>
							{item.state === 2 || (deviceState === 'DIM' && item.stateValue === 0) ?
							<Icon name="play" style={styles.carretIcon} size={deviceHeight * 0.030} color="#A59F9A" />
							:
							<Icon name="play" style={styles.carretIcon} size={deviceHeight * 0.030} color="#F06F0C" />
							}
						</View>
						<TouchableWithoutFeedback onPress={() => {
							this.onOriginPress(item);
						}}>
							<View style={[styles.statusLocationContainer, styles.shadow]}>
								{item.state === 2 || (deviceState === 'DIM' && item.stateValue === 0) ?
									<View style={[styles.statusView, { backgroundColor: '#A59F9A' }]}>
										<CustomIcon name="icon_off" size={24} color="#ffffff" />
									</View>
								:
									<View style={[styles.statusView, { backgroundColor: '#F06F0C' }]}>
										{deviceState === 'DIM' ?
											<Text>{item.stateValue}%</Text>
											:
											<CustomIcon name={icon} size={24} color="#ffffff" />
										}
									</View>
								}
								<View style={styles.locationCover}>
									<Text style={styles.originText} numberOfLines={1}>{item.origin}</Text>
								</View>
							</View>
						</TouchableWithoutFeedback>
					</View>
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

	shouldComponentUpdate(nextProps, nextState) {
		if (nextProps.screenProps.currentTab !== 'History') {
			return false;
		}
		return true;
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

let widthStatusLocationContainer = deviceWidth * 0.565;
let widthArrowViewContainer = deviceWidth * 0.045;

let widthCircularViewCover = deviceWidth * 0.15;
let widthTimeCover = deviceWidth * 0.20;
let widthStatusArrowLocationContainer = widthStatusLocationContainer + widthArrowViewContainer;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 2,
		backgroundColor: '#eeeeef',
		flexDirection: 'row',
		width: deviceWidth,
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
		fontSize: 16,
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
		width: deviceWidth * 0.4,
		height: deviceHeight * 0.07,
		justifyContent: 'center',
		backgroundColor: '#fff',
		alignItems: 'center',
		paddingLeft: 10,
		borderTopRightRadius: 2,
		borderBottomRightRadius: 2,
	},
	originText: {
		color: '#A59F9A',
	},
	fillerComponent: {
		flex: 1,
		width: deviceWidth * 0.15,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		marginLeft: deviceWidth * 0.02,
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

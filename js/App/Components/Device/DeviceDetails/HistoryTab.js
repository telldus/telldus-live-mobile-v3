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
import { StyleSheet, SectionList } from 'react-native';
import reduce from 'lodash/reduce';
import groupBy from 'lodash/groupBy';

import {
	FormattedMessage,
	Text,
	View,
	Icon,
	FormattedDate,
	ThemedRefreshControl,
} from '../../../../BaseComponents';
import { DeviceHistoryDetails, HistoryRow } from './SubViews';
import { getDeviceHistory } from '../../../Actions/Devices';
import { getHistory, storeHistory, getLatestTimestamp } from '../../../Actions/LocalStorage';
import i18n from '../../../Translations/common';
import Theme from '../../../Theme';

type Props = {
	dispatch: Function,
	device: Object,
	rowsAndSections: Array<any> | boolean,
	screenProps: Object,
	currentScreen: string,
	navigation: Object,
	gatewayTimezone: string,
};

type State = {
	hasRefreshed: boolean,
	rowsAndSections: Array<any>,
	refreshing: boolean,
	hasLoaded: boolean,
	historyDetails: Object,
};

class HistoryTab extends View {
	props: Props;
	state: State;

	refreshHistoryData: () => void;
	renderSectionHeader: (Object) => Object;
	renderRow: (Object) => Object;
	closeHistoryDetailsModal: () => void;
	_onRefresh: () => void;
	getHistoryDataFromAPI: (Object, number | null) => void;
	getHistoryDataWithLatestTimestamp: () => void;
	onOriginPress: () => void;

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { currentScreen } = props;
		if (currentScreen !== 'History') {
			return {
				hasRefreshed: false,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		this.state = {
			rowsAndSections: [],
			hasRefreshed: false,
			refreshing: true,
			hasLoaded: false,
			historyDetails: {
				show: false,
				data: {},
			},
		};
		this.renderRow = this.renderRow.bind(this);
		this.renderSectionHeader = this.renderSectionHeader.bind(this);

		this._onRefresh = this._onRefresh.bind(this);
		this.getHistoryDataFromAPI = this.getHistoryDataFromAPI.bind(this);
		this.getHistoryDataWithLatestTimestamp = this.getHistoryDataWithLatestTimestamp.bind(this);
		this.onOriginPress = this.onOriginPress.bind(this);
	}

	componentDidMount() {
		this.getHistoryData(false, true, this.getHistoryDataWithLatestTimestamp());
	}

	closeHistoryDetailsModal = () => {
		const { show, data } = this.state.historyDetails;
		if (show) {
			this.setState({
				historyDetails: {
					show: false,
					data,
				},
			});
		}
	}

	onOriginPress(data: Object) {
		this.setState({
			historyDetails: {
				show: true,
				data,
			},
		});
	}

	/**
	 *
	 * @hasLoaded : Determines if data loading has been complete(incase when no data in local, API fetch makes loading complete)
	 * Used to determine if data is empty or not, if empty show message.
	 * @refreshing : Used to update the refreshControl state.
	 * @callBackWhenNoData : A callback function to be called when no data found local(Usually function that fetches data
	 * from the API)
	 */
	getHistoryData(hasLoaded: boolean = false, refreshing: boolean = false, callBackWhenNoData: Function = () => {}) {
		if (this.props.device.id) {
			getHistory('device', this.props.device.id).then((data: Object) => {
				if (data && data.length !== 0) {
					let rowsAndSections = parseHistoryForSectionList(data);
					this.setState({
						rowsAndSections,
						hasLoaded: true,
						refreshing: false,
					});
				} else {
					this.setState({
						rowsAndSections: [],
						hasLoaded,
						refreshing,
					});
					callBackWhenNoData();
				}
			}).catch(() => {
				this.setState({
					rowsAndSections: [],
					hasLoaded,
					refreshing,
				});
				callBackWhenNoData();
			});
		}
	}

	componentDidUpdate(prevProps: Object, prevState: Object) {
		const { currentScreen } = this.props;
		const { hasRefreshed } = this.state;
		if (currentScreen === 'History' && !hasRefreshed) {
			this.refreshHistoryData();
			this.setState({
				hasRefreshed: true,
			});
		}
	}

	keyExtractor(item: Object, index: number): string {
		let key = `${item.ts}${index}`;
		return key;
	}

	refreshHistoryData() {
		let that = this;
		this.delayRefreshHistoryData = setTimeout(() => {
			that.setState({
				refreshing: true,
			});
			that.getHistoryDataWithLatestTimestamp();
		}, 2000);
	}

	getHistoryDataWithLatestTimestamp() {
		let { device } = this.props;
		getLatestTimestamp('device', device.id).then((res: Object) => {
			let prevTimestamp = res.tsMax ? (res.tsMax + 1) : null;
			this.getHistoryDataFromAPI(device, prevTimestamp);
		}).catch(() => {
			this.getHistoryDataFromAPI(device, null);
		});
	}

	getHistoryDataFromAPI(device: Object, prevTimestamp: number) {
		let noop = () => {};
		this.props.dispatch(getDeviceHistory(this.props.device, prevTimestamp))
			.then((response: Object) => {
				if (response.history && response.history.length !== 0) {
					let data = {
						history: response.history,
						deviceId: this.props.device.id,
					};
					storeHistory('device', data).then(() => {
						this.getHistoryData(true, false, noop);
					}).catch(() => {
						this.getHistoryData(true, false, noop);
					});
				} else {
					this.getHistoryData(true, false, noop);
				}
			}).catch(() => {
				this.getHistoryData(true, false, noop);
			});
	}

	renderRow(row: Object): Object {
		const { screenProps, device, gatewayTimezone, currentScreen } = this.props;
		const { intl, appLayout } = screenProps;
		const { deviceType } = device;
		const { historyDetails } = this.state;

		const { section, index, item } = row;

		const sectionLength = section.data.length;
		const isLast = index === sectionLength - 1;

		return (
			<HistoryRow
				id={index}
				item={item}
				section={section.key}
				intl={intl}
				isFirst={+index === 0}
				currentScreen={currentScreen}
				deviceType={deviceType}
				onOriginPress={this.onOriginPress}
				isModalOpen={historyDetails.show}
				isLast={isLast}
				appLayout={appLayout}
				gatewayTimezone={gatewayTimezone}
			/>
		);
	}

	renderSectionHeader(item: Object): Object {
		let { appLayout } = this.props.screenProps;

		let {
			sectionHeader,
			sectionHeaderText,
		} = this.getStyle(appLayout);

		return (
			<View
				level={2}
				style={sectionHeader}>
				<FormattedDate
					value={item.section.key}
					localeMatcher= "best fit"
					formatMatcher= "best fit"
					weekday="long"
					day="2-digit"
					month="long"
					style={sectionHeaderText}/>
			</View>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'History';
	}

	_onRefresh() {
		this.setState({
			refreshing: true,
		});
		this.getHistoryDataWithLatestTimestamp();
	}

	render(): Object | null {
		let { screenProps, device, currentScreen } = this.props;
		let { hasLoaded, refreshing, rowsAndSections, historyDetails } = this.state;
		let { intl, appLayout } = screenProps;

		if (!device.id) {
			return null;
		}

		let {
			line,
			textWhenNoData,
			iconSize,
		} = this.getStyle(appLayout);

		// response received but, no history for the requested device, so empty list message.
		if (!refreshing && hasLoaded && rowsAndSections.length === 0) {
			return (
				<View
					level={3}
					style={styles.containerWhenNoData}>
					<View style={{
						flexDirection: 'row',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Icon name="exclamation-circle" size={iconSize} level={23}/>
						<Text style={textWhenNoData}>
							<FormattedMessage {...i18n.noRecentActivity} style={textWhenNoData}/>...
						</Text>
					</View>
				</View>
			);
		}
		return (
			<View
				level={3}
				style={styles.container}>
				<SectionList
					style={{flex: 1}}
					contentContainerStyle={{flexGrow: 1}}
					sections={this.state.rowsAndSections}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					keyExtractor={this.keyExtractor}
					initialNumToRender={10}
					stickySectionHeadersEnabled={true}
					refreshControl={
						<ThemedRefreshControl
						  refreshing={this.state.refreshing}
						  onRefresh={this._onRefresh}
						/>
					  }
				/>
				{this.state.rowsAndSections.length !== 0 && (
					<View style={line}/>
				)}
				<DeviceHistoryDetails
					intl={intl}
					currentScreen={currentScreen}
					showDetails={historyDetails.show}
					detailsData={historyDetails.data}
					closeHistoryDetailsModal={this.closeHistoryDetailsModal}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			fontSizeFactorFour,
		} = Theme.Core;

		const fontSizeNoData = Math.floor(deviceWidth * 0.03);
		const fontSizeSectionText = Math.floor(deviceWidth * fontSizeFactorFour);
		const iconSize = Math.floor(deviceWidth * 0.06);

		return {
			line: {
				backgroundColor: '#A59F9A',
				height: '100%',
				width: 1,
				position: 'absolute',
				left: deviceWidth * 0.071333333,
				top: 0,
				zIndex: -1,
			},
			sectionHeaderText: {
				color: '#A59F9A',
				fontSize: fontSizeSectionText,
			},
			sectionHeader: {
				paddingVertical: fontSizeSectionText * 0.5,
				justifyContent: 'center',
				paddingLeft: 5 + (fontSizeSectionText * 0.2),
				...Theme.Core.shadow,
			},
			textWhenNoData: {
				marginLeft: 10 + (fontSizeNoData * 0.2),
				color: '#A59F9A',
				fontSize: fontSizeNoData,
			},
			iconSize,
		};
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	containerWhenNoData: {
		flex: 1,
		paddingTop: 20,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
	},
});

// prepares the row and section data required for the List.
const parseHistoryForSectionList = (data: Object): Array<any> => {
	let result = groupBy(data, (items: Object): any => {
		let date = new Date(items.ts * 1000).toDateString();
		return date;
	});
	result = reduce(result, (acc: Array<any>, next: Object, index: number): Array<any> => {
		acc.push({
			key: index,
			data: next,
		});
		return acc;
	}, []);
	return result;
};

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const { route } = ownProps;
	const { id } = route.params || {};
	const device = state.devices.byId[id] || {};
	const { clientId } = device;

	const gateway = state.gateways.byId[clientId];
	const {
		timezone: gatewayTimezone,
	} = gateway ? gateway : {};

	const {
		screen: currentScreen,
	} = state.navigation;

	return {
		device,
		gatewayTimezone,
		currentScreen,
	};
}

module.exports = (connect(mapStateToProps, mapDispatchToProps)(HistoryTab): Object);

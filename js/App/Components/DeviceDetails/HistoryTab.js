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
import { StyleSheet, SectionList, RefreshControl } from 'react-native';
import reduce from 'lodash/reduce';
import groupBy from 'lodash/groupBy';

import { FormattedMessage, Text, View, Icon, FormattedDate, TabBar } from '../../../BaseComponents';
import { DeviceHistoryDetails, HistoryRow } from './SubViews';
import { getDeviceHistory } from '../../Actions/Devices';
import { getHistory, storeHistory, getLatestTimestamp } from '../../Actions/LocalStorage';
import i18n from '../../Translations/common';
import Theme from '../../Theme';

type Props = {
	dispatch: Function,
	device: Object,
	rowsAndSections: Array<any> | boolean,
	screenProps: Object,
	currentScreen: string,
	navigation: Object,
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
	renderSectionHeader: (Object, string) => void;
	renderRow: (Object, string) => void;
	closeHistoryDetailsModal: () => void;
	_onRefresh: () => void;
	getHistoryDataFromAPI: (Object, number | null) => void;
	getHistoryDataWithLatestTimestamp: () => void;
	onOriginPress: () => void;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="history"
				tintColor={tintColor}
				label={i18n.historyHeader}
				accessibilityLabel={i18n.deviceHistoryTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			const noOp = () => {};
			const onPress = navigation.getParam('actionOnHistoryTabPress', noOp);
			onPress();
			navigation.navigate({
				routeName: 'History',
				key: 'History',
			});
		},
	});

	static getDerivedStateFromProps(props: Object, state: Object): null | Object {
		const { screenProps } = props;
		if (screenProps.currentScreen !== 'History') {
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
		this.closeHistoryDetailsModal = this.closeHistoryDetailsModal.bind(this);

		this._onRefresh = this._onRefresh.bind(this);
		this.getHistoryDataFromAPI = this.getHistoryDataFromAPI.bind(this);
		this.getHistoryDataWithLatestTimestamp = this.getHistoryDataWithLatestTimestamp.bind(this);
		this.onOriginPress = this.onOriginPress.bind(this);
	}

	componentDidMount() {
		let {setParams} = this.props.navigation;
		setParams({
			actionOnHistoryTabPress: this.closeHistoryDetailsModal,
		});
		this.getHistoryData(false, true, this.getHistoryDataWithLatestTimestamp());
	}

	closeHistoryDetailsModal() {
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
		const { screenProps } = this.props;
		const { hasRefreshed } = this.state;
		if (screenProps.currentScreen === 'History' && !hasRefreshed) {
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

	renderRow(item: Object): Object {
		const { screenProps, device } = this.props;
		const { intl, currentScreen } = screenProps;
		const { deviceType } = device;
		const { historyDetails } = this.state;

		return (
			<HistoryRow
				id={item.index}
				item={item.item}
				section={item.section.key}
				intl={intl}
				isFirst={+item.index === 0}
				currentScreen={currentScreen}
				deviceType={deviceType}
				onOriginPress={this.onOriginPress}
				isModalOpen={historyDetails.show}
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
			<View style={sectionHeader}>
				<FormattedDate
					value={item.section.key}
					localeMatcher= "best fit"
					formatMatcher= "best fit"
					weekday="long"
					day="2-digit"
					month="long"
					style={sectionHeaderText} />
			</View>
		);
	}

	componentWillUnmount() {
		clearTimeout(this.delayRefreshHistoryData);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentScreen === 'History';
	}

	_onRefresh() {
		this.setState({
			refreshing: true,
		});
		this.getHistoryDataWithLatestTimestamp();
	}

	render(): Object | null {
		let { screenProps, device } = this.props;
		let { hasLoaded, refreshing, rowsAndSections, historyDetails } = this.state;
		let { intl, currentScreen, appLayout } = screenProps;
		let { brandPrimary } = Theme.Core;

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
				<View style={styles.containerWhenNoData}>
					<Icon name="exclamation-circle" size={iconSize} color="#F06F0C" />
					<Text style={textWhenNoData}>
						<FormattedMessage {...i18n.noRecentActivity} style={textWhenNoData}/>...
					</Text>
				</View>
			);
		}
		return (
			<View style={styles.container}>
				<SectionList
					style={{flex: 1}}
					contentContainerStyle={{flexGrow: 1}}
					sections={this.state.rowsAndSections}
					renderItem={this.renderRow}
					renderSectionHeader={this.renderSectionHeader}
					keyExtractor={this.keyExtractor}
					initialNumToRender={10}
					refreshControl={
						<RefreshControl
						  refreshing={this.state.refreshing}
						  onRefresh={this._onRefresh}
						  colors={[brandPrimary]}
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
					detailsData={historyDetails.data}/>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const fontSizeNoData = Math.floor(deviceWidth * 0.03);
		const fontSizeSectionText = Math.floor(deviceWidth * 0.04);
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
				backgroundColor: '#ffffff',
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
		paddingTop: 20,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
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
	const id = ownProps.navigation.getParam('id', null);
	const device = state.devices.byId[id];

	return {
		device: device ? device : {},
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);

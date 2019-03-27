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
import { SectionList } from 'react-native';
import orderBy from 'lodash/orderBy';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import reduce from 'lodash/reduce';

import { View, Text } from '../../../BaseComponents';
import { ScheduleProps } from './ScheduleScreen';
import { DeviceRow } from './SubViews';
import i18n from '../../Translations/common';
import Theme from '../../Theme';
interface Props extends ScheduleProps {
	devices: Object,
	gateways: Object,
}

type State = {
	dataSource: Array<Object>,
	refreshing: boolean,
};

export default class Device extends View<void, Props, State> {

	state = {
		dataSource: this.parseDataForList(this.props.devices.byId, this.props.gateways.byId),
		refreshing: false,
	};

	_renderSectionHeader: (Object) => Object;
	constructor(props: Props) {
		super(props);

		let { formatMessage } = this.props.intl;

		this.h1 = formatMessage(i18n.labelDevice);
		this.h2 = formatMessage(i18n.posterChooseDevice);

		this._renderSectionHeader = this._renderSectionHeader.bind(this);
	}

	parseDataForList(devices: Object, gateways: Object): Array<Object> {
		devices = filter(devices, (device: Object): any => !isEmpty(device.supportedMethods));
		devices = orderBy(devices, [(device: Object): any => {
			let { name } = device;
			name = typeof name !== 'string' ? '' : name;
			return name.toLowerCase();
		}], ['asc']);
		if (Object.keys(gateways).length > 1) {
			devices = groupBy(devices, (items: Object): Array<any> => {
				let gateway = gateways[items.clientId];
				return gateway && gateway.name;
			});
			devices = reduce(devices, (acc: Array<any>, next: Object, index: number): Array<any> => {
				acc.push({
					key: `${index}`,
					data: next,
				});
				return acc;
			}, []);
			return devices;
		} else if (Object.keys(gateways).length === 1) {
			return [{
				key: '1',
				data: [...devices],

			}];
		}
		return [];
	}

	componentDidMount() {
		const { actions, onDidMount } = this.props;
		actions.getDevices();
		onDidMount(this.h1, this.h2);
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.currentScreen === 'InitialScreen';
	}

	onRefresh = () => {
		this.setState({
			refreshing: true,
		});
		this.props.actions.getDevices().then(() => {
			this.setState({
				refreshing: false,
			});
		}).catch(() => {
			this.setState({
				refreshing: false,
			});
		});
	};

	selectDevice = (row: Object) => {
		const { actions, navigation } = this.props;
		navigation.navigate({
			routeName: 'Action',
			key: 'Action',
		});
		actions.selectDevice(row.id);
	};

	_keyExtractor(item: Object, index: number): string {
		return index.toString();
	}

	render(): React$Element<SectionList> | null {
		const { dataSource, refreshing } = this.state;
		if (!dataSource || dataSource.length <= 0) {
			return null;
		}
		const {padding} = this.getStyles();
		return (
			<SectionList
				sections={dataSource}
				renderItem={this._renderRow}
				renderSectionHeader={this._renderSectionHeader}
				keyExtractor={this._keyExtractor}
				onRefresh={this.onRefresh}
				refreshing={refreshing}
				contentContainerStyle={{
					flexGrow: 1,
					paddingTop: padding,
				}}
				stickySectionHeadersEnabled={true}
			/>
		);
	}

	_renderRow = (row: Object): Object => {
		const { appLayout, intl } = this.props;
		const { item, section, index } = row;
		// TODO: use device description
		const preparedRow = Object.assign({}, item, { description: '' });
		const {
			padding,
		} = this.getStyles();

		const sectionLength = section.data.length;
		const isLast = index === sectionLength - 1;

		return (
			<DeviceRow
				row={preparedRow}
				onPress={this.selectDevice}
				appLayout={appLayout}
				intl={intl}
				labelPostScript={intl.formatMessage(i18n.defaultDescriptionButton)}
				containerStyle = {{
					flex: 1,
					alignItems: 'stretch',
					justifyContent: 'space-between',
					marginVertical: undefined,
					height: undefined,
					marginTop: padding / 2,
					marginBottom: isLast ? padding : 0,
					marginHorizontal: padding,
				}}
			/>
		);
	};

	_renderSectionHeader(sectionData: Object): Object | null {
		const { key } = sectionData.section;
		const { dataSource } = this.state;
		if (dataSource.length === 1) {
			return null;
		}
		const {
			nameFontSize,
			sectionHeader,
		} = this.getStyles();
		return (
			<View style={sectionHeader}>
				<Text style={[Theme.Styles.sectionHeaderText, {fontSize: nameFontSize}]}>
					{key}
				</Text>
			</View>
		);
	}

	getStyles(): Object {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			maxSizeRowTextOne,
			paddingFactor,
			shadow,
		} = Theme.Core;

		const padding = deviceWidth * paddingFactor;

		let nameFontSize = Math.floor(deviceWidth * 0.047);
		nameFontSize = nameFontSize > maxSizeRowTextOne ? maxSizeRowTextOne : nameFontSize;

		return {
			nameFontSize,
			padding,
			sectionHeader: {
				flexDirection: 'row',
				paddingVertical: 2 + (nameFontSize * 0.2),
				backgroundColor: '#ffffff',
				alignItems: 'center',
				paddingLeft: 5 + (nameFontSize * 0.2),
				justifyContent: 'flex-start',
				marginBottom: padding / 2,
				...shadow,
			},
		};
	}

}

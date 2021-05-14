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
 *
 */

// @flow

'use strict';

import React from 'react';
import {
	Keyboard,
	InteractionManager,
	ScrollView,
} from 'react-native';
const isEqual = require('react-fast-compare');

import {
	View,
	FloatingButton,
	Text,
	IconTelldus,
	InfoBlock,
} from '../../../../BaseComponents';
import { NameRow, DeviceInfoBlock } from './SubViews';

import {
	prepareVisibleTabs,
} from '../../../Lib/NavigationService';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	route: Object,
	hiddenTabsCurrentUser: Array<string>,

    intl: Object,
	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
};

type State = {
	rowData: Object,
	isLoading: boolean,
};

class DeviceName extends View<Props, State> {
props: Props;
state: State;

submitName: () => void;
onChangeName: (string, number) => void;
setRef: (ref: any, id: number) => void;

inputRefs: Object;

constructor(props: Props) {
	super(props);

	const {
		devices = [],
		mainNodeDeviceId = null,
	} = props.route.params || {};
	let rowData = {};
	devices.map(({id, clientDeviceId}: Object, index: number) => {
		rowData[id] = {
			id,
			name: '',
			index,
			mainNode: mainNodeDeviceId === clientDeviceId,
			clientDeviceId,
		};
	});

	this.state = {
		rowData,
		isLoading: false,
	};
	this.submitName = this.submitName.bind(this);
	this.onChangeName = this.onChangeName.bind(this);
	this.setRef = this.setRef.bind(this);

	this.inputRefs = {};
	this.postSubmitTimeout = null;
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.name), formatMessage(i18n.AddZDNameHeaderTwo));
}

componentWillUnmount() {
	clearTimeout(this.postSubmitTimeout);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	if (nextProps.currentScreen === nextProps.ScreenName) {
		if (!isEqual(this.state, nextState)) {
			return true;
		}
		if (!isEqual(this.props, nextProps)) {
			return true;
		}
		return false;
	}
	return false;
}

setRef(ref: any, id: number) {
	this.inputRefs[id] = ref;
}

submitName() {
	const { actions } = this.props;
	const { rowData } = this.state;
	let emptyField = false, promises = [];
	for (let key in rowData) {
		let { name = '', id } = rowData[key];
		if (name === '') {
			emptyField = id;
			break;
		} else {
			promises.push(actions.setDeviceName(id, name));
		}
	}

	if (!emptyField) {
		Keyboard.dismiss();
		this.setState({
			isLoading: true,
		}, () => {
			Promise.all(promises).then(() => {
				this.postSubmitTimeout = setTimeout(() => {
					this.postSubmitName();
				}, 1000);
			});
		});
	} else if (this.inputRefs[emptyField]) {
		this.inputRefs[emptyField].focus();
	}
}

postSubmitName = async () => {
	const { navigation, actions, route, hiddenTabsCurrentUser } = this.props;
	const { rowData } = this.state;

	try {
		await actions.getDevices();
		await actions.getSensors();
	} catch (e) {
		// Ignore
	} finally {
		this.setState({
			isLoading: false,
		}, () => {
			InteractionManager.runAfterInteractions(() => {

				const {
					gateway = {},
					parent: parentScreen = '',
					sensors = [],
				} = route.params || {};

				if (parentScreen === 'sensors_tab') {
					if (sensors.length > 0) {

						let newSensors = {};
						sensors.map(({id, clientDeviceId}: Object, index: number) => {
							newSensors[id] = {
								id,
								name: '',
								index,
								mainNode: true,
								clientDeviceId,
							};
						});

						navigation.navigate('Sensors', {
							gateway,
							newSensors,
						});

						return;
					}
				}

				const {
					tabToCheckOrVeryNext,
				} = prepareVisibleTabs(hiddenTabsCurrentUser, 'Devices');

				navigation.navigate(tabToCheckOrVeryNext, {
					gateway,
					newDevices: rowData,
				});
			});
		});
	}
}

onChangeName(name: string, id: number) {
	const { rowData } = this.state;
	const newItem = {
		...rowData[id],
		name,
	};
	const newRowData = {
		...rowData,
		[id]: newItem,
	};
	this.setState({
		rowData: newRowData,
	});
}

getDeviceInfo(styles: Object): Object {
	const { intl, appLayout, route } = this.props;
	const { formatMessage } = intl;
	const {
		info = {},
	} = route.params || {};
	const {
		deviceImage,
		deviceModel,
		deviceBrand,
		imageW,
		imageH,
	} = info;

	return (
		<DeviceInfoBlock
			image={deviceImage}
			h1={deviceModel ? deviceModel : formatMessage(i18n.addDeviceDefaultModel)}
			h2={deviceBrand ? deviceBrand : formatMessage(i18n.addDeviceDefaultBrand)}
			imageW={imageW}
			imageH={imageH}
			appLayout={appLayout}
		/>
	);
}

getNameRow({key, deviceName, id, label, header, placeholder, containerStyle, autoFocus}: Object): Object {
	const { appLayout } = this.props;

	return (
		<NameRow
			key={key}
			id={id}
			value={deviceName}
			icon={'device-alt'}
			label={label}
			header={header}
			appLayout={appLayout}
			placeholder={placeholder}
			containerStyle={containerStyle}
			autoFocus={autoFocus}
			onChangeName={this.onChangeName}
			submitName={this.submitName}
			setRef={this.setRef}/>
	);
}

render(): Object {
	const { rowData, isLoading } = this.state;
	const {
		intl,
		route,
		appLayout,
	} = this.props;

	const {
		container,
		iconSize,
		iconStyle,
		infoIconStyle,
		rowsContainer,
		boxContainerStyle,
		infoTextStyle,
		infoContainer,
		statusIconStyle,
		...otherStyles
	} = this.getStyles();
	const header = this.getDeviceInfo(otherStyles);

	let rows = [], firstRow;
	for (let key in rowData) {
		const { name: deviceName = '', index, id, mainNode } = rowData[key] || {};
		if (mainNode) {
			firstRow = this.getNameRow({
				key,
				deviceName,
				id,
				header,
				label: intl.formatMessage(i18n.name),
				placeholder: '',
				autoFocus: true,
			});
		} else {
			rows.push(this.getNameRow({
				key,
				deviceName,
				id,
				header: null,
				label: intl.formatMessage(i18n.setNameMultichannelEditLabel, {value: index}),
				placeholder: intl.formatMessage(i18n.setNameMultichannelEditLabel, {value: index}),
				containerStyle: boxContainerStyle,
				autoFocus: false,
			}));
		}
	}

	const {
		statusMessage = null,
		statusIcon = null,
		interviewPartialStatusMessage: hintMessage = null,
	} = route.params || {};

	return (
		<View style={{ flex: 1 }}>
			<ScrollView
				keyboardShouldPersistTaps={'always'}>
				<View style={container}>
					{firstRow}
					{rows.length !== 0 && (
						<View style={rowsContainer}>
							<InfoBlock
								text={intl.formatMessage(i18n.setNameMultichannelInfo)}
								appLayout={appLayout}
								infoContainer={infoContainer}
								textStyle={infoTextStyle}
								infoIconStyle={infoIconStyle}/>
							{rows}
						</View>
					)}
					{!!statusMessage && (
						<View
							level={2}
							style={infoContainer}>
							<IconTelldus icon={statusIcon} style={[statusIconStyle, {
								color: statusIcon === 'security' ? '#9CCC65' : '#F44336',
							}]}/>
							<Text
								level={26}
								style={infoTextStyle}>
								{statusMessage}
							</Text>
						</View>
					)}
					{!!hintMessage && (
						<InfoBlock
							text={hintMessage}
							appLayout={appLayout}
							infoContainer={infoContainer}
							textStyle={infoTextStyle}
							infoIconStyle={statusIconStyle}/>
					)}
				</View>
			</ScrollView>
			<FloatingButton
				onPress={this.submitName}
				iconName={this.state.isLoading ? false : 'checkmark'}
				showThrobber={isLoading}
				iconSize={iconSize}
				iconStyle={iconStyle}
			/>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		paddingFactor,
		editBoxPaddingFactor,
		shadow,
		fontSizeFactorFour,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const editBoxPadding = deviceWidth * editBoxPaddingFactor;

	const infoTextFontSize = deviceWidth * fontSizeFactorFour;

	return {
		container: {
			flex: 1,
			paddingVertical: padding,
			marginHorizontal: padding,
		},
		rowsContainer: {
			alignItems: 'stretch',
			justifyContent: 'center',
			width: '100%',
		},
		infoContainer: {
			flex: 1,
			flexDirection: 'row',
			marginTop: padding / 2,
			paddingVertical: 3 + (infoTextFontSize * 0.3),
			paddingRight: editBoxPadding,
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * 0.12,
			marginHorizontal: editBoxPadding,
		},
		boxContainerStyle: {
			marginTop: padding / 2,
		},
		infoIconStyle: {
			fontSize: deviceWidth * 0.08,
			marginHorizontal: editBoxPadding,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: infoTextFontSize,
			flexWrap: 'wrap',
		},
		iconSize: deviceWidth * 0.050666667,
		iconStyle: {
			fontSize: deviceWidth * 0.050666667,
			color: '#fff',
		},
	};
}
}

export default (DeviceName: Object);

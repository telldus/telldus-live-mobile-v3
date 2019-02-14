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
} from '../../../../BaseComponents';
import { NameRow, DeviceInfoBlock } from './SubViews';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,

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

submitName: (number) => void;
onChangeName: (string, number) => void;
setRef: (ref: any, id: number) => void;

inputRefs: Object;

constructor(props: Props) {
	super(props);

	const devices = props.navigation.getParam('devices', []);
	const mainNodeDeviceId = props.navigation.getParam('mainNodeDeviceId', null);
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
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.name), formatMessage(i18n.AddZDNameHeaderTwo));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	if (nextProps.currentScreen === 'DeviceName') {
		if (!isEqual(this.state, nextState)) {
			return true;
		}
		if (nextProps.appLayout.width !== this.props.appLayout.width) {
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
				this.postSubmitName();
			});
		});
	} else if (this.inputRefs[emptyField]) {
		this.inputRefs[emptyField].focus();
	}
}

postSubmitName() {
	const { navigation } = this.props;
	const { rowData } = this.state;

	this.setState({
		isLoading: false,
	}, () => {
		InteractionManager.runAfterInteractions(() => {
			navigation.navigate({
				routeName: 'Devices',
				key: 'Devices',
				params: {
					newDevices: rowData,
				},
			});
		});
	});
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
	const { navigation, intl, appLayout } = this.props;
	const { formatMessage } = intl;
	const {
		deviceImage,
		deviceModel,
		deviceBrand,
		imageW,
		imageH,
	} = navigation.getParam('info', {});

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
	const { intl, navigation } = this.props;

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

	const statusMessage = navigation.getParam('statusMessage', null);
	const statusIcon = navigation.getParam('statusIcon', null);
	const hintMessage = navigation.getParam('interviewPartialStatusMessage', null);

	return (
		<View style={{ flex: 1 }}>
			<ScrollView
				keyboardShouldPersistTaps={'always'}>
				<View style={container}>
					{firstRow}
					{rows.length !== 0 && (
						<View style={rowsContainer}>
							<View style={infoContainer}>
								<IconTelldus icon={'info'} style={infoIconStyle}/>
								<Text style={infoTextStyle}>
									{intl.formatMessage(i18n.setNameMultichannelInfo)}
								</Text>
							</View>
							{rows}
						</View>
					)}
					{!!statusMessage && (
						<View style={infoContainer}>
							<IconTelldus icon={statusIcon} style={[statusIconStyle, {
								color: statusIcon === 'security' ? '#9CCC65' : '#F44336',
							}]}/>
							<Text style={infoTextStyle}>
								{statusMessage}
							</Text>
						</View>
					)}
					{!!hintMessage && (
						<View style={infoContainer}>
							<IconTelldus icon={'info'} style={statusIconStyle}/>
							<Text style={infoTextStyle}>
								{hintMessage}
							</Text>
						</View>
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
	const { paddingFactor, eulaContentColor, brandSecondary, editBoxPaddingFactor, shadow } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const editBoxPadding = deviceWidth * editBoxPaddingFactor;

	const infoTextFontSize = deviceWidth * 0.04;

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
			backgroundColor: '#fff',
			...shadow,
			alignItems: 'center',
			justifyContent: 'space-between',
			borderRadius: 2,
		},
		statusIconStyle: {
			fontSize: deviceWidth * 0.12,
			marginHorizontal: editBoxPadding,
			color: brandSecondary,
		},
		boxContainerStyle: {
			marginTop: padding / 2,
		},
		infoIconStyle: {
			fontSize: deviceWidth * 0.08,
			color: brandSecondary,
			marginHorizontal: editBoxPadding,
		},
		infoTextStyle: {
			flex: 1,
			fontSize: infoTextFontSize,
			color: eulaContentColor,
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

export default DeviceName;

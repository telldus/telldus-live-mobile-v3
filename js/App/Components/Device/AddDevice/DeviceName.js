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
	Image,
	Keyboard,
	InteractionManager,
	ScrollView,
	KeyboardAvoidingView,
} from 'react-native';
const isEqual = require('react-fast-compare');

import {
	View,
	FloatingButton,
	Text,
	IconTelldus,
} from '../../../../BaseComponents';
import { NameRow } from './SubViews';

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

	const deviceIds = props.navigation.getParam('deviceIds', []);
	let rowData = {};
	deviceIds.map((id: number, index: number) => {
		rowData[id] = {
			id,
			name: '',
			index,
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
	onDidMount(`4. ${formatMessage(i18n.name)}`, formatMessage(i18n.AddZDNameHeaderTwo));
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

getImageDimensions(appLayout: Object): Object {
	const {
		imageW,
		imageH,
	} = this.props.navigation.getParam('info', {});
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const imageHeight = deviceWidth * 0.25;
	const imageWidth = deviceWidth * 0.29;
	if (!imageW || !imageH) {
		return { imgWidth: imageWidth, imgHeight: imageHeight };
	}

	let ratioHW = imageH / imageW;
	return { imgWidth: imageHeight / ratioHW, imgHeight: imageHeight };
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
		this.setState({
			isLoading: true,
		});
		Keyboard.dismiss();
		Promise.all(promises).then(() => {
			this.postSubmitName();
		}).catch(() => {
			this.postSubmitName();
		});
	} else if (this.inputRefs[emptyField]) {
		this.inputRefs[emptyField].focus();
	}
}

postSubmitName() {
	const { actions, navigation } = this.props;

	actions.getDevices().then(() => {
		this.setState({
			isLoading: false,
		});
		InteractionManager.runAfterInteractions(() => {
			navigation.navigate({
				routeName: 'Devices',
				key: 'Devices',
			});
		});
	}).catch(() => {
		InteractionManager.runAfterInteractions(() => {
			this.setState({
				isLoading: false,
			});
			navigation.navigate({
				routeName: 'Devices',
				key: 'Devices',
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
	const { navigation } = this.props;
	const {
		deviceImage,
		deviceName,
		deviceBrand,
	} = navigation.getParam('info', {});

	return (
		<View style={styles.deviceInfoCoverStyle}>
			{deviceImage && (<Image
				source={{uri: deviceImage}}
				resizeMode={'contain'}
				style={styles.deviceImageStyle}/>
			)}
			<View>
				{!!deviceName && (<Text style={styles.deviceNameStyle}>
					{deviceName}
				</Text>
				)}
				{!!deviceBrand && (<Text style={styles.deviceBrandStyle}>
					{deviceBrand}
				</Text>
				)}
			</View>
		</View>
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
	const { intl } = this.props;

	const {
		container,
		iconSize,
		iconStyle,
		infoIconStyle,
		rowsContainer,
		boxContainerStyle,
		infoTextStyle,
		infoContainer,
		...otherStyles
	} = this.getStyles();
	const header = this.getDeviceInfo(otherStyles);

	let rows = [], firstRow;
	for (let key in rowData) {
		const { name: deviceName = '', index, id } = rowData[key] || {};
		if (index === 0) {
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

	return (
		<View style={{ flex: 1 }}>
			<ScrollView
				keyboardShouldPersistTaps={'always'}>
				<KeyboardAvoidingView
					behavior="padding"
					style={{ flex: 1 }}
					contentContainerStyle={{ justifyContent: 'center' }}>
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
					</View>
				</KeyboardAvoidingView>
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
	const { imgWidth, imgHeight } = this.getImageDimensions(appLayout);

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
		deviceInfoCoverStyle: {
			flexDirection: 'row',
			marginBottom: 4,
			alignItems: 'center',
		},
		deviceImageStyle: {
			width: imgWidth,
			height: imgHeight,
			marginRight: padding,
		},
		deviceNameStyle: {
			fontSize: deviceWidth * 0.05,
			color: brandSecondary,
		},
		deviceBrandStyle: {
			fontSize: deviceWidth * 0.04,
			color: eulaContentColor,
		},
	};
}
}

export default DeviceName;

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
 * Telldus Live! app is distributed in the hope this it will be useful,
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
	ScrollView,
} from 'react-native';

import {
	View,
	FloatingButton,
	InfoBlock,
	FullPageActivityIndicator,
	ProgressBarLinear,
	Text,
} from '../../../../BaseComponents';
import {
	NumberedBlock,
} from './SubViews';
import {
	LearnButton,
} from '../../TabViews/SubViews';

import {
	get433DevicePostConfigScreenOptions,
} from '../../../Lib/DeviceUtils';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	addDevice: Object,
	sessionId: string,

	onDidMount: (string, string, ?Object) => void,
	navigation: Object,
	actions: Object,
	intl: Object,
	processWebsocketMessage: (string, string, string, Object) => any,
	toggleLeftIconVisibilty: (boolean) => void,
};

type State = {
};

class Include433 extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	const { navigation, intl } = props;
	const gateway = navigation.getParam('gateway', {});
	const { id } = gateway;
	this.gatewayId = id.toString();

	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
		postConfig,
	} = deviceInfo;
	this.PostConfigScreenOptions = get433DevicePostConfigScreenOptions(postConfig, intl.formatMessage);

	this.deleteSocketAndTimer = null;
}

componentDidMount() {
	const {
		onDidMount,
		intl,
		actions,
		navigation,
	} = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.connect), formatMessage(i18n.connectYourDevice));

	const gateway = navigation.getParam('gateway', {});
	const { id } = gateway;
	let deviceInfo = navigation.getParam('deviceInfo', '');
	let deviceName = navigation.getParam('deviceName', '');
	deviceInfo = {
		...deviceInfo,
		deviceName,
	};

	this.deleteSocketAndTimer = actions.initiateAdd433MHz(id.toString(), deviceInfo, formatMessage);
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'Include433';
}

componentWillUnmount() {
	if (this.deleteSocketAndTimer) {
		this.deleteSocketAndTimer();
	}
}

onNext = async () => {
	const { navigation, addDevice, actions } = this.props;
	const { addDevice433 = {}} = addDevice;
	const {
		deviceId,
	} = addDevice433;
	const deviceName = navigation.getParam('deviceName', '');
	// $FlowFixMe
	let rowData = {[deviceId]: {
		id: deviceId,
		name: deviceName,
		index: 0,
		mainNode: true,
	}};

	await actions.getDevices();
	navigation.navigate({
		routeName: 'Devices',
		key: 'Devices',
		params: {
			newDevices: rowData,
		},
	});
}

render(): Object {
	const { intl, appLayout, navigation, addDevice } = this.props;
	const { formatMessage } = intl;

	const { addDevice433 = {}} = addDevice;
	const {
		deviceId,
		isLoading = true,
		progressValue = 0,
	} = addDevice433;

	const {
		containerStyle,
		buttonStyle,
		infoContainer,
		infoTextStyle,
		padding,
		iconStyle,
		progressWidth,
		progressBarStyle,
		progressCover,
		statusStyle,
	} = this.getStyles();

	if (isLoading) {
		return <FullPageActivityIndicator/>;
	}
	if (!isLoading && !deviceId) {
		return <InfoBlock
			text={formatMessage(i18n.messageAdd433Failed)}
			appLayout={appLayout}
			infoContainer={[infoContainer, {
				marginVertical: padding,
			}]}
			textStyle={infoTextStyle}/>;
	}

	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
	} = deviceInfo;
	const {
		descriptions,
		info,
		learnButtonIndex,
		progress,
		image,
		imageIndex,
	} = this.PostConfigScreenOptions;

	const statusText = `(${progressValue}% ${intl.formatMessage(i18n.done).toLowerCase()})`;

	const Descriptions = descriptions.map((text: string, i: number): Object => {
		return (<NumberedBlock
			key={i}
			number={`${i + 1}.`}
			text={text}
			img={(i === imageIndex && image) ? image : undefined}
			rightBlockIItemOne={
				i === learnButtonIndex ?
					<LearnButton
						id={deviceId}
						style={buttonStyle}/>
					: undefined
			}
			progress={progress &&
				<View style={progressCover}>
					<Text style={statusStyle}>
						{statusText}
					</Text>
					<ProgressBarLinear
						progress={Math.max(progressValue / 100, 0)}
						height={4}
						width={progressWidth}
						borderWidth={0}
						borderColor="transparent"
						unfilledColor={Theme.Core.inactiveSwitchBackground}
						style={progressBarStyle}/>
				</View>
			}/>
		);
	});

	const Info = (info && info.length > 0) ? info.map((text: string, i: number): Object => {
		return (
			<InfoBlock
				key={i}
				text={text}
				appLayout={appLayout}
				infoContainer={infoContainer}
				textStyle={infoTextStyle}/>
		);
	})
		:
		undefined;

	return (
		<View style={{
			flex: 1,
		}}>
			<ScrollView style={{
				flex: 1,
			}}
			contentContainerStyle={containerStyle}>
				{!!Descriptions && Descriptions}
				{!!Info && Info}
			</ScrollView>
			<FloatingButton
				onPress={this.onNext}
				iconName={'checkmark'}
				iconStyle={iconStyle}/>
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
		rowTextColor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSizeText = deviceWidth * 0.035;
	const fontSizeStatus = deviceWidth * 0.03;

	return {
		padding,
		progressWidth: width - (padding * 4),
		containerStyle: {
			flexGrow: 1,
			paddingVertical: padding,
		},
		buttonStyle: {
			marginTop: padding,
		},
		infoContainer: {
			flex: 0,
			marginHorizontal: padding,
			marginBottom: padding * 5,
		},
		infoTextStyle: {
			color: rowTextColor,
			fontSize: fontSizeText,
		},
		iconStyle: {
			color: '#fff',
		},
		progressBarStyle: {
			marginBottom: padding,
		},
		progressCover: {

		},
		statusStyle: {
			fontSize: fontSizeStatus,
			color: rowTextColor,
			marginBottom: 4,
		},
	};
}
}

export default Include433;

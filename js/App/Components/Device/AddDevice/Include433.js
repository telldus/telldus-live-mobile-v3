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
	InfoBlock,
	FullPageActivityIndicator,
	ProgressBarLinear,
	Text,
	Throbber,
} from '../../../../BaseComponents';
import {
	NumberedBlock,
} from './SubViews';
import {
	LearnButton,
} from '../../TabViews/SubViews';

import {
	get433DevicePostConfigScreenOptions,
	getTelldusLearnImage,
} from '../../../Lib/DeviceUtils';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	addDevice: Object,
	showLeftIcon: boolean,

	onDidMount: (string, string, ?Object) => void,
	navigation: Object,
	actions: Object,
	intl: Object,
	processWebsocketMessage: (string, string, string, Object) => any,
	toggleLeftIconVisibilty: (boolean) => void,
};

type State = {
	isLoading: boolean,
};

class Include433 extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	this.state = {
		isLoading: false,
	};

	const { navigation, intl, actions } = props;
	const gateway = navigation.getParam('gateway', {});
	const { id } = gateway;
	this.gatewayId = id.toString();

	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
		postConfig,
	} = deviceInfo;
	this.PostConfigScreenOptions = get433DevicePostConfigScreenOptions(postConfig, intl.formatMessage);

	let deviceName = navigation.getParam('deviceName', '');
	this.deleteSocketAndTimer = actions.initiateAdd433MHz(id.toString(), {
		...deviceInfo,
		deviceName,
	}, intl.formatMessage);
}

componentDidMount() {
	const {
		onDidMount,
		intl,
	} = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.connect), formatMessage(i18n.connectYourDevice));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'Include433';
}

componentDidUpdate(prevProps: Object, prevState: Object) {
	const {
		toggleLeftIconVisibilty,
		addDevice,
		showLeftIcon,
		navigation,
	} = this.props;
	const { addDevice433 = {}} = addDevice;
	const {
		deviceId,
		message,
		isLoading,
		status: statusC,
	} = addDevice433;

	if (!deviceId && !isLoading && message && !showLeftIcon) {
		toggleLeftIconVisibilty(true);
	}

	const deviceInfo = navigation.getParam('deviceInfo', '');
	const {
		postConfig,
	} = deviceInfo;
	if (deviceId && !isLoading && !postConfig) {
		this.onNext(false);
	}

	const {
		progress,
	} = this.PostConfigScreenOptions;
	if (progress) {
		const scanComplete = statusC === 'done'; // TODO: Include statusC === 'receiving' if required.
		if (showLeftIcon && statusC && (scanComplete)) {
			toggleLeftIconVisibilty(false);
		}
		if (!showLeftIcon && (!statusC || !scanComplete)) {
			toggleLeftIconVisibilty(true);
		}
		if (statusC && scanComplete) {
			this.onNext(false);
		}
	}
}

componentWillUnmount() {
	if (this.deleteSocketAndTimer) {
		this.deleteSocketAndTimer();
	}
}

onNext = async (handleLoading?: boolean = true) => {
	if (handleLoading) {
		this.setState({
			isLoading: true,
		});
	}

	const { navigation, addDevice, actions } = this.props;

	try {
		await actions.getDevices();
	// eslint-disable-next-line no-empty
	} catch (e) {
	} finally {
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

		if (handleLoading) {
			this.setState({
				isLoading: false,
			});
		}
		const gateway = navigation.getParam('gateway', {});
		navigation.navigate({
			routeName: 'Devices',
			key: 'Devices',
			params: {
				gateway,
				newDevices: rowData,
			},
		});
	}
}

render(): Object {
	const { intl, appLayout, navigation, addDevice = {} } = this.props;

	const { addDevice433 = {}} = addDevice;
	const {
		deviceId,
		isLoading = true,
		progressValue = 0,
		message,
		status,
	} = addDevice433;

	const {
		containerStyle,
		buttonStyle,
		infoContainer,
		infoTextStyle,
		padding,
		progressWidth,
		progressBarStyle,
		progressCover,
		statusStyle,
		infoIconErrorStyle,
	} = this.getStyles();

	if (isLoading) {
		return <FullPageActivityIndicator/>;
	}
	if (!isLoading && !deviceId && message) {
		return <InfoBlock
			text={message}
			appLayout={appLayout}
			infoContainer={[infoContainer, {
				marginVertical: padding,
			}]}
			infoIconStyle={infoIconErrorStyle}
			textStyle={infoTextStyle}/>;
	}

	const errorInfo = message && (status === 'socket-failed' || status === 'socket-retry');

	const deviceInfo = navigation.getParam('deviceInfo', '');
	const deviceBrand = navigation.getParam('deviceBrand', '');
	const {
		model,
	} = deviceInfo;
	const {
		descriptions,
		info,
		learnButtonIndex,
		progress,
		image,
		imageIndex,
	} = this.PostConfigScreenOptions;

	if (!descriptions) {
		return <FullPageActivityIndicator/>;
	}

	let img = image;
	if (deviceBrand === 'Telldus') {
		img = getTelldusLearnImage(model);
	}

	const statusText = `(${progressValue}% ${intl.formatMessage(i18n.done).toLowerCase()})`;
	const isSocketReconnecting = progress && status === 'socket-retry';

	const Descriptions = descriptions.map((text: string, i: number): Object => {
		return (<NumberedBlock
			key={i}
			number={`${i + 1}.`}
			text={text}
			img={((i === imageIndex) && img) ? img : undefined}
			rightBlockIItemOne={
				i === learnButtonIndex ?
					<LearnButton
						id={deviceId}
						style={buttonStyle}/>
					: undefined
			}
			progress={(progress && (i === (descriptions.length - 1))) &&
				<View style={progressCover}>
					{isSocketReconnecting
						?
						<View style={{
							flexDirection: 'row',
						}}>
							<Throbber
								throbberStyle={statusStyle}
								throbberContainerStyle={{
									position: 'relative',
								}}/>
							<Text style={[statusStyle, {
								marginLeft: 5,
							}]}>
								{'Reconnecting...'}
							</Text>
						</View>
						:
						<Text style={statusStyle}>
							{statusText}
						</Text>
					}
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
				{!!errorInfo && (
					<InfoBlock
						key={'errorInfo'}
						text={message}
						appLayout={appLayout}
						infoContainer={infoContainer}
						infoIconStyle={infoIconErrorStyle}
						textStyle={infoTextStyle}/>
				)}
			</ScrollView>
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
		red,
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
			marginBottom: padding / 2,
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
		infoIconErrorStyle: {
			color: red,
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

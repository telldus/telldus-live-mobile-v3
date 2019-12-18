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
	ScrollView,
} from 'react-native';

import {
	View,
	FloatingButton,
	InfoBlock,
	FullPageActivityIndicator,
} from '../../../../BaseComponents';
import {
	NumberedBlock,
} from './SubViews';
import {
	LearnButton,
} from '../../TabViews/SubViews';

import {
	prepareDeviceParameters,
} from '../../../Lib/DeviceUtils';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	addDevice: Object,

	onDidMount: (string, string, ?Object) => void,
	navigation: Object,
	actions: Object,
	intl: Object,
	processWebsocketMessage: (string, string, string, Object) => any,
};

type State = {
	deviceId: string | null,
	isLoading: boolean,
};

class Include433 extends View<Props, State> {
props: Props;
state: State;

constructor(props: Props) {
	super(props);

	const { navigation } = this.props;
	const gateway = navigation.getParam('gateway', {});
	this.gatewayId = gateway.id;

	this.state = {
		deviceId: null,
		isLoading: true,
	};
}

componentDidMount() {
	const {
		onDidMount,
		intl,
		navigation,
		actions,
	} = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.connect), formatMessage(i18n.connectYourDevice));

	const widgetParams433Device = navigation.getParam('widgetParams433Device', {});
	const deviceInfo = navigation.getParam('deviceInfo', {});
	const deviceName = navigation.getParam('deviceName', '');
	const { protocol, model, widget } = deviceInfo;

	const parameters = prepareDeviceParameters(parseInt(widget, 10), widgetParams433Device);

	actions.addDeviceAction(this.gatewayId, deviceName, protocol, model).then((res: Object) => {
		if (res.id) {
			this.setState({
				deviceId: res.id,
				isLoading: false,
			});
			actions.getDevices();
		} else {
			this.setState({
				isLoading: false,
			});
		}
	}).catch(() => {
		this.setState({
			isLoading: false,
		});
	});
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'Include433';
}

onNext = () => {
	const { navigation } = this.props;
	const {
		deviceId,
	} = this.state;
	const deviceName = navigation.getParam('deviceName', '');
	// $FlowFixMe
	let rowData = {[deviceId]: {
		id: deviceId,
		name: deviceName,
		index: 0,
		mainNode: true,
	}};
	navigation.navigate({
		routeName: 'Devices',
		key: 'Devices',
		params: {
			newDevices: rowData,
		},
	});
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { formatMessage } = intl;

	const {
		deviceId,
		isLoading,
	} = this.state;

	const {
		containerStyle,
		buttonStyle,
		infoContainer,
		infoTextStyle,
		padding,
		iconStyle,
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

	const uri = {uri: 'img_zwave_include'};

	return (
		<View style={{
			flex: 1,
		}}>
			<ScrollView style={{
				flex: 1,
			}}
			contentContainerStyle={containerStyle}>
				<NumberedBlock
					number={'1.'}
					text={`${formatMessage(i18n.add433DInfoOne)}.`}/>
				<NumberedBlock
					number={'2.'}
					text={`${formatMessage(i18n.add433DInfoTwo)}.`}/>
				<NumberedBlock
					number={'3.'}
					text={`${formatMessage(i18n.add433DInfoThree)}. (${formatMessage(i18n.add433DInfoFour)}.)`}
					img={uri}
					rightBlockIItemOne={
						<LearnButton
							id={deviceId}
							style={buttonStyle}/>
					}/>
				<NumberedBlock
					number={'4.'}
					text={`${formatMessage(i18n.add433DInfoFive)}.`}/>
				<InfoBlock
					text={`${formatMessage(i18n.add433DInfoOnFail)}.`}
					appLayout={appLayout}
					infoContainer={infoContainer}
					textStyle={infoTextStyle}/>
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

	return {
		padding,
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
	};
}
}

export default Include433;

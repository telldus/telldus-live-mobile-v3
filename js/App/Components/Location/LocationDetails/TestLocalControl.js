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
import React, { Fragment } from 'react';
import {
	Modal,
	ScrollView,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import {
	View,
	SafeAreaView,
	NavigationHeaderPoster,
	LocationDetails,
	TouchableButton,
} from '../../../../BaseComponents';
import { TestRow } from './SubViews';

import {
	autoDetectLocalTellStick,
} from '../../../Actions/Gateways';

import {
	capitalize,
	getLocationImageUrl,
	getRSAKey,
	hasTokenExpired,
	getTokenForLocalControl,
} from '../../../Lib';

import Theme from '../../../Theme';

type Props = {
	show: boolean,
	appLayout: Object,
	currentScreen: string,
	location: Object,

	navigation: Object,
	intl: Object,
};

type State = {
	currentRunningTest: Object,
};

class TestLocalControl extends View<Props, State> {
props: Props;
state: State = {
	currentRunningTest: {

	},
};

onPressReRunTest: () => void;
onPressRequestSupport: () => void;

autoDetectLocalTellStickTS: () => void;
getTokenForLocalControlTS: () => void;
getRSAKeyTS: () => void;
supportLocalTS: () => void;

constructor(props: Props) {
	super(props);

	this.TESTS_TO_RUN = [
		{
			h1: 'Local IP',
			h2: 'Checking TellStick local IP address',
			icon: 'localcontrol',
			status: null,
		},
		{
			h1: 'UUID',
			h2: 'Checking for correct UUID',
			icon: 'user',
			status: null,
		},
		{
			h1: 'Token',
			h2: 'Checking for valid token',
			icon: 'locked',
			status: null,
		},
		{
			h1: 'Encrypt Keys',
			h2: 'Checking encrypt/decrypt keys',
			icon: 'keyhole',
			status: null,
		},
		{
			h1: 'Local Support',
			h2: 'Checking gateway local support',
			icon: 'location',
			status: null,
		},
	];

	this.onPressRequestSupport = this.onPressRequestSupport.bind(this);
	this.onPressReRunTest = this.onPressReRunTest.bind(this);

	this.autoDetectLocalTellStickTS = this.autoDetectLocalTellStickTS.bind(this);
	this.getTokenForLocalControlTS = this.getTokenForLocalControlTS.bind(this);
	this.getRSAKeyTS = this.getRSAKeyTS.bind(this);
	this.supportLocalTS = this.supportLocalTS.bind(this);

	this.startTimeout = null;
	this.testValidateTimeout = null;
	this.retryTSTimeout = null;
	this.hasRSAKeys = false;
	getRSAKey(false, ({ pemPvt, pemPub }: Object): any => {
		if (pemPvt && pemPub) {
			this.hasRSAKeys = true;
		} else {
			this.hasRSAKeys = false;
		}
	});
}

componentDidMount() {
	if (this.props.show) {
		this.startTimeout = setTimeout(() => {
			this.validateAndRunTests();
		}, 50);
	}
}

componentWillUnmount() {
	clearTimeout(this.startTimeout);
	clearTimeout(this.testValidateTimeout);
	clearTimeout(this.retryTSTimeout);
}

componentDidUpdate(prevProps: Object, prevState: Object) {
	if (this.props.show && !this.startTimeout) {
		this.startTimeout = setTimeout(() => {
			this.validateAndRunTests();
		}, 50);
	}
}

validateAndRunTests() {
	const { index, flag } = this.checkForNext();
	if (index <= 4 && flag) {
		let { status, timeout, troubleShootCallback } = this.validateTest(index);
		this.updateTest(index, 'running', timeout, () => {
			if (status) {
				this.updateTest(index, 'ok', 0, () => {
					this.validateAndRunTests();
				});
			} else if (troubleShootCallback) {
				troubleShootCallback();
			} else {
				this.updateTest(index, 'fail', 1000, () => {
					this.validateAndRunTests();
				});
			}
		});
	}
}

autoDetectLocalTellStickTS() {
	this.props.dispatch(autoDetectLocalTellStick());
	this.retryTSTimeout = setTimeout(() => {
		let { status } = this.validateTest(0);
		if (status) {
			this.updateTest(0, 'ok', 0, () => {
				this.validateAndRunTests();
			});
		} else {
			this.updateTest(0, 'fail', 0, () => {
				this.validateAndRunTests();
			});
		}
	}, 5000);
}

getTokenForLocalControlTS() {
	const { location, dispatch } = this.props;
	dispatch(getTokenForLocalControl(location.id));
	this.retryTSTimeout = setTimeout(() => {
		let { status } = this.validateTest(2);
		if (status) {
			this.updateTest(2, 'ok', 0, () => {
				this.validateAndRunTests();
			});
		} else {
			this.updateTest(2, 'fail', 0, () => {
				this.validateAndRunTests();
			});
		}
	}, 5000);
}

getRSAKeyTS() {
	getRSAKey(true, ({ pemPvt, pemPub }: Object): any => {
		if (pemPvt && pemPub) {
			this.updateTest(3, 'ok', 0, () => {
				this.validateAndRunTests();
			});
		} else {
			this.updateTest(3, 'fail', 0, () => {
				this.validateAndRunTests();
			});
		}
	});
}

supportLocalTS() {
	const { localKey = {} } = this.props.location;
	const { address, key, ttl } = localKey;
	const tokenExpired = hasTokenExpired(ttl);
	if (address && key && ttl && !tokenExpired) {
		// Very Unlikely But still
		// If All other params are available and only supportLocal is false.
		// Set supportLocal as true here
	} else {
		this.updateTest(4, 'fail');
	}
}

validateTest(i: number): boolean {
	const { localKey = {} } = this.props.location;
	const { address, key, ttl, supportLocal } = localKey;

	const respSuccess = {
		status: true,
		timeout: 1000,
	};

	switch (i) {
		case 0:
			if (address) {
				return respSuccess;
			}
			return {
				status: false,
				troubleShootCallback: this.autoDetectLocalTellStickTS,
				timeout: 0,
			};
		case 1:
			const deviceUniqueID = DeviceInfo.getUniqueID();
			if (deviceUniqueID) {
				return respSuccess;
			}
			return {
				status: false,
				timeout: 0,
			};
		case 2:
			const tokenExpired = hasTokenExpired(ttl);
			if (key && !tokenExpired) {
				return respSuccess;
			}
			return {
				status: false,
				troubleShootCallback: this.getTokenForLocalControlTS,
				timeout: 0,
			};
		case 3:
			if (this.hasRSAKeys) {
				return respSuccess;
			}
			return {
				status: false,
				troubleShootCallback: this.getRSAKeyTS,
				timeout: 0,
			};
		case 4:
			if (supportLocal) {
				return respSuccess;
			}
			return {
				status: false,
				troubleShootCallback: this.supportLocalTS,
				timeout: 0,
			};
		default:
			return {
				status: false,
				timeout: 0,
			};
	}
}

updateTest(index: number, status: string, timeout: number = 0, callback?: Function) {
	this.setState({
		currentRunningTest: {
			index,
			status,
		},
	}, () => {
		if (callback) {
			this.testValidateTimeout = setTimeout(() => {
				callback();
			}, timeout);
		}
	});
}

checkForNext(): Object {
	const { currentRunningTest } = this.state;
	const { index, status } = currentRunningTest;

	if (!index && !status) {
		return {
			index: 0,
			flag: 1,
		};
	} else if (status === 'ok' || status === 'fail') {
		return {
			index: index + 1,
			flag: 1,
		};
	}
	return {
		index,
		flag: 0,
	};
}

onPressReRunTest() {
	this.TESTS_TO_RUN.map((test: Object) => {
		test.status = null;
	});
	this.updateTest(undefined, undefined, 0, () => {
		this.validateAndRunTests();
	});
}

onPressRequestSupport() {

}

renderTestRow(testData: Object, index: number): Object {
	return (
		<TestRow
			{...testData}
			index={index}
			key={index}
			appLayout={this.props.appLayout}/>
	);
}

render(): Object {

	const {
		show,
		navigation,
		appLayout,
		intl,
		location,
	} = this.props;
	const { currentRunningTest } = this.state;
	const { index, status } = currentRunningTest;

	const posterData = {
		navigation,
		appLayout,
		intl,
		align: 'right',
		leftIcon: 'close',
		h1: capitalize('Local control'),
		h2: 'Troubleshooting wizard',
	};

	const {
		name,
		type,
	} = location;
	const locationImageUrl = getLocationImageUrl(type);
	const locationData = {
		image: locationImageUrl,
		H1: name,
		H2: type,
	};

	const {
		LocationDetail,
		testsCover,
		button,
	} = this.getStyles(appLayout);

	const tests = this.TESTS_TO_RUN.map((test: Object, i: number): Object => {
		if (i === index) {
			test.status = status;
		}
		if (test.status === 'fail') {
			test = { ...test, h2: 'Failed'};
		}
		if (test.status === 'ok') {
			test = { ...test, h2: 'OK'};
		}
		return this.renderTestRow(test, i);
	});

	const showButtons = (index === (this.TESTS_TO_RUN.length - 1)) && (status === 'ok' || status === 'fail');

	return (
		<Modal
			visible={show}
			transparent={false}
			animationType={'slide'}
			presentationStyle={'fullScreen'}
			onRequestClose={this.noOP}
			supportedOrientations={['portrait', 'landscape']}>
			<SafeAreaView backgroundColor={Theme.Core.appBackground}>
				<NavigationHeaderPoster {...posterData}/>
				<ScrollView>
					<LocationDetails {...locationData} isStatic={true} style={LocationDetail}/>
					<View style={testsCover}>
						{tests}
					</View>
					{showButtons &&
						<Fragment>
							<TouchableButton text={'Run tests again'} style={button} onPress={this.onPressReRunTest}/>
							<TouchableButton text={'Request support'} style={button} onPress={this.onPressRequestSupport}/>
						</Fragment>
					}
				</ScrollView>
			</SafeAreaView>
		</Modal>
	);
}

getStyles(appLayout: Object): Object {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { shadow, paddingFactor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		LocationDetail: {
			flex: 0,
			marginTop: padding,
			marginHorizontal: padding,
			padding: 10,
		},
		testsCover: {
			flex: 0,
			flexDirection: 'column',
			marginHorizontal: padding,
			marginTop: padding / 2,
			marginBottom: padding,
			padding: 10,
			backgroundColor: '#fff',
			...shadow,

		},
		button: {
			marginTop: padding / 2,
			marginBottom: padding,
			minWidth: Math.floor(deviceWidth * 0.6),
		},
	};
}

noOP() {
}
}

export default TestLocalControl;

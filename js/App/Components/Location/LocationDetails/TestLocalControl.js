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
import DeviceInfo from 'react-native-device-info';

import {
	View,
	LocationDetails,
	TouchableButton,
} from '../../../../BaseComponents';
import {
	TestRow,
} from './SubViews';

import {
	capitalize,
	getLocationImageUrl,
	getRSAKey,
	hasTokenExpired,
} from '../../../Lib';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	currentScreen: string,
	location: Object,

	onDidMount: Function,
	intl: Object,
	actions: Object,
	navigation: Object,
	toggleDialogueBox: (Object) => void,
};

type State = {
	currentRunningTest: Object,
	showSupportScreen: boolean,
	testCount: number,
};

class TestLocalControl extends View<Props, State> {
props: Props;
state: State = {
	currentRunningTest: {
	},
	showSupportScreen: false,
	testCount: 1,
};

onPressReRunTest: () => void;
onPressRequestSupport: () => void;

autoDetectLocalTellStickTS: () => void;
getTokenForLocalControlTS: () => void;
getRSAKeyTS: () => void;
supportLocalTS: () => void;

constructor(props: Props) {
	super(props);

	const { formatMessage } = this.props.intl;

	this.TESTS_TO_RUN = [
		{
			h1: formatMessage(i18n.ipLocal),
			h2: formatMessage(i18n.labelTestIPH2),
			icon: 'localcontrol',
			status: null,
			name: 'Local IP',
		},
		{
			h1: 'UUID',
			h2: formatMessage(i18n.labelTestUUIDH2),
			icon: 'user',
			status: null,
			name: 'UUID',
		},
		{
			h1: formatMessage(i18n.labelToken),
			h2: formatMessage(i18n.labelTestTokenH2),
			icon: 'locked',
			status: null,
			name: 'Token',
		},
		{
			h1: formatMessage(i18n.labelEncryptKeys),
			h2: formatMessage(i18n.labelTestKeysH2),
			icon: 'keyhole',
			status: null,
			name: 'Encrypt Keys',
		},
		{
			h1: formatMessage(i18n.labelLocalSupport),
			h2: formatMessage(i18n.labelTestLocalSupportH2),
			icon: 'location',
			status: null,
			name: 'Support Local',
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

	this.h1 = capitalize(formatMessage(i18n.labelLocalControl));
	this.h2 = formatMessage(i18n.labelTroubleshootingWizard);
}

componentDidMount() {
	const { currentScreen, onDidMount } = this.props;
	if (currentScreen === 'TestLocalControl') {
		this.startTimeout = setTimeout(() => {
			this.validateAndRunTests();
		}, 50);
	}

	onDidMount(this.h1, this.h2);
}

componentWillUnmount() {
	clearTimeout(this.startTimeout);
	clearTimeout(this.testValidateTimeout);
	clearTimeout(this.retryTSTimeout);
}

componentDidUpdate(prevProps: Object, prevState: Object) {
	const { currentScreen } = this.props;
	if (currentScreen === 'TestLocalControl' && !this.startTimeout) {
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
	this.props.actions.autoDetectLocalTellStick();
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
	const { actions, location } = this.props;
	actions.getTokenForLocalControl(location.id);
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
	const { location, actions } = this.props;
	const { localKey = {}, id } = location;
	const { address, key, ttl } = localKey;
	const tokenExpired = hasTokenExpired(ttl);
	if (address && key && ttl && !tokenExpired) {
		actions.toggleSupportLocal(id, true);
		this.retryTSTimeout = setTimeout(() => {
			let { status } = this.validateTest(4);
			if (status) {
				this.updateTest(4, 'ok', 0, () => {
					this.validateAndRunTests();
				});
			} else {
				this.updateTest(4, 'fail', 0, () => {
					this.validateAndRunTests();
				});
			}
		}, 2000);
	} else {
		this.updateTest(4, 'fail', 0, () => {});
	}
}

validateTest(i: number): Object {
	const { location } = this.props;
	const { localKey = {} } = location;
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

updateTest(index?: number, status?: string, timeout: number = 0, callback: Function) {
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
	this.setState({
		testCount: this.state.testCount + 1,
	}, () => {
		this.updateTest(undefined, undefined, 0, () => {
			this.validateAndRunTests();
		});
	});
}

onPressRequestSupport() {
	const { location, navigation } = this.props;
	const { testCount } = this.state;

	let failedTests = '';
	this.TESTS_TO_RUN.map((test: Object, index: number) => {
		let { status } = this.validateTest(index);
		if (!status) {
			failedTests = failedTests ? `${failedTests}, ${test.name}` : test.name;
		}
	});
	navigation.navigate({
		routeName: 'RequestSupport',
		key: 'RequestSupport',
		params: {
			location,
			failedTests: failedTests ? `${failedTests}` : 'null',
			testCount,
		},
	});
}

renderTestRow(testData: Object, index: number): Object {
	const { appLayout } = this.props;
	return (
		<TestRow
			{...testData}
			index={index}
			key={index}
			appLayout={appLayout}/>
	);
}

render(): Object | null {

	const {
		appLayout,
		location,
		intl,
	} = this.props;
	if (!location.id) {
		return null;
	}
	const { currentRunningTest } = this.state;
	const { index, status } = currentRunningTest;

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
			test = { ...test, h2: intl.formatMessage(i18n.failed)};
		}
		if (test.status === 'ok') {
			test = { ...test, h2: intl.formatMessage(i18n.defaultPositiveText)};
		}
		return this.renderTestRow(test, i);
	});

	const showButtons = (index === (this.TESTS_TO_RUN.length - 1)) && (status === 'ok' || status === 'fail');

	return (
			<>
				<LocationDetails {...locationData} isStatic={true} style={LocationDetail}/>
				<View style={testsCover}>
					{tests}
				</View>
				{showButtons &&
					<>
					<TouchableButton text={i18n.labelButtonRunTestsAgain} style={button} onPress={this.onPressReRunTest}/>
					<TouchableButton text={i18n.labelButtonRequestSupport} style={button} onPress={this.onPressRequestSupport}/>
					</>
				}
			</>
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
			padding: 10,
		},
		testsCover: {
			flex: 0,
			flexDirection: 'column',
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

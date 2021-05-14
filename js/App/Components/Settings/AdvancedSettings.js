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

import React, {
	memo,
	useCallback,
	useState,
} from 'react';
import {
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from 'react-native';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import { useIntl } from 'react-intl';
import BackgroundGeolocation from 'react-native-background-geolocation';

import {
	View,
	NavigationHeader,
	PosterWithText,
	SettingsRow,
	Text,
} from '../../../BaseComponents';
import {
	SelectThemeSetDD,
} from './SubViews';

import {
	updateGeoFenceConfig,
	setupGeoFence,
} from '../../Actions/GeoFence';
import {
	useDialogueBox,
} from '../../Hooks/Dialoguebox';

import Theme from '../../Theme';

type Props = {
	navigation: Object,
};

const AdvancedSettings = memo<Object>((props: Props): Object => {

	const {
		navigation,
	} = props;

	const intl = useIntl();

	const dispatch = useDispatch();
	const {
		toggleDialogueBoxState,
	} = useDialogueBox();

	const { layout } = useSelector((state: Object): Object => state.app);

	const { config = {} } = useSelector((state: Object): Object => state.geoFence) || {};
	const {
		distanceFilter = 5,
		stopTimeout = 5,
		stopOnTerminate = false,
		startOnBoot = true,
		enableHeadless = true,
		geofenceModeHighAccuracy = true,
		preventSuspend = false,
		showNotificationOnActionFail = true,
		geofenceInitialTriggerEntry = false,
		locationUpdateInterval = 1000,
		geofenceProximityRadius = 400,
		debug = false,
	} = config;

	const [ inLineEditActiveDF, setInLineEditActiveDF ] = useState();
	const [ inLineEditActiveST, setInLineEditActiveST ] = useState();
	const [ inLineEditActiveUI, setInLineEditActiveUI ] = useState();
	const [ inLineEditActiveFPR, setInLineEditActiveFPR ] = useState();
	const [ inLineEditActiveEmail, setInLineEditActiveEmail ] = useState();

	const [ df, setDf ] = useState(distanceFilter);
	const [ st, setSt ] = useState(stopTimeout);
	const [ ui, setUi ] = useState(locationUpdateInterval);
	const [ fpr, setFpr ] = useState(geofenceProximityRadius);
	const [ email, setEmail ] = useState('');

	const {
		itemsContainer,
		headerMainStyle,
		labelTextStyle,
		touchableStyle,
		contentCoverStyle,
	} = getStyles(layout);

	const onUpdateGeoFenceConfig = useCallback((conf: Object) => {
		dispatch(updateGeoFenceConfig({
			...config,
			...conf,
		}));
		dispatch(setupGeoFence(intl));
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [config]);

	const showOnGeoFenceLog = useCallback(() => {
		navigation.navigate('GeoFenceEventsLogScreen');
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onPressEditDF = useCallback(() => {
		if (inLineEditActiveDF) {
			if (!df) {
				return;
			}
			const _df = parseInt(df, 10);
			if (isNaN(_df)) {
				return;
			}
			onUpdateGeoFenceConfig({
				distanceFilter: _df,
			});
		}
		setInLineEditActiveDF(!inLineEditActiveDF);
	}, [
		onUpdateGeoFenceConfig,
		inLineEditActiveDF,
		df,
	]);

	const onPressEditST = useCallback(() => {
		if (inLineEditActiveST) {
			if (!st) {
				return;
			}
			const _st = parseInt(st, 10);
			if (isNaN(_st)) {
				return;
			}
			onUpdateGeoFenceConfig({
				stopTimeout: _st,
			});
		}
		setInLineEditActiveST(!inLineEditActiveST);
	}, [
		onUpdateGeoFenceConfig,
		inLineEditActiveST,
		st,
	]);

	const onPressEditUI = useCallback(() => {
		if (inLineEditActiveUI) {
			if (!ui) {
				return;
			}
			const _ui = parseInt(ui, 10);
			if (isNaN(_ui)) {
				return;
			}
			onUpdateGeoFenceConfig({
				locationUpdateInterval: _ui,
			});
		}
		setInLineEditActiveUI(!inLineEditActiveUI);
	}, [
		onUpdateGeoFenceConfig,
		inLineEditActiveUI,
		ui,
	]);

	const onPressEditFPR = useCallback(() => {
		if (inLineEditActiveFPR) {
			if (!fpr) {
				return;
			}
			const _fpr = parseInt(fpr, 10);
			if (isNaN(_fpr)) {
				return;
			}
			onUpdateGeoFenceConfig({
				geofenceProximityRadius: _fpr,
			});
		}
		setInLineEditActiveFPR(!inLineEditActiveFPR);
	}, [
		onUpdateGeoFenceConfig,
		inLineEditActiveFPR,
		fpr,
	]);

	const onPressEditEmail = useCallback(() => {
		if (inLineEditActiveEmail) {
			if (!email) {
				return;
			}
			BackgroundGeolocation.logger.emailLog(email).then((success: Object) => {
				toggleDialogueBoxState({
					show: true,
					text: JSON.stringify(success),
					showHeader: true,
					imageHeader: true,
					showPositive: true,
				});
			  }).catch((error: Object) => {
				toggleDialogueBoxState({
					show: true,
					text: error.message || JSON.stringify(error),
					showHeader: true,
					imageHeader: true,
					showPositive: true,
				});
			  });
		}
		setInLineEditActiveEmail(!inLineEditActiveEmail);
	}, [email, inLineEditActiveEmail, toggleDialogueBoxState]);

	const onChangeTextDF = useCallback((value: string) => {
		setDf(value);
	}, []);

	const onChangeTextST = useCallback((value: string) => {
		setSt(value);
	}, []);

	const onChangeTextUI = useCallback((value: string) => {
		setUi(value);
	}, []);

	const onChangeTextFPR = useCallback((value: string) => {
		setFpr(value);
	}, []);

	const onValueChangeSOT = useCallback((value: boolean) => {
		onUpdateGeoFenceConfig({
			stopOnTerminate: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onValueChangeSOB = useCallback((value: string) => {
		onUpdateGeoFenceConfig({
			startOnBoot: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onValueChangeEH = useCallback((value: string) => {
		onUpdateGeoFenceConfig({
			enableHeadless: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onValueChangeHA = useCallback((value: string) => {
		onUpdateGeoFenceConfig({
			geofenceModeHighAccuracy: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onValueChangeGITE = useCallback((value: string) => {
		onUpdateGeoFenceConfig({
			geofenceInitialTriggerEntry: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onValueChangePS = useCallback((value: string) => {
		onUpdateGeoFenceConfig({
			preventSuspend: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onValueChangeShowNotif = useCallback((value: boolean) => {
		onUpdateGeoFenceConfig({
			showNotificationOnActionFail: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onValueChangeDebug = useCallback((value: string) => {
		onUpdateGeoFenceConfig({
			debug: value,
		});
	}, [onUpdateGeoFenceConfig]);

	const onChangeTextEmail = useCallback((value: string) => {
		setEmail(value);
	}, []);

	return (
		<View
			level={3}
			style={{
				flex: 1,
			}}>
			<NavigationHeader
				showLeftIcon={true}
				leftIcon={'close'}
				navigation={navigation}/>
			<KeyboardAvoidingView
				behavior="padding"
				style={{flex: 1}}
				contentContainerStyle={{ justifyContent: 'center'}}
				enabled
				keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
				<ScrollView
					style={{flex: 1}}
					contentContainerStyle={{
						flexGrow: 1,
						alignItems: 'stretch',
					}}
					keyboardShouldPersistTaps={'always'}>
					<PosterWithText
						appLayout={layout}
						align={'center'}
						h2={'Advanced settings'}
						navigation={navigation}/>
					<View style={itemsContainer}>
						<Text
							level={2}
							style={headerMainStyle}>
							General Settings
						</Text>
						<SelectThemeSetDD/>
						<Text
							level={2}
							style={headerMainStyle}>
							GeoFence
						</Text>
						<SettingsRow
							label={'Distance Filter(number in meters): '}
							value={df}
							iconValueRight={inLineEditActiveDF ? 'done' : 'edit'}
							inLineEditActive={inLineEditActiveDF}
							onPressIconValueRight={onPressEditDF}
							onChangeText={onChangeTextDF}
							onSubmitEditing={onPressEditDF}
							appLayout={layout}
							intl={intl}
							type={'text'}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Stop timeout(number in minutes): '}
							value={st}
							iconValueRight={inLineEditActiveST ? 'done' : 'edit'}
							inLineEditActive={inLineEditActiveST}
							onPressIconValueRight={onPressEditST}
							onChangeText={onChangeTextST}
							onSubmitEditing={onPressEditST}
							appLayout={layout}
							intl={intl}
							type={'text'}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Update interval(milli secs)(Distance Filter should be 0): '}
							value={ui}
							iconValueRight={inLineEditActiveUI ? 'done' : 'edit'}
							inLineEditActive={inLineEditActiveUI}
							onPressIconValueRight={onPressEditUI}
							onChangeText={onChangeTextUI}
							onSubmitEditing={onPressEditUI}
							appLayout={layout}
							intl={intl}
							type={'text'}
							labelTextStyle={labelTextStyle}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Fence proximity radius(in meters): '}
							value={fpr}
							iconValueRight={inLineEditActiveFPR ? 'done' : 'edit'}
							inLineEditActive={inLineEditActiveFPR}
							onPressIconValueRight={onPressEditFPR}
							onChangeText={onChangeTextFPR}
							onSubmitEditing={onPressEditFPR}
							appLayout={layout}
							intl={intl}
							type={'text'}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Stop on terminate: '}
							onValueChange={onValueChangeSOT}
							value={stopOnTerminate}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Start on boot: '}
							onValueChange={onValueChangeSOB}
							value={startOnBoot}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Intial trigger ENTRY: '}
							onValueChange={onValueChangeGITE}
							value={geofenceInitialTriggerEntry}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						{Platform.OS === 'android' && <SettingsRow
							label={'Enable headless: '}
							onValueChange={onValueChangeEH}
							value={enableHeadless}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						}
						{Platform.OS === 'android' && <SettingsRow
							label={'High accuracy: \n(Slightly more battery)'}
							onValueChange={onValueChangeHA}
							value={geofenceModeHighAccuracy}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						}
						{Platform.OS === 'ios' && <SettingsRow
							label={'Prevent suspend: \n(Battery Caution!) '}
							onValueChange={onValueChangePS}
							value={preventSuspend}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						}
						<SettingsRow
							label={'Show notification when action fail: '}
							onValueChange={onValueChangeShowNotif}
							value={showNotificationOnActionFail}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Enable debug: '}
							onValueChange={onValueChangeDebug}
							value={debug}
							appLayout={layout}
							intl={intl}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'Email log:'}
							value={email}
							iconValueRight={inLineEditActiveEmail ? 'done' : 'edit'}
							inLineEditActive={inLineEditActiveEmail}
							onPressIconValueRight={onPressEditEmail}
							onChangeText={onChangeTextEmail}
							onSubmitEditing={onPressEditEmail}
							appLayout={layout}
							intl={intl}
							type={'text'}
							labelTextStyle={[labelTextStyle, {
								width: '50%',
							}]}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}
							extraData={config}/>
						<SettingsRow
							label={'View Fences Event Log'}
							onPress={showOnGeoFenceLog}
							appLayout={layout}
							intl={intl}
							type={'text'}
							labelTextStyle={labelTextStyle}
							level={18}
							touchableStyle={touchableStyle}
							style={[contentCoverStyle, {
								marginTop: 0,
							}]}/>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
});

const getStyles = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
		fontSizeFactorEight,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	const fontSize = Math.floor(deviceWidth * fontSizeFactorEight);

	return {
		itemsContainer: {
			flex: 1,
			paddingHorizontal: padding,
			paddingBottom: padding,
			paddingTop: padding * 1.5,
		},
		headerMainStyle: {
			marginBottom: 5,
			fontSize,
		},
		labelTextStyle: {
			fontSize,
			justifyContent: 'center',
			width: '80%',
		},
		touchableStyle: {
			height: fontSize * 3.1,
		},
		contentCoverStyle: {
			marginBottom: fontSize / 2,
		},
	};
};

export default (AdvancedSettings: Object);

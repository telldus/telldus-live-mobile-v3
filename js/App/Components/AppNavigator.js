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

import React, { PropTypes } from 'React';
import { connect } from 'react-redux';
import { StackNavigator } from 'react-navigation';
import Toast from 'react-native-simple-toast';
import { Platform, NativeModules, PermissionsAndroid, DeviceEventEmitter } from 'react-native';
import {
	getGateways,
	getSensors,
	getUserProfile,
	appStart,
	appState,
	syncLiveApiOnForeground,
} from 'Actions';
import { authenticateSession, connectToGateways } from 'Actions_Websockets';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import { getDevices } from 'Actions_Devices';
import { getEvents, activateEvent } from 'Actions_Events';
import { getJobs, activateJob } from 'Actions_Jobs';

import { View } from 'BaseComponents';
// import Platform from 'Platform';
import TabsView from 'TabsView';
import GeofenceNavigator from 'GeofenceNavigator';
import StatusBar from 'StatusBar';
import Orientation from 'react-native-orientation';
import { DimmerPopup } from 'TabViews_SubViews';
import GeoUtils from 'GeoUtils';
import { turnOn, turnOff, requestTurnOn, requestTurnOff, bell, up, down, stop  } from 'Actions_Devices';
import { showDimmerPopup, hideDimmerPopup, setDimmerValue, updateDimmerValue } from 'Actions_Dimmer';
import { setCurrentLocation } from 'Actions_Geofence';


import { getUserProfile as getUserProfileSelector } from '../Reducers/User';

const RouteConfigs = {
	Geofence: {
		screen: GeofenceNavigator
	},
	Tabs: {
		screen: TabsView,
	},
};

const StackNavigatorConfig = {
	initialRouteName: 'Geofence',
	navigationOptions: {
		header: null,
	},
};

const Navigator = StackNavigator(RouteConfigs, StackNavigatorConfig);

type Props = {
	dimmer: Object,
	tab: string,
	accessToken: Object,
	userProfile: Object,
	dispatch: Function,
	toastVisible: boolean,
	toastMessage: string,
};

type State = {
	specificOrientation: Object,
}

class AppNavigator extends View {

	props: Props;
	state: State;

	_updateSpecificOrientation: (Object) => void;

	constructor() {
		super();

		if (Platform.OS !== 'android') {
			const init = Orientation.getInitialOrientation();

			this.state = {
				specificOrientation: init,
			};

			Orientation.unlockAllOrientations();
			Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
		}
	}

	componentWillMount() {
		this.props.dispatch(appStart());
		this.props.dispatch(appState());
	}

	componentDidMount() {
		Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('light-content');
		if (Platform.OS === 'android' && StatusBar) {
			StatusBar.setTranslucent(true);
			StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.2)');
		}

		this.props.dispatch(getUserProfile());
		this.props.dispatch(authenticateSession());
		this.props.dispatch(connectToGateways());
		this.props.dispatch(syncLiveApiOnForeground());

		this.props.dispatch(getDevices());
		this.props.dispatch(getGateways());
		this.props.dispatch(getSensors());
		this.props.dispatch(getJobs());
		this.props.dispatch(getEvents());

		this._getCurrentLocation();

	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.toastVisible) {
			this._showToast();
		}
	}

	_getCurrentLocation() {

		var _this = this;

		console.log('location: ', this.props.fences.location);		
		if (Platform.OS === 'ios') {
			NativeModules.RNLocation.requestAlwaysAuthorization();
			NativeModules.RNLocation.startUpdatingLocation();
			NativeModules.RNLocation.setDistanceFilter(5.0);
			DeviceEventEmitter.addListener('locationUpdated', (location) => {
				const locationMe = {
					latitude: location.coords.latitude,
					longitude: location.coords.longitude
				};
				_this._checkFenceStates(locationMe);
			});
		} else if (Platform.OS === 'android') {
			PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
			.then((granted) => {
				console.log('location permission granted: ', granted);
				if(granted === PermissionsAndroid.RESULTS.GRANTED || granted === true) {
					LocationServicesDialogBox.checkLocationServicesIsEnabled({
						message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
						ok: "YES",
						cancel: "NO",
						enableHighAccuracy: true, // true => GPS AND NETWORK PROVIDER, false => ONLY GPS PROVIDER
						showDialog: true // false => Opens the Location access page directly
					}).then(function(success) {
						console.log('location service dialog box result: ', success); // success => {alreadyEnabled: false, enabled: true, status: "enabled"}
						navigator.geolocation.watchPosition((location) => {
							const locationMe = {
								latitude: location.coords.latitude,
								longitude: location.coords.longitude
							};
							_this._checkFenceStates(locationMe);
						});
					}).catch((error) => {
						console.log(error.message); // error.message => "disabled"
					});
				}
			}).catch((error) => {
				console.log('location permission error: ', error.message);
			});
		}
	}

	_checkFenceStates(locationMe) {

		console.log('---check fence states---');

		var _this = this;
		var fences = this.props.fences.fences;
		var oldLocation = this.props.fences.location;
		if(oldLocation) {
			fences.forEach(function (fence) {
				const {fromHr, fromMin, toHr, toMin} = fence;
				if(fence.isAlwaysActive || GeoUtils.isActive(fromHr, fromMin, toHr, toMin)) {
					var inFence = (GeoUtils.getDistanceFromLatLonInKm(fence.latitude, fence.longitude, locationMe.latitude, locationMe.longitude) < fence.radius);
					var wasInFence = (GeoUtils.getDistanceFromLatLonInKm(fence.latitude, fence.longitude, oldLocation.latitude, oldLocation.longitude) < fence.radius);
					console.log('Fence active: ', fence.title, inFence, wasInFence);				
					var actions = null;
					if (inFence && !wasInFence) { //arrive fence
						console.log("arrive: ", fence.title);
						actions = fence.arriving;
					} else if (!inFence && wasInFence) { //leave fence
						console.log("leave: ", fence.title);
						actions = fence.leaving;
					}
					
					if(actions) _this._updateStates(actions);
				} else {
					console.log('Fence not active right now: ', fence.title);
				}
			});
		}
		this.props.setCurrentLocation(locationMe);
	}

	_updateStates(actions) {
		const {devices, schedules, events} = actions;
		for(var deviceId in devices) {
			var deviceAction = devices[deviceId];
			var device = this.props.devices[deviceId];

			const {
				TURNON,
				TURNOFF,
				BELL,
				DIM,
				UP,
				DOWN,
				STOP,
			} = deviceAction.supportedMethods;
	
			if (BELL) {
				this.props.onBell(deviceId);
			} else if (UP || DOWN || STOP) {
				if (deviceAction.state === 'UP') {
					console.log('UP: ', device);
					this.props.onUp(deviceId);
				} else if (deviceAction.state === 'DOWN') {
					console.log('DOWN: ', device);					
					this.props.onDown(deviceId);
				} else if(deviceAction.state === 'STOP') {
					console.log('STOP: ', device);					
					this.props.onStop(deviceId);
				}
			} else if (DIM) {
				if (deviceAction.state === 'TURNON') {
					// this.props.requestTurnOn(deviceId);
					console.log('TURNON: ', device);					
					this.props.onTurnOn(deviceId, device.isInState)
				} else if (deviceAction.state === 'TURNOFF') {
					// this.props.requestTurnOff(deviceId);
					console.log('TURNOFF: ', device);					
					this.props.onTurnOff(deviceId, device.isInState);
				} else if (deviceAction.state === 'DIM') {
					console.log('DIM: ', device);					
					this.props.onDim(deviceId, deviceAction.value);
				}
			} else if (TURNON || TURNOFF) {
				if (deviceAction.state === 'TURNON') {
					// this.props.requestTurnOn(deviceId);
					console.log('TURNON: ', device);					
					this.props.onTurnOn(deviceId, device.isInState)
				} else if (deviceAction.state === 'TURNOFF') {
					// this.props.requestTurnOff(deviceId);
					console.log('TURNOFF: ', device);					
					this.props.onTurnOff(deviceId, device.isInState);
				}
			} else {
			
			}
		}

		for(var eventId in events) {
			var eventAction = events[eventId];
			console.log(`event ${eventId} set status ${eventAction.active}`);
			this.props.activateEvent(eventId, eventAction.active ? 1 : 0);
		}
	
		for(var jobId in schedules) {
			var jobAction = schedules[jobId];
			console.log(`job ${jobId} set status ${jobAction.active}`);		
			this.props.activateJob(jobId, jobAction.active ? 1 : 0);
		}
	}
	_showToast() {
		Toast.showWithGravity(this.props.toastMessage, Toast.SHORT, Toast.TOP);
		this.props.dispatch({
			type: 'GLOBAL_ERROR_HIDE',
		});
	}

	_updateSpecificOrientation = specificOrientation => {
		if (Platform.OS !== 'android') {
			this.setState({ specificOrientation });
		}
	};

	render() {
		return (
			<View>
				<Navigator />
				<DimmerPopup
					isVisible={this.props.dimmer.show}
					name={this.props.dimmer.name}
					value={this.props.dimmer.value / 255}
				/>
			</View>
		);
	}
}

AppNavigator.propTypes = {
	dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		tab: state.navigation.tab,
		accessToken: state.user.accessToken,
		userProfile: getUserProfileSelector(state),
		dimmer: state.dimmer,
		toastVisible: state.App.errorGlobalShow,
		toastMessage: state.App.errorGlobalMessage,
		devices: state.devices.byId,
		events: state.events,
		fences: state.fences
	};
}

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
		setCurrentLocation: (location) => dispatch(setCurrentLocation(location)),
		onBell: id => () => dispatch(bell(id)),
		onDimmerSlide: id => value => dispatch(setDimmerValue(id, value)),
		onDim: (id, value) => dispatch(updateDimmerValue(id, value)),
		onTurnOn: (id, isInState) => dispatch(turnOn(id, isInState)),
		onTurnOff: (id, isInState) => dispatch(turnOff(id, isInState)),
		requestTurnOn: id => dispatch(requestTurnOn(id)),
		requestTurnOff: id => dispatch(requestTurnOff(id)),
		onDown: id => () => dispatch(down(id)),
		onUp: id => () => dispatch(up(id)),
		onStop: id => () => dispatch(stop(id)),
		activateEvent: (eventId, isActive) => dispatch(activateEvent(eventId, isActive)),
		activateJob: (jobId, isActive) => dispatch(activateJob(jobId, isActive))
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AppNavigator);

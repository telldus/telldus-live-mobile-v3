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
 *
 */

// @flow

'use strict';

import React from 'react';
import { Keyboard, InteractionManager } from 'react-native';
import { intlShape } from 'react-intl';
import MapView from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import { View, FloatingButton, IconTelldus, Text } from '../../../../BaseComponents';
import Theme from '../../../Theme';

import { googleMapsAPIKey } from '../../../../Config';

import i18n from '../../../Translations/common';
import { messages } from '../Common/messages';

type Props = {
	intl: intlShape.isRequired,
	actions: Object,
	navigation: Object,
	appLayout: Object,
	screenReaderEnabled: boolean,
	currentScreen: string,
	onSubmit: (number, number) => void,
	isLoading: boolean,
	region?: {
		latitude: number,
		longitude: number,
		latitudeDelta: number,
		longitudeDelta: number,
	},
	latitude?: number,
	longitude?: number,
	latitudeDelta?: number,
	longitudeDelta?: number,
	isSearchLoading?: boolean,
};

type State = {
	isKeyboardShown: boolean,
	region: Object,
	address: string,
	coordinate: Object,
	latitudeDelta?: number,
	longitudeDelta?: number,
	isSearchLoading: boolean,
	showList: boolean,
};

type DefaultProps = {
	region: {
		latitude: number,
		longitude: number,
		latitudeDelta: number,
		longitudeDelta: number,
	},
	latitude: number,
	longitude: number,
	latitudeDelta: number,
	longitudeDelta: number,
};

class GeoPosition extends View {
	props: Props;
	state: State;

	onAddressChange: () => void;
	_refs: (Object | any) => mixed;
	onSubmit: () => void;
	onDragEnd: (Object) => void;
	onInfoPress: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

	onChooseAddress: (Object, Object) => void;
	renderLeftButton: () => Object;

	static defaultProps: DefaultProps = {
		region: {
			latitude: 55.70584,
			longitude: 13.19321,
			latitudeDelta: 0.24442,
			longitudeDelta: 0.24442,
		},
		latitude: 55.70584,
		longitude: 13.19321,
		latitudeDelta: 0.24442,
		longitudeDelta: 0.24442,
	}

	constructor(props: Props) {
		super(props);
		const { region } = props;
		const {latitude, longitude, latitudeDelta, longitudeDelta} = props;
		this.state = {
			address: '',
			isKeyboardShown: false,
			region: new MapView.AnimatedRegion(region),
			coordinate: {
				latitude,
				longitude,
			},
			latitudeDelta,
			longitudeDelta,
			isSearchLoading: false,
			showList: false,
		};

		let { formatMessage } = props.intl;

		this.label = formatMessage(messages.labelPosition);

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;

		this.onAddressChange = this.onAddressChange.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this._refs = this._refs.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);

		this.keyboardDidShow = this.keyboardDidShow.bind(this);
		this.keyboardDidHide = this.keyboardDidHide.bind(this);

		this.onChooseAddress = this.onChooseAddress.bind(this);
		this.renderLeftButton = this.renderLeftButton.bind(this);
	}

	componentDidMount() {
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
	}

	keyboardDidShow() {
		this.setState({
			isKeyboardShown: true,
		});
	}

	keyboardDidHide() {
		this.setState({
			isKeyboardShown: false,
		});
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	onInfoPress() {
		this.props.actions.showModal(null, {source: 'Position'});
	}

	onAddressChange(address: string) {
		this.setState({
			address,
		});
	}

	onSubmit() {
		let { onSubmit } = this.props;
		let { latitude, longitude } = this.state.coordinate;
		if (onSubmit) {
			onSubmit(latitude, longitude);
		}
	}

	getDeltas(viewport: Object): Object {
		let { northeast, southwest } = viewport;
		let longitudeDelta = northeast.lng - southwest.lng, latitudeDelta = northeast.lat - southwest.lat;
		return {longitudeDelta, latitudeDelta};
	}

	_refs(map: Object) {
		this.map = map;
	}

	onDragEnd(event: Object) {
		let { coordinate } = event.nativeEvent;
		let { latitudeDelta, longitudeDelta } = this.state;

		let region = new MapView.AnimatedRegion({
			...coordinate,
			latitudeDelta,
			longitudeDelta,
		});

		this.setState({
			region,
			coordinate,
			latitudeDelta,
			longitudeDelta,
		});
	}

	onChooseAddress(data: Object, details: Object) {
		let { isKeyboardShown } = this.state;
		if (isKeyboardShown) {
			InteractionManager.runAfterInteractions(() => {
				Keyboard.dismiss();
			});
		}
		const { geometry } = details;
		if (geometry && geometry.location) {
			let { location, viewport } = geometry;
			let latitude = location.lat, longitude = location.lng;
			let { longitudeDelta, latitudeDelta } = this.getDeltas(viewport);
			let region = new MapView.AnimatedRegion({
				latitude,
				longitude,
				latitudeDelta,
				longitudeDelta,
			});
			let coordinate = {
				latitude,
				longitude,
			};
			this.setState({
				region,
				coordinate,
				latitudeDelta,
				longitudeDelta,
			});
		} else {
			this.props.actions.showModal(this.unknownError);
		}
		this.setState({
			showList: false,
		});
	}

	onChangeTextCity() {
		this.setState({
			showList: true,
		});
	}

	render(): Object {
		const { isLoading } = this.props;
		const { showList } = this.state;
		const styles = this.getStyle();

		return (
			<View style={styles.container}>
				<GooglePlacesAutocomplete
					placeholder=""
					minLength={2} // minimum length of text to search
					autoFocus={false}
					onChangeText={this.onChangeTextCity}
					listViewDisplayed={showList}
					returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
					fetchDetails={true}
					onPress={this.onChooseAddress}

					query={{
						// available options: https://developers.google.com/places/web-service/autocomplete
						key: googleMapsAPIKey,
						language: 'en', // language of the results
						types: '(cities)', // default: 'geocode'
					}}

					nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
					GooglePlacesSearchQuery={{
						// available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
						rankby: 'distance',
					}}

					filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

					debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.

					styles= {{
						textInput: styles.textInput,
						textInputContainer: styles.textInputContainer,
						description: {
							fontWeight: 'bold',
							color: '#000',
						},
						container: styles.searchBoxContainer,
					}}
					underlineColorAndroid="#e26901"
					renderLeftButton={this.renderLeftButton}
				/>
				<Text style={styles.labelStyle}>
					{this.label}
				</Text>
				<View style={styles.mapViewCover} accessible={false} importantForAccessibility="no-hide-descendants">
					<MapView.Animated
						style={styles.map}
						ref={this._refs}
						region={this.state.region}
					>
						<MapView.Marker.Animated
							draggable
							coordinate={this.state.coordinate}
							onDragEnd={this.onDragEnd}/>
					</MapView.Animated>
					<FloatingButton
						buttonStyle={styles.submitButtonStyle}
						onPress={this.onSubmit}
						imageSource={isLoading ? false : require('../../TabViews/img/right-arrow-key.png')}
						showThrobber={isLoading}
					/>
				</View>
			</View>
		);
	}

	renderLeftButton(): Object {
		const { iconSize, iconStyle } = this.getStyle();

		return (
			<IconTelldus icon={'location'} size={iconSize} color={'#A59F9A'} style={iconStyle}/>
		);
	}

	getStyle(): Object {
		const { appLayout } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const fontSize = deviceWidth * 0.06;

		const searchIconSize = deviceWidth * 0.09;
		const fontSizeLabel = Math.floor(deviceWidth * 0.045);

		const padding = deviceWidth * Theme.Core.paddingFactor;
		const labelBoxPadding = deviceWidth * 0.07;

		return {
			container: {
				flex: 1,
			},
			body: {
				flex: 1,
			},
			mapViewCover: {
				flex: 1,
				marginTop: padding / 2,
				borderRadius: 4,
				overflow: 'hidden',
			},
			map: {
				flex: 1,
				overflow: 'hidden',
			},
			labelStyle: {
				position: 'absolute',
				color: '#e26901',
				fontSize: fontSizeLabel,
				top: labelBoxPadding,
				left: labelBoxPadding,
				elevation: 5,
			},
			searchBoxContainer: {
				flex: 0,
				backgroundColor: '#fff',
				marginTop: deviceWidth * Theme.Core.paddingFactor,
				padding: labelBoxPadding,
				justifyContent: 'center',
				...Theme.Core.shadow,
				borderRadius: 2,
			},
			textInputContainer: {
				width: '100%',
				borderTopWidth: 0,
				borderBottomWidth: 0,
				backgroundColor: 'transparent',
				marginTop: labelBoxPadding * 0.8,
			},
			textInput: {
				paddingLeft: labelBoxPadding + 15,
				color: '#A59F9A',
				fontSize,

				// override default styles.
				height: undefined,
				borderRadius: 0,
				paddingTop: 0,
				paddingBottom: 0,
				paddingRight: 0,
				marginTop: 0,
				marginLeft: 0,
				marginRight: 0,
			},
			iconStyle: {
				position: 'absolute',
				elevation: 5,
				zIndex: 3,
			},
			address: {
				width: deviceWidth * 0.75,
				paddingLeft: 35 + fontSize,
				color: '#A59F9A',
				fontSize,
				marginTop: 10 + fontSize,
				marginBottom: fontSize,
			},
			hContainer: {
				  position: 'absolute',
				  right: deviceWidth * 0.124,
				  top: deviceWidth * 0.088,
				  flex: 1,
				  alignItems: 'flex-end',
			},
			h: {
				  color: '#fff',
				  backgroundColor: 'transparent',
			},
			h1: {
				  fontSize: deviceWidth * 0.085333333,
			},
			h2: {
				  fontSize: deviceWidth * 0.053333333,
			},
			searchButtonStyle: {
				right: deviceWidth * 0.053333333,
				elevation: 10,
				bottom: undefined,
				top: 10 + (searchIconSize * 1.8),
				height: searchIconSize,
				width: searchIconSize,
				borderRadius: searchIconSize / 2,
			},
			submitButtonStyle: {
				right: deviceWidth * 0.053333333,
				elevation: 10,
			},
			searchIconSize: deviceWidth * 0.053333333,
			iconSize: Math.floor(deviceWidth * 0.09),
		};
	}
}

export default GeoPosition;

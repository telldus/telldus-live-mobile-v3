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
import { TextInput, Keyboard, InteractionManager } from 'react-native';
import { intlShape } from 'react-intl';
import MapView from 'react-native-maps';
import { isIphoneX } from 'react-native-iphone-x-helper';

import { View, FloatingButton } from '../../../../BaseComponents';
import LabelBox from './LabelBox';

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
	onSubmit: (number, number) => void;
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
};

type State = {
	region: Object,
	address: string,
	coordinate: Object,
	latitudeDelta?: number,
	longitudeDelta?: number,
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
	onEndEditing: () => void;
	_refs: (Object | any) => mixed;
	onSubmit: () => void;
	onDragEnd: (Object) => void;
	onInfoPress: () => void;

	keyboardDidShow: () => void;
	keyboardDidHide: () => void;

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
		};

		let { formatMessage } = props.intl;

		this.label = formatMessage(messages.labelPosition);

		this.unknownError = `${formatMessage(i18n.unknownError)}.`;
		this.networkFailed = `${formatMessage(i18n.networkFailed)}.`;

		this.onAddressChange = this.onAddressChange.bind(this);
		this.onEndEditing = this.onEndEditing.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this._refs = this._refs.bind(this);
		this.onDragEnd = this.onDragEnd.bind(this);

		this.keyboardDidShow = this.keyboardDidShow.bind(this);
		this.keyboardDidHide = this.keyboardDidHide.bind(this);
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
		this.onEndEditing();
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

	onEndEditing() {
		if (this.state.address !== '') {
			this.props.actions.getGeoCodePosition(this.state.address, googleMapsAPIKey).then((response: Object) => {
				if (response.status && response.status === 'OK' && response.results[0]) {
					let { location, viewport } = response.results[0].geometry;
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
					InteractionManager.runAfterInteractions(() => {
						this.setState({
							region,
							coordinate,
							latitudeDelta,
							longitudeDelta,
						});
					});
				}
			}).catch((error: Object) => {
				let data = !error.error_description && error.message === 'Network request failed' ?
					this.networkFailed : error.error_description ?
						error.error_description : error.error ? error.error : this.unknownError;
				this.props.actions.showModal(data);
			});
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

	render(): Object {
		let { appLayout, isLoading } = this.props;
		const styles = this.getStyle(appLayout);

		return (
			<View style={styles.container}>
				<View style={styles.body}>
					<LabelBox
						label={this.label}
						showIcon={true}
						appLayout={appLayout}>
						<TextInput
							style={styles.address}
							onChangeText={this.onAddressChange}
							onEndEditing={this.onEndEditing}
							autoCapitalize="none"
							autoCorrect={false}
							autoFocus={false}
							underlineColorAndroid="#e26901"
							value={this.state.address}/>
					</LabelBox>
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
					</View>
					<FloatingButton
						buttonStyle={styles.buttonStyle}
						onPress={this.onSubmit}
						imageSource={isLoading ? false : require('../../TabViews/img/right-arrow-key.png')}
						showThrobber={isLoading}
					/>
				</View>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;
		const padding = isIphoneX() ? (!isPortrait ? width * 0.1585 : width * 0.11) : width * 0.15;

		return {
			container: {
				flex: 1,
			  },
			  body: {
				  flex: 1,
			  },
			  mapViewCover: {
				  flex: 1,
				  marginTop: 10,
				  borderRadius: 4,
				  overflow: 'hidden',
			  },
			  map: {
				flex: 1,
				overflow: 'hidden',
			  },
			  address: {
				  height: 50,
				  width: width - padding,
				  paddingLeft: 35,
				  color: '#A59F9A',
				  fontSize: Math.floor(deviceWidth * 0.06),
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
			  buttonStyle: {
				  right: deviceWidth * 0.053333333,
				  elevation: 10,
			  },
		};
	}
}

export default GeoPosition;

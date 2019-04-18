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

import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { connect } from 'react-redux';
import {
	CachedImage,
} from 'react-native-cached-image';

import IconTelldus from './IconTelldus';
import Text from './Text';
import View from './View';
import Theme from '../App/Theme';

type Props = {
	title?: any,
	image: string,
	H1: string,
	H2: string,
	style: any,
	onPress?: Function,
	appLayout: Object,
	accessible?: boolean,
	info?: Object,
	infoContainerStyle?: any,
	isStatic?: boolean,
};

type DefaultProps = {
	isStatic: boolean,
};


type State = {
	errorShowImage: boolean,
};

class LocationDetails extends Component<Props, State> {
	props: Props;

	onPress: () => void;

	static defaultProps: DefaultProps = {
		isStatic: true,
	};

	state: State = {
		errorShowImage: false,
	}

	constructor(props: Props) {
		super(props);

		this.onPress = this.onPress.bind(this);

		this.onError = this.onError.bind(this);
		this.renderImage = this.renderImage.bind(this);
	}

	onPress() {
		const { onPress } = this.props;
		if (onPress) {
			if (typeof onPress === 'function') {
				onPress();
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}

	renderImage({ style, source, resizeMode }: Object): Object | null {
		if (!source || !source.uri) {
			return null;
		}
		return (
			<Image
				style={style}
				source={{uri: source.uri}}
				resizeMode={resizeMode}
				onError={this.onError}/>
		);
	}

	onError() {
		this.setState({
			errorShowImage: true,
		});
	}

	render(): Object {

		const { errorShowImage } = this.state;
		const {
			title,
			H1,
			H2,
			image,
			style,
			appLayout,
			accessible,
			info,
			onPress,
			infoContainerStyle,
		} = this.props;

		const {
			container,
			locationImageContainer,
			locationTextContainer,
			locationImage,
			textHSH,
			textLocation,
			locationIcon,
		} = this.getStyle(appLayout);

		return (
			<TouchableOpacity
				style={[styles.shadow, container, style]}
				accessible={accessible}
				disabled={!onPress}
				onPress={this.onPress}>
				{!!title && (
					<Text style={[textLocation, {marginLeft: 10}]}>
						{title}
					</Text>)
				}
				<View style={styles.imageHeaderContainer}>
					<View style={locationImageContainer}>
						{errorShowImage ?
							<IconTelldus icon={'zwave'} style={locationIcon}/>
							:
							<CachedImage
								resizeMode={'contain'}
								useQueryParamsInCacheKey={true}
								source={{uri: image}}
								style={locationImage}
								renderImage={this.renderImage}/>
						}
					</View>
					<View style={[locationTextContainer, infoContainerStyle]}>
						<Text numberOfLines={1} style={textHSH}>
							{!!H1 && H1}
						</Text>
						<Text numberOfLines={1} style={textLocation}>
							{!!H2 && H2}
						</Text>
						{!!info && (
							info
						)}
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		let textHSHSize = Math.floor(deviceWidth * 0.054);
		textHSHSize = textHSHSize > 35 ? 35 : textHSHSize;

		let textLocationSize = Math.floor(deviceWidth * 0.045);
		textLocationSize = textLocationSize > 29 ? 29 : textLocationSize;

		return {
			container: {
				flexDirection: 'column',
				backgroundColor: '#fff',
				padding: textHSHSize,
				justifyContent: 'center',
			},
			locationImageContainer: {
				justifyContent: 'center',
				alignItems: 'flex-start',
			},
			locationTextContainer: {
				width: width * 0.58,
				marginRight: width * 0.15,
				justifyContent: 'center',
				alignItems: 'flex-start',
				marginTop: 10,
			},
			locationImage: {
				width: isPortrait ? width * 0.22 : height * 0.22,
				height: isPortrait ? height * 0.12 : width * 0.12,
				alignSelf: 'flex-start',
				marginRight: 10,
			},
			textLocation: {
				color: '#A59F9A',
				fontSize: textLocationSize,
			},
			textHSH: {
				color: '#F06F0C',
				fontSize: textHSHSize,
			},
			locationIcon: {
				color: Theme.Core.brandPrimary,
				fontSize: isPortrait ? width * 0.22 : height * 0.22,
				marginRight: 10,
			},
		};
	}
}

const styles = StyleSheet.create({
	imageHeaderContainer: {
		justifyContent: 'flex-start',
		alignItems: 'center',
		flexDirection: 'row',
	},
	shadow: {
		borderRadius: 2,
		...Theme.Core.shadow,
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.app.layout,
	};
}

module.exports = connect(mapStateToProps, null)(LocationDetails);

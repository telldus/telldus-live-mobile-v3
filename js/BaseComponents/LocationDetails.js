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
import { StyleSheet, Image } from 'react-native';
import { connect } from 'react-redux';
import {
	CachedImage,
} from 'react-native-cached-image';

import IconTelldus from './IconTelldus';
import TouchableOpacity from './TouchableOpacity';
import Text from './Text';
import View from './View';
import Theme from '../App/Theme';

type Props = {
	title?: any,
	image: Object,
	H1: string,
	H2: string,
	style: any,
	onPress?: Function,
	appLayout: Object,
	accessible?: boolean,
	info?: Object,
	infoContainerStyle?: any,
	fromJS?: boolean,
	info2?: Object,
	resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center',
	h1Style: Object,
	h2Style: Object,
	renderCustomComponent?: Function,
};

type DefaultProps = {
	fromJS: boolean,
};

type State = {
	errorShowImage: boolean,
};

class LocationDetails extends Component<Props, State> {
	props: Props;

	onPress: () => void;

	static defaultProps: DefaultProps = {
		fromJS: false,
	};

	state: State = {
		errorShowImage: false,
	}

	onError: () => void;
	renderImage: (Object) => Object | null;

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
			info2,
			fromJS,
			resizeMode,
			h1Style,
			h2Style,
			renderCustomComponent,
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
				level={2}
				style={[styles.shadow, container, style]}
				accessible={accessible}
				disabled={!onPress}
				onPress={this.onPress}>
				{!!title && (
					<Text
						level={18}
						style={[textLocation, {marginLeft: 10}]}>
						{title}
					</Text>)
				}
				<View style={styles.imageHeaderContainer}>
					<View style={locationImageContainer}>
						{errorShowImage ?
							<IconTelldus
								level={20}
								icon={'zwave'}
								style={locationIcon}/>
							:
							fromJS ?
								<Image
									style={locationImage}
									source={image}
									resizeMode={resizeMode || 'contain'}
									onError={this.onError}/>
								:
								<CachedImage
									resizeMode={resizeMode || 'contain'}
									useQueryParamsInCacheKey={true}
									source={{uri: image}}
									style={locationImage}
									renderImage={this.renderImage}/>
						}
					</View>
					<View style={[locationTextContainer, infoContainerStyle]}>
						<Text
							level={38}
							numberOfLines={1}
							style={[textHSH, h1Style]}>
							{!!H1 && H1}
						</Text>
						<Text
							level={18}
							numberOfLines={1}
							style={[textLocation, h2Style]}>
							{!!H2 && H2}
						</Text>
						{!!info && (
							info
						)}
						{!!info2 && (
							info2
						)}
					</View>
				</View>
				{!!renderCustomComponent && renderCustomComponent()}
			</TouchableOpacity>
		);
	}

	getStyle(appLayout: Object): Object {
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const {
			fontSizeFactorEight,
		} = Theme.Core;

		let textHSHSize = Math.floor(deviceWidth * 0.054);
		textHSHSize = textHSHSize > 35 ? 35 : textHSHSize;

		let textLocationSize = Math.floor(deviceWidth * fontSizeFactorEight);
		textLocationSize = textLocationSize > 29 ? 29 : textLocationSize;

		const widthImage = isPortrait ? width * 0.22 : height * 0.22;

		return {
			container: {
				flexDirection: 'column',
				padding: textHSHSize,
				justifyContent: 'center',
			},
			locationImageContainer: {
				justifyContent: 'center',
				alignItems: 'flex-start',
				minWidth: widthImage + 15,
			},
			locationTextContainer: {
				width: width * 0.58,
				marginRight: width * 0.15,
				justifyContent: 'center',
				alignItems: 'flex-start',
				marginTop: 10,
			},
			locationImage: {
				width: widthImage,
				height: isPortrait ? height * 0.12 : width * 0.12,
				alignSelf: 'flex-start',
				maxWidth: widthImage,
			},
			textLocation: {
				fontSize: textLocationSize,
			},
			textHSH: {
				fontSize: textHSHSize,
			},
			locationIcon: {
				fontSize: widthImage,
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

module.exports = (connect(mapStateToProps, null)(LocationDetails): Object);

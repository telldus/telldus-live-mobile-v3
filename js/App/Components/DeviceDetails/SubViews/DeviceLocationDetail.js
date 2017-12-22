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
import { connect } from 'react-redux';
import { Text, View } from 'BaseComponents';
import { StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';

type Props = {
	title?: any,
	image: String,
	H1: String,
	H2: String,
	style: any,
	onPress?: Function,
	appLayout: Object,
};

type State = {
};

class DeviceLocationDetail extends View {
	props: Props;
	state: State;

	onPress: () => void;

	constructor(props: Props) {
		super(props);
		this.state = {
		};

		this.onPress = this.onPress.bind(this);
	}

	onPress() {
		if (this.props.onPress) {
			if (typeof this.props.onPress === 'function') {
				this.props.onPress();
			} else {
				console.warn('Invalid Prop Passed : onPress expects a Function.');
			}
		}
	}

	render() {

		let { title, H1, H2, image, style, appLayout } = this.props;

		let {
			locationImageContainer,
			locationTextContainer,
			locationImage,
			textHSH,
			textLocation,
		} = this.getStyle(appLayout);

		return (
			<View style={[styles.shadow, styles.container, style]}>
				{!!title && (
					<Text style={[textLocation, {marginLeft: 10}]}>
						{title}
					</Text>)
				}
				<View style={styles.imageHeaderContainer}>
					<View style={locationImageContainer}>
						<Image resizeMode={'contain'} style={locationImage} source={{ uri: image, isStatic: true }} />
					</View>
					<TouchableWithoutFeedback onPress={this.onPress}>
						<View style={locationTextContainer}>
							<Text numberOfLines={1} style={textHSH}>
								{!!H1 && H1}
							</Text>
							<Text numberOfLines={1} style={textLocation}>
								{!!H2 && H2}
							</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {
		const height = appLayout.height;
		const width = appLayout.width;
		let isPortrait = height > width;

		return {
			locationImageContainer: {
				height: isPortrait ? height * 0.16 : width * 0.16,
				width: width * 0.28,
				justifyContent: 'center',
				alignItems: 'flex-start',
			},
			locationTextContainer: {
				height: isPortrait ? height * 0.16 : width * 0.16,
				width: width * 0.53,
				marginRight: width * 0.09,
				justifyContent: 'center',
				alignItems: 'flex-start',
			},
			locationImage: {
				width: isPortrait ? width * 0.22 : height * 0.22,
				height: isPortrait ? height * 0.12 : width * 0.12,
				alignSelf: 'flex-start',
			},
			textLocation: {
				color: '#A59F9A',
				fontSize: isPortrait ? width * 0.047 : height * 0.047,
			},
			textHSH: {
				color: '#F06F0C',
				fontSize: isPortrait ? width * 0.060 : height * 0.060,
			},
		};
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		backgroundColor: '#fff',
		paddingLeft: 10,
		paddingRight: 10,
		paddingTop: 10,
	},
	imageHeaderContainer: {
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		flexDirection: 'row',
	},
	shadow: {
		borderRadius: 4,
		backgroundColor: '#fff',
		shadowColor: '#000000',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowRadius: 1,
		shadowOpacity: 1.0,
		elevation: 2,
	},
});

function mapStateToProps(store: Object): Object {
	return {
		appLayout: store.App.layout,
	};
}

module.exports = connect(mapStateToProps, null)(DeviceLocationDetail);

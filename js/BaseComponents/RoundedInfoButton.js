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
import { connect } from 'react-redux';
import { TouchableOpacity, Image } from 'react-native';

type ButtonProps = {
	onPress?: Function,
	infoButtonContainerStyle?: Array<any> | Object | number,
	infoButtonStyle?: Array<any> | Object | number,
};

type Props = {
	buttonProps: ButtonProps,
	appLayout: Object,
};

class RoundedInfoButton extends Component<Props, null> {
	props: Props;

	constructor(props: Props) {
		super(props);
		this.onPress = this.onPress.bind(this);
	}

	onPress = () => {
		if (this.props.buttonProps) {
			let {onPress} = this.props.buttonProps;
			if (onPress) {
				if (typeof onPress === 'function') {
					onPress();
				} else {
					console.warn('Invalid Prop Passed : onPress expects a Function.');
				}
			}
		}
	}

	render() {
		let infoButtonContainerStyle = {}, infoButtonStyle = {};
		if (this.props.buttonProps && this.props.buttonProps.infoButtonContainerStyle) {
			infoButtonContainerStyle = this.props.buttonProps.infoButtonContainerStyle;
		}
		if (this.props.buttonProps && this.props.buttonProps.infoButtonStyle) {
			infoButtonStyle = this.props.buttonProps.infoButtonStyle;
		}
		let { appLayout } = this.props;
		const styles = this.getStyle(appLayout);

		return (
			<TouchableOpacity style={[styles.roundedInfoButtonContainer, infoButtonContainerStyle]} onPress={this.onPress}>
				<Image
					source={require('../App/Components/TabViews/img/rounded-info-button.png')}
					style={[styles.roundedInfoButton, infoButtonStyle]}
				/>
			</TouchableOpacity>
		);
	}

	getStyle = (appLayout: Object): Object => {
		const height = appLayout.height;
		const width = appLayout.width;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		return {
			roundedInfoButtonContainer: {
				position: 'absolute',
				right: deviceWidth * 0.045333333,
				bottom: deviceWidth * 0.036,
			},
			roundedInfoButton: {
				height: deviceWidth * 0.042666667,
				width: deviceWidth * 0.042666667,
			},
		};
	}
}

function mapStateToProps(state: Object): Object {
	return {
		appLayout: state.App.layout,
	};
}

export default connect(mapStateToProps, null)(RoundedInfoButton);
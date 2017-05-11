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

'use strict';

import React, { Component, PropTypes } from 'react';
import { Dimensions, Text } from 'react-native';
import DimmerProgressBar from './DimmerProgressBar';
import { View, initializeRegistryWithDefinitions } from 'react-native-animatable';
import * as ANIMATION_DEFINITIONS from 'react-native-animatable/definitions';

initializeRegistryWithDefinitions(ANIMATION_DEFINITIONS);

class DimmerPopup extends Component {
	static defaultProps = {
		animationIn: 'slideInDown',
		animationInTiming: 300,
		animationOut: 'slideOutUp',
		animationOutTiming: 300,
		isVisible: false,
		hideOnBack: true,
		value: 1,
	}

	constructor(props) {
		super(props);
		this.state = {
			isVisible: false,
			deviceWidth: Dimensions.get('window').width,
			deviceHeight: Dimensions.get('window').height,
		};
	}

	componentWillReceiveProps(nextProps) {
		if (!this.state.isVisible && nextProps.isVisible) {
			this.setState({ isVisible: true });
		}
	}

	componentWillMount() {
		if (this.props.isVisible) {
			this.setState({ isVisible: true });
		}
	}

	componentDidMount() {
		if (this.state.isVisible) {
			this.open();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		// On modal open request, we slide the view up and fade in the backdrop
		if (this.state.isVisible && !prevState.isVisible) {
			this.open();
		// On modal close request, we slide the view down and fade out the backdrop
		} else if (!this.props.isVisible && prevProps.isVisible) {
			this.close();
		}
	}

	open() {
		this.contentRef[this.props.animationIn](this.props.animationInTiming);
	}

	close = async () => {
		this.contentRef[this.props.animationOut](this.props.animationOutTiming).then(() => {
			this.setState({ isVisible: false });
		});
	}

	closeOnBack() {
		if (this.props.hideOnBack) {
			this.close();
		}

		this.props.onBackButtonPress();
	}

	handleLayout(event) {
		// Here we update the device dimensions in the state if the layout changed (triggering a render)
		const deviceWidth = Dimensions.get('window').width;
		const deviceHeight = Dimensions.get('window').height;
		if (deviceWidth !== this.state.deviceWidth || deviceHeight !== this.state.deviceHeight) {
			this.setState({ deviceWidth, deviceHeight });
		}
	}

	setRefs(ref) {
		this.contentRef = ref;
	}

	render() {
		const { deviceWidth } = this.state;

		if (!this.state.isVisible) {
			return null;
		}
		return (
			<View
				onLayout={this.handleLayout.bind(this)}
				ref={c => this.setRefs(c)}
				style={{
					marginTop: 22,
					marginHorizontal: 8,
					position: 'absolute',
					width: deviceWidth - 16,
					height: 56,
					backgroundColor: 'white',
					borderRadius: 7,
					alignItems: 'center',
					justifyContent: 'center',
				}}>
				<Text ellipsizeMode="middle"
					style={{ color: '#1a355b' }}>
					{this.props.name}
				</Text>
				<DimmerProgressBar
					progress={this.props.value}
					height={16}
					width={deviceWidth - 32}
					style={{ alignItems: 'center', justifyContent: 'center' }}
				/>
			</View>
		);
	}
}

DimmerPopup.propTypes = {
	animationIn: PropTypes.string,
	animationInTiming: PropTypes.number,
	animationOut: PropTypes.string,
	animationOutTiming: PropTypes.number,
	value: PropTypes.number.isRequired,
	isVisible: PropTypes.bool.isRequired,
	hideOnBack: PropTypes.bool,
	style: PropTypes.array,
	name: PropTypes.string.isRequired,
};

module.exports = DimmerPopup;

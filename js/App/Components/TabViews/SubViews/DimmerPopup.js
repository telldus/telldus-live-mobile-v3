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
import { Dimensions } from 'react-native';

import {
	Text,
} from '../../../../BaseComponents';
import DimmerProgressBar from './DimmerProgressBar';
import { View, initializeRegistryWithDefinitions } from 'react-native-animatable';
import * as ANIMATION_DEFINITIONS from 'react-native-animatable/definitions';
import Theme from '../../../Theme';

import {
	withTheme,
	PropsThemedComponent,
} from '../../HOC/withTheme';

initializeRegistryWithDefinitions(ANIMATION_DEFINITIONS);

type Props = PropsThemedComponent & {
	animationIn: string,
	animationInTiming: number,
	animationOut: string,
	animationOutTiming: number,
	value: number,
	isVisible: boolean,
	hideOnBack: boolean,
	style: Object,
	name: string,
	onBackButtonPress: () => void,
};

type State = {
	isVisible: boolean,
	deviceWidth: number,
	deviceHeight: number,
};

type DefaultProps = {
	animationIn: string,
	animationInTiming: number,
	animationOut: string,
	animationOutTiming: number,
	value: number,
	isVisible: boolean,
	hideOnBack: boolean,
};

class DimmerPopup extends Component<Props, State> {
	props: Props;
	state: State;
	handleLayout: Object => void;
	setRefs: (any) => any;
	contentRef: Object;

	static defaultProps: DefaultProps;

	static getDerivedStateFromProps(props: Object, state: Object): Object | null {
		if (!state.isVisible && props.isVisible) {
			return {
				isVisible: true,
			};
		}
		return null;
	}

	constructor(props: Props) {
		super(props);
		this.state = {
			isVisible: props.isVisible,
			deviceWidth: Dimensions.get('window').width,
			deviceHeight: Dimensions.get('window').height,
		};

		this.handleLayout = this.handleLayout.bind(this);
		this.setRefs = this.setRefs.bind(this);
	}

	componentDidMount() {
		if (this.state.isVisible) {
			this.open();
		}
	}

	componentDidUpdate(prevProps: Props, prevState: State) {
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

	close = async (): Promise<any> => {
		this.contentRef[this.props.animationOut](this.props.animationOutTiming).then(() => {
			this.setState({ isVisible: false });
		});
	};

	closeOnBack() {
		if (this.props.hideOnBack) {
			this.close();
		}

		this.props.onBackButtonPress();
	}

	handleLayout(event: Object) {
		// Here we update the device dimensions in the state if the layout changed (triggering a render)
		const deviceWidth = Dimensions.get('window').width;
		const deviceHeight = Dimensions.get('window').height;
		if (deviceWidth !== this.state.deviceWidth || deviceHeight !== this.state.deviceHeight) {
			this.setState({
				deviceWidth,
				deviceHeight,
			});
		}
	}

	setRefs(ref: Object) {
		this.contentRef = ref;
	}

	render(): Object | null {
		const { deviceWidth } = this.state;

		if (!this.state.isVisible) {
			return null;
		}
		return (
			<View
				onLayout={this.handleLayout}
				ref={this.setRefs}
				style={{
					marginTop: 22,
					marginHorizontal: 8,
					position: 'absolute',
					width: deviceWidth - 16,
					height: 56,
					borderRadius: 7,
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: this.props.colors.card,
					...Theme.Core.shadow,
				}}>
				<Text
					level={24}
					ellipsizeMode="middle"
					allowFontScaling={false}>
					{this.props.name}
				</Text>
				<DimmerProgressBar
					progress={this.props.value}
					height={18}
					width={deviceWidth - 32}
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						marginTop: 2,
					}}
					borderColor={'#fff'}
					unfilledColor={'#efefef'}
					borderWidth={0}
				/>
			</View>
		);
	}
}

DimmerPopup.defaultProps = {
	animationIn: 'slideInDown',
	animationInTiming: 300,
	animationOut: 'slideOutUp',
	animationOutTiming: 300,
	isVisible: false,
	hideOnBack: true,
	value: 1,
};

module.exports = (withTheme(DimmerPopup, true): Object);

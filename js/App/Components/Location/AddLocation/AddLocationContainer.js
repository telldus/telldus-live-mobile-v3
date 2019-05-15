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
import { BackHandler, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
const isEqual = require('react-fast-compare');

import {
	View,
	NavigationHeaderPoster,
} from '../../../../BaseComponents';
import Theme from '../../../Theme';

import * as modalActions from '../../../Actions/Modal';
import * as gatewayActions from '../../../Actions/Gateways';

type Props = {
	navigation: Object,
	children: Object,
	actions?: Object,
	screenProps: Object,
	source: Object | number,
	ScreenName: string,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
};

type DefaultProps = {
	source: Object | number,
};

class AddLocationContainer extends View<null, Props, State> {

	handleBackPress: () => boolean;

	static defaultProps: DefaultProps = {
		source: {uri: 'telldus_geometric_bg'},
	};

	state = {
		h1: '',
		h2: '',
		infoButton: null,
	};

	constructor(props: Props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};

		this.handleBackPress = this.handleBackPress.bind(this);
	}

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
	}

	handleBackPress(): boolean {
		let {navigation, screenProps} = this.props;
		if (screenProps.currentScreen === 'Success') {
			return true;
		}
		navigation.pop();
		return true;
	}


	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		if (nextProps.ScreenName === nextProps.screenProps.currentScreen) {
			const isStateEqual = isEqual(this.state, nextState);
			if (!isStateEqual) {
				return true;
			}
			const isPropsEqual = isEqual(this.props, nextProps);
			if (!isPropsEqual) {
				return true;
			}
			return false;
		}
		return false;
	}

	onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton,
		});
	};

	render(): Object {
		const {
			children,
			actions,
			screenProps,
			navigation,
		} = this.props;
		const { currentScreen, appLayout } = screenProps;
		const { h1, h2, infoButton } = this.state;
		const { height, width } = appLayout;
		const isPortrait = height > width;

		const deviceWidth = isPortrait ? width : height;

		const styles = this.getStyle(appLayout);

		let padding = currentScreen === 'TimeZoneCity'
			|| currentScreen === 'TimeZoneContinent' ? 0 : (deviceWidth * Theme.Core.paddingFactor);

		return (
			<View style={{
				flex: 1,
			}}>
				<KeyboardAvoidingView
					behavior="padding"
					style={{flex: 1}}
					contentContainerStyle={{ justifyContent: 'center'}}
					keyboardVerticalOffset={Platform.OS === 'android' ? -500 : 0}>
					<NavigationHeaderPoster
						h1={h1} h2={h2}
						infoButton={infoButton}
						showLeftIcon={currentScreen !== 'Success'}
						align={'right'}
						navigation={navigation}
						{...screenProps}
						leftIcon={currentScreen === 'LocationDetected' ? 'close' : undefined}/>
					<ScrollView style={{
						flex: 1,
						backgroundColor: Theme.Core.appBackground,
					}} keyboardShouldPersistTaps={'always'} contentContainerStyle={{flexGrow: 1}}>
						<View style={[styles.style, {paddingHorizontal: padding}]}>
							{React.cloneElement(
								children,
								{
									onDidMount: this.onChildDidMount,
									actions,
									...screenProps,
									navigation,
									paddingHorizontal: padding,
								},
							)}
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		);
	}

	getStyle(appLayout: Object): Object {

		return {
			style: {
				flex: 1,
			},
		};
	}
}

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators({...modalActions, ...gatewayActions}, dispatch),
		},
	}
);

export default connect(null, mapDispatchToProps)(AddLocationContainer);

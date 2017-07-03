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

import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Dimensions } from 'react-native';
import _ from 'lodash';
import { View, Text, Header } from 'BaseComponents';
import Poster from './SubViews/Poster';

import * as scheduleActions from 'Actions_Schedule';
import { getDevices } from 'Actions_Devices';

type Props = {
	navigation: Object,
	children: Object,
	reset: Function,
	schedule: Object,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
};

class ScheduleScreen extends View {

	props: Props;
	state: State;

	getStyles: () => Object;
	goBack: () => void;
	onChildDidMount: (string, string, ?Object) => void;
	isDeviceTab: () => boolean;

	constructor(props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};

		this.state = {
			h1: '',
			h2: '',
			infoButton: null,
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		const isStateEqual = _.isEqual(this.state, nextState);
		const isPropsEqual = _.isEqual(this.props, nextProps);
		return !(isStateEqual && isPropsEqual);
	}

	getStyles = () => {
		const deviceWidth = Dimensions.get('window').width;
		this.padding = deviceWidth * 0.033333333;
		this.rowWidth = deviceWidth - 2 * this.padding;

		// TODO: font-family
		return {
			flex: 1,
			paddingHorizontal: this.padding,
			paddingTop: this.padding,
		};
	};

	isDeviceTab = () => this.props.navigation.state.routeName === 'Device';

	goBack = () => {
		const { navigation, actions } = this.props;

		if (this.isDeviceTab()) {
			actions.reset();
		}

		navigation.goBack(null);
	};

	onChildDidMount = (h1, h2, infoButton = null) => {
		this.setState({
			h1,
			h2,
			infoButton
		});
	};

	render() {
		const { children, navigation, actions } = this.props;
		const { h1, h2, infoButton } = this.state;

		return (
			<View>
				<Header leftButton={this.backButton}/>
				<Poster h1={h1} h2={h2} infoButton={infoButton}/>
				<View style={this.getStyles()}>
					{React.cloneElement(
						children,
						{
							onDidMount: this.onChildDidMount,
							width: this.rowWidth,
							navigation,
							actions,
							reset: this.isDeviceTab() ? this.goBack : null,
							paddingRight: this.padding,
						}
					)}
				</View>
			</View>
		);
	}
}

ScheduleScreen.propTypes = {
	navigation: PropTypes.object.isRequired,
	children: PropTypes.object.isRequired,
	reset: PropTypes.func,
	schedule: PropTypes.object,
};

const mapStateToProps = ({ schedule }) => ({
	schedule,
});

const mapDispatchToProps = dispatch => ({
	actions: {
		...bindActionCreators(scheduleActions, dispatch),
		getDevices: () => dispatch(getDevices()),
	}
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScheduleScreen);

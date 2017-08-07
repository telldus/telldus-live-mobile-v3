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
import _ from 'lodash';
import { FullPageActivityIndicator, Header, View } from 'BaseComponents';
import { SchedulePoster } from 'Schedule_SubViews';
import { getDeviceWidth } from 'Lib';

import * as scheduleActions from 'Actions_Schedule';
import { getDevices } from 'Actions_Devices';
import type { Schedule } from 'Reducers_Schedule';

type Props = {
	navigation: Object,
	children: Object,
	schedule?: Schedule,
	actions?: Object,
};

type State = {
	h1: string,
	h2: string,
	infoButton: null | Object,
	loading: boolean,
};

export interface ScheduleProps {
	navigation: Object,
	actions: Object,
	onDidMount: (h1: string, h2: string, infoButton: ?Object) => void,
	schedule: Schedule,
	loading: (loading: boolean) => void,
}

class ScheduleScreen extends View<null, Props, State> {

	static propTypes = {
		navigation: PropTypes.object.isRequired,
		children: PropTypes.object.isRequired,
		schedule: PropTypes.object,
		actions: PropTypes.objectOf(PropTypes.func),
	};

	state = {
		h1: '',
		h2: '',
		infoButton: null,
		loading: false,
	};

	constructor(props: Props) {
		super(props);

		this.backButton = {
			back: true,
			onPress: this.goBack,
		};
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		const isStateEqual = _.isEqual(this.state, nextState);
		const isPropsEqual = _.isEqual(this.props, nextProps);
		return !(isStateEqual && isPropsEqual);
	}

	goBack = () => {
		this.props.navigation.goBack(null);
	};

	onChildDidMount = (h1: string, h2: string, infoButton?: Object | null = null) => {
		this.setState({
			h1,
			h2,
			infoButton,
		});
	};

	loading = (loading: boolean) => {
		this.setState({ loading });
	};

	render() {
		const { children, navigation, actions, devices, schedule } = this.props;
		const { h1, h2, infoButton, loading } = this.state;
		const style = this._getStyle();

		return (
			<View>
				<Header leftButton={this.backButton}/>
				{loading && (
					<FullPageActivityIndicator/>
				)}
				<View style={{
					flex: 1,
					opacity: loading ? 0 : 1,
				}}>
					<SchedulePoster h1={h1} h2={h2} infoButton={infoButton}/>
					<View style={style}>
						{React.cloneElement(
							children,
							{
								onDidMount: this.onChildDidMount,
								navigation,
								actions,
								paddingRight: style.paddingHorizontal,
								devices,
								schedule,
								loading: this.loading,
							},
						)}
					</View>
				</View>
			</View>
		);
	}

	_getStyle = (): Object => {
		const deviceWidth = getDeviceWidth();
		const padding = deviceWidth * 0.033333333;

		const isEdit = this.props.navigation.state.routeName === 'Edit';

		return {
			flex: 1,
			paddingHorizontal: isEdit ? 0 : padding,
			paddingTop: isEdit ? 0 : padding,
		};
	};

}

type mapStateToPropsType = {
	schedule: Schedule,
	devices: Object,
};

const mapStateToProps = ({ schedule, devices }: mapStateToPropsType): mapStateToPropsType => (
	{
		schedule,
		devices,
	}
);

const mapDispatchToProps = (dispatch: Function): Object => (
	{
		actions: {
			...bindActionCreators(scheduleActions, dispatch),
			getDevices: (): Object => dispatch(getDevices()),
		},
	}
);

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleScreen);

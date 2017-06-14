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

import React, { PropTypes } from 'React';
import { connect } from 'react-redux';
import { getGateways, getSensors, getJobs, getUserProfile, appStart, appState, syncLiveApiOnForeground } from 'Actions';
import { authenticateSession, connectToGateways } from 'Actions_Websockets';
import { getDevices } from 'Actions_Devices';

import { View } from 'BaseComponents';
import Platform from 'Platform';
import TabsView from 'TabsView';
import StatusBar from 'StatusBar';
import Orientation from 'react-native-orientation';
import { DimmerPopup } from 'TabViews_SubViews';

import { getUserProfile as getUserProfileSelector } from '../Reducers/User';

type Props = {
  dimmer: Object,
  tab: string,
  accessToken: Object,
  userProfile: Object,
  dispatch: Function,
};

type State = {
  specificOrientation: Object,
}

class AppNavigator extends View {
  props: Props;
  state: State;

  _updateSpecificOrientation: Object => void;
  constructor() {
    super();
    if (Platform.OS !== 'android') {
      const init = Orientation.getInitialOrientation();
      this.state = {
        specificOrientation: init,
      };
      Orientation.unlockAllOrientations();
      this._updateSpecificOrientation = this._updateSpecificOrientation.bind(this);
      Orientation.addSpecificOrientationListener(this._updateSpecificOrientation);
    }
  }

  componentWillMount() {
    this.props.dispatch(appStart());
    this.props.dispatch(appState());
  }

  componentDidMount() {
    Platform.OS === 'ios' && StatusBar && StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android' && StatusBar) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('rgba(0, 0, 0, 0.2)');
    }

    this.props.dispatch(getUserProfile());
    this.props.dispatch(authenticateSession());
    this.props.dispatch(connectToGateways());
    this.props.dispatch(syncLiveApiOnForeground());

    this.props.dispatch(getDevices());
    this.props.dispatch(getGateways());
    this.props.dispatch(getSensors());
    this.props.dispatch(getJobs());
  }

  _updateSpecificOrientation(specificOrientation) {
    if (Platform.OS !== 'android') {
      this.setState({ specificOrientation });
    }
  }

  render() {
    return (
			<View>
				<TabsView />
				<DimmerPopup
					isVisible={this.props.dimmer.show}
					name={this.props.dimmer.name}
					value={this.props.dimmer.value / 255}
				/>
			</View>
    );
  }
}

AppNavigator.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    tab: state.navigation.tab,
    accessToken: state.user.accessToken,
    userProfile: getUserProfileSelector(state),
    dimmer: state.dimmer,
  };
}

module.exports = connect(mapStateToProps)(AppNavigator);

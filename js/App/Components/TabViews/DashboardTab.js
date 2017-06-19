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

import React from 'react';
import { createSelector } from 'reselect';
import { Dimensions } from 'react-native';
import { connect } from 'react-redux';
import { Text, List, ListDataSource, View } from 'BaseComponents';
import { getDevices } from 'Actions_Devices';
import { changeSensorDisplayType } from 'Actions_Dashboard';
import { toggleSettings } from 'Actions_Settings';
import { parseDashboardForListView } from '../../Reducers/Dashboard';
import { getUserProfile } from '../../Reducers/User';

import { DimmerDashboardTile, NavigationalDashboardTile, BellDashboardTile, ToggleDashboardTile, SensorDashboardTile } from 'TabViews/SubViews';
import { SettingsDetailModal } from 'DetailViews';

import getDeviceType from '../../Lib/getDeviceType';

type Props = {
  rows: Array<Object>,
  gateways: Object,
  userProfile: Object,
  tab: string,
  onChangeDisplayType: () => void,
  toggleSettings: boolean => void,
  dispatch: Function,
  settings: Object,
};

type State = {
  tileWidth: number,
  listWidth: number,
  dataSource: Object,
};

const tileMargin = 8;
const listMargin = 8;

class DashboardTab extends View {
  props: Props;
  state: State;

  tab: string;
  _onLayout: Object => void;
  setScrollEnabled: boolean => void;
  startSensorTimer: () => void;
  stopSensorTimer: () => void;
  changeDisplayType: () => void;
  onRefresh: () => void;
  onCloseSetting: () => void;

  constructor(props: Props) {
    super(props);
    const { width } = Dimensions.get('window');
    const tileWidth = this.calculateTileWidth(width);

    this.state = {
      tileWidth,
      listWidth: 0,
      dataSource: new ListDataSource({
        rowHasChanged: this.rowHasChanged,
      }).cloneWithRows(this.props.rows),
    };

    this.tab = 'dashboardTab';

    this._onLayout = this._onLayout.bind(this);
    this.setScrollEnabled = this.setScrollEnabled.bind(this);
    this.startSensorTimer = this.startSensorTimer.bind(this);
    this.stopSensorTimer = this.stopSensorTimer.bind(this);
    this.changeDisplayType = this.changeDisplayType.bind(this);
    this.onRefresh = this.onRefresh.bind(this);
    this.onCloseSetting = this.onCloseSetting.bind(this);
  }

  startSensorTimer() {
    this.timer = setInterval(() => {
      this.props.onChangeDisplayType();
    }, 5000);
  }

  stopSensorTimer() {
    clearInterval(this.timer);
  }

  changeDisplayType() {
    this.stopSensorTimer();
    this.props.onChangeDisplayType();
    this.startSensorTimer();
  }

  rowHasChanged(r1, r2) {
    return r1.childObject !== r2.childObject;
  }

  setScrollEnabled(enable) {
    if (this.refs.list && this.refs.list.setScrollEnabled) {
      this.refs.list.setScrollEnabled(enable);
    }
  }

  onRefresh() {
    this.props.dispatch(getDevices());
  }

  componentDidMount() {
    this.startSensorTimer();
  }

  componentWillUnmount() {
    this.stopSensorTimer();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(nextProps.rows),
    });

    if (nextProps.tab !== 'dashboardTab') {
      this.stopSensorTimer();
      this.tab = nextProps.tab;
    } else if (nextProps.tab === 'dashboardTab' && this.tab !== 'dashboardTab') {
      this.startSensorTimer();
      this.tab = 'dashboardTab';
    }
  }

  _onLayout = (event) => {
    const tileWidth = this.calculateTileWidth(event.nativeEvent.layout.width);
    if (tileWidth !== this.state.tileWidth) {
      this.setState({
        tileWidth,
      });
    }
  }

  calculateTileWidth(listWidth) {
    listWidth -= listMargin;
    const isPortrait = true; // okay...
    if (listWidth <= 0) {
      return;
    }
    const baseTileSize = listWidth > (isPortrait ? 400 : 800) ? 133 : 100;
    const tilesPerRow = Math.floor(listWidth / baseTileSize);
    const tileWidth = tilesPerRow === 0 ? baseTileSize : Math.floor(listWidth / tilesPerRow);
    return tileWidth;
  }

  onCloseSetting() {
    this.props.toggleSettings(false);
  }

  render() {
		// add to List props: enableEmptySections={true}, to surpress warning
    return (
			<View onLayout={this._onLayout}>
				<List
					ref="list"
					contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
					dataSource = {this.state.dataSource}
					renderRow = {this._renderRow(this.state.tileWidth)}
					pageSize = {100}
					onRefresh = {this.onRefresh}
				/>
				{
					this.props.settings.status ?
						<SettingsDetailModal isVisible={true} onClose={this.onCloseSetting} /> :
						null
				}
			</View>
    );
  }

  _renderRow(tileWidth) {
    tileWidth -= tileMargin;
    return (row, secId, rowId, rowMap) => {
      if (row.objectType !== 'sensor' && row.objectType !== 'device') {
        return <Text>unknown device or sensor</Text>;
      }

      let tileStyle = {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: tileWidth - tileMargin,
        height: tileWidth - tileMargin,
        marginTop: tileMargin,
        marginLeft: tileMargin,
        borderRadius: 2,
      };

      if (row.objectType === 'sensor') {
        return <SensorDashboardTile
					style={tileStyle}
					tileWidth={tileWidth}
					item={row.childObject}
					onPress={this.changeDisplayType}
				/>;
      }

      const deviceType = getDeviceType(row.childObject.supportedMethods);

      if (deviceType === 'TOGGLE') {
        return <ToggleDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
				/>;
      }

      if (deviceType === 'DIMMER') {
        return <DimmerDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
					setScrollEnabled={this.setScrollEnabled}
				/>;
      }

      if (deviceType === 'BELL') {
        return <BellDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
				/>;
      }

      if (deviceType === 'NAVIGATIONAL') {
        return <NavigationalDashboardTile
					item={row.childObject}
					tileWidth={tileWidth}
					style={tileStyle}
				/>;
      }

      return <ToggleDashboardTile
				style={tileStyle}
				item={row.childObject}
				tileWidth={tileWidth}
			/>;
    };
  }
}


DashboardTab.propTypes = {
  rows: React.PropTypes.array,
};

const getRows = createSelector(
  [
    ({ dashboard }) => dashboard,
    ({ devices }) => devices,
    ({ sensors }) => sensors,
  ],
	(dashboard, devices, sensors) => parseDashboardForListView(dashboard, devices, sensors)
);

function mapStateToProps(state, props) {
  return {
    rows: getRows(state),
    gateways: state.gateways,
    userProfile: getUserProfile(state),
    tab: state.navigation.tab,
    settings: state.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onChangeDisplayType: () => dispatch(changeSensorDisplayType()),
    toggleSettings: (status) => dispatch(toggleSettings(status)),
    dispatch,
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(DashboardTab);

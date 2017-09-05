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
 *
 * @providesModule GeofenceNavigator
 */

import React, {PropTypes} from 'react';
import {StackNavigator} from 'react-navigation';
import {connect} from 'react-redux';
import MainMapView from 'MainMapView';

import AddFenceAreaView from 'AddFenceAreaView';
import AddFenceArrivingView from 'AddFenceArrivingView';
import AddFenceLeavingView from 'AddFenceLeavingView';
import AddFenceTimeView from 'AddFenceTimeView';
import AddFenceTitleView from 'AddFenceTitleView';

import EditFenceMainView from 'EditFenceMainView';
import EditFenceArrivingView from 'EditFenceArrivingView';
import EditFenceLeavingView from 'EditFenceLeavingView';

import {View} from 'BaseComponents';

const RouteConfigs = {
    MainMap: {
        screen: MainMapView
    },
    EditFenceMain: {
        screen: EditFenceMainView
    },
    EditFenceArriving: {
        screen: EditFenceArrivingView
    },
    EditFenceLeaving: {
        screen: EditFenceLeavingView
    },
    AddFenceArea: {
        screen: AddFenceAreaView
    },
    AddFenceArriving: {
        screen: AddFenceArrivingView
    },
    AddFenceLeaving: {
        screen: AddFenceLeavingView
    },
    AddFenceTime: {
        screen: AddFenceTimeView
    },
    AddFenceTitle: {
        screen: AddFenceTitleView
    }
};

const StackNavigatorConfig = {
    navigationOptions: {
		header: null,
    }, 
    initialRouteName: 'MainMap',
    
};

const Navigator = StackNavigator(RouteConfigs, StackNavigatorConfig);

module.exports = Navigator;
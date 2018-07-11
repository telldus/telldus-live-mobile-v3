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

import { View, TabBar } from '../../../BaseComponents';
import i18n from '../../Translations/common';

type Props = {
};

type State = {
};

class HistoryTab extends View {
	props: Props;
	state: State;

	static navigationOptions = ({ navigation }: Object): Object => ({
		tabBarLabel: ({ tintColor }: Object): Object => (
			<TabBar
				icon="history"
				tintColor={tintColor}
				label={i18n.historyHeader}
				accessibilityLabel={i18n.deviceHistoryTab}/>
		),
		tabBarOnPress: ({scene, jumpToIndex}: Object) => {
			navigation.navigate('History');
		},
	});

	constructor(props: Props) {
		super(props);
		this.state = {
		};
	}

	componentDidMount() {
	}

	closeHistoryDetailsModal() {
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return nextProps.screenProps.currentScreen === 'History';
	}

	render(): Object {
		return (
			null
		);
	}

	getStyle(appLayout: Object): Object {
		// const { height, width } = appLayout;
		// const isPortrait = height > width;
		// const deviceWidth = isPortrait ? width : height;

		return {
		};
	}

}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		dispatch,
	};
}

function mapStateToProps(state: Object, ownProps: Object): Object {
	const id = ownProps.navigation.getParam('id', null);
	const sensor = state.sensors.byId[id];

	return {
		sensor,
		showModal: state.modal.openModal,
	};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HistoryTab);

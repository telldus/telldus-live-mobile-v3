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
import { List, ListDataSource, View } from 'BaseComponents';
import type { ScheduleProps } from './ScheduleScreen';
import ActionRow from './SubViews/ActionRow';

const METHODS = [1, 2, 16];

type State = {
	dataSource: Object,
};

export default class Action extends View<null, ScheduleProps, State> {

	static propTypes = {
		navigation: PropTypes.object,
		actions: PropTypes.object,
		onDidMount: PropTypes.func,
	};

	state = {
		dataSource: new ListDataSource({
			rowHasChanged: (r1: Object, r2: Object): boolean => r1 !== r2,
		}).cloneWithRows(METHODS),
	};

	constructor(props: ScheduleProps) {
		super(props);

		this.h1 = '2. Action';
		this.h2 = 'Choose an action to execute';
		this.infoButton = {
			tmp: true, // TODO: fill with real fields
		};
	}

	componentDidMount() {
		const { h1, h2, infoButton } = this;
		this.props.onDidMount(h1, h2, infoButton);
	}

	selectAction = (action: number) => {
		this.props.actions.selectAction(action);
		this.props.navigation.navigate('Time');
	};

	navigateToDim = () => {
		this.props.navigation.navigate('ActionDim');
	};

	render() {
		return (
			<List
				dataSource={this.state.dataSource}
				renderRow={this._renderRow}
			/>
		);
	}

	_renderRow = (method: number): Object => {
		return <ActionRow method={method} onPress={this._handlePress}/>;
	};

	_handlePress = (row: Object): void => {
		if (row.name === 'Dim') {
			return this.navigateToDim();
		}
		this.selectAction(row.method);
	};

}

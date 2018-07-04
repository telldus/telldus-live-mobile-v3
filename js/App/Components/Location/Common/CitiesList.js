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
 *
 */

// @flow

'use strict';

import React from 'react';

import {View, List, ListDataSource} from '../../../../BaseComponents';
import ListRow from './SubViews/ListRow';

type Props = {
	appLayout: Object,
	onSubmit: (string) => void,
	navigation: Object,
};

type State = {
	dataSource: Object,
};

const listDataSource = new ListDataSource({
	rowHasChanged: (r1: Object, r2: Object): boolean => r1 !== r2,
});

class CitiesList extends View {
	renderRow: (string) => void;
	parseDataForList: (Array<string>) => Object;
	onCityChoose: () => void;

	props: Props;
	state: State;

	constructor(props: Props) {
		super(props);
		this.state = {
			dataSource: this.parseDataForList(props.navigation.getParam('cities', {})),
		};
		this.renderRow = this.renderRow.bind(this);
		this.parseDataForList = this.parseDataForList.bind(this);
		this.onCityChoose = this.onCityChoose.bind(this);
	}

	parseDataForList(data: Array<string>): Object {
		return listDataSource.cloneWithRows(data);
	}

	onCityChoose(city: string) {
		let { onSubmit } = this.props;
		if (onSubmit) {
			onSubmit(city);
		}
	}

	renderRow(item: Object): Object {
		item = item.split('/');
		item = item[1];
		return (
			<ListRow item={item} appLayout={this.props.appLayout} onPress={this.onCityChoose}/>
		);
	}

	render(): Object {

		return (
			<View style={{flex: 1}}>
				<List
					contentContainerStyle={{paddingTop: 20, justifyContent: 'center'}}
					dataSource={this.state.dataSource}
					renderRow={this.renderRow}
					key={this.props.appLayout.width}
				/>
			</View>
		);
	}
}

export default CitiesList;

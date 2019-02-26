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
import uniqBy from 'lodash/uniqBy';
import {
	FlatList,
} from 'react-native';

import timeZone from '../../../Lib/TimeZone';
import {View} from '../../../../BaseComponents';
import ListRow from './SubViews/ListRow';

type Props = {
	appLayout: Object,
	onSubmit: (string) => void,
};

class ContinentsList extends View {
	props: Props;

	keyExtractor: (Object) => number;
	renderRow: (string) => void;
	onContinentChoose: (string) => void;

	constructor(props: Props) {
		super(props);

		this.renderRow = this.renderRow.bind(this);
		this.onContinentChoose = this.onContinentChoose.bind(this);
		this.keyExtractor = this.keyExtractor.bind(this);
	}

	parseDataForList(data: Array<string>): Array<string> {
		return uniqBy(data, (value: string): string => {
			let items = value.split('/');
			return items[0];
		});
	}

	onContinentChoose(continent: string) {
		let { onSubmit } = this.props;
		if (onSubmit) {
			onSubmit(continent);
		}
	}

	renderRow({item}: Object): Object {
		item = item.split('/');
		return (
			<ListRow item={item[0]} onPress={this.onContinentChoose} appLayout={this.props.appLayout}/>
		);
	}

	keyExtractor(item: string): string {
		return item;
	}

	render(): Object {
		const { appLayout } = this.props;

		return (
			<View style={{flex: 1}}>
				<FlatList
					contentContainerStyle={{paddingTop: 20, justifyContent: 'center'}}
					data={this.parseDataForList(timeZone)}
					renderItem={this.renderRow}
					numColumns={1}
					keyExtractor={this.keyExtractor}
					extraData={appLayout.width}
				/>
			</View>
		);
	}
}

export default ContinentsList;

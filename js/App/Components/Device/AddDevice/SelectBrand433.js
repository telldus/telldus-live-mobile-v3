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
 */

// @flow

'use strict';

import React from 'react';
import { FlatList } from 'react-native';

import {
	View,
} from '../../../../BaseComponents';
import { Row } from './SubViews';
import { utils } from 'live-shared-data';
const { addDevice433MHz: {getVendorsList} } = utils;

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	currentScreen: string,
	route: Object,

    navigation: Object,
    appLayout: Object,
    onDidMount: (string, string, ?Object) => void,
	actions: Object,
	intl: Object,
};

type State = {
    rows: Array<Object>,
};

class SelectBrand433 extends View<Props, State> {
props: Props;
state: State;

renderRow: (Object) => Object;
onChooseLocation: (Object) => void;
constructor(props: Props) {
	super(props);

	this.state = {
		rows: getVendorsList(),
	};
	this.renderRow = this.renderRow.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.brand), formatMessage(i18n.selectBrandOfD));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'SelectBrand433';
}

keyExtractor(item: Object, i: number): string {
	return `${item.name}${i}`;
}

getPadding(): number {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	return deviceWidth * Theme.Core.paddingFactor;
}

onChooseBrand = ({deviceBrand}: Object) => {
	const { navigation, route } = this.props;

	const prevParams = route.params || {};
	navigation.push('SelectModel433', {
		...prevParams,
		deviceBrand,
		shortcutToTelldus: false,
	});
}

renderRow(item: Object): Object {
	const { navigation, intl } = this.props;
	const {
		name,
		imageSource,
	} = item.item;

	return (
		<Row
			name={name}
			img={imageSource}
			rowProps={{
				deviceBrand: name,
			}}
			navigation={navigation}
			intl={intl}
			onPress={this.onChooseBrand}
			isLast={item.index === (this.state.rows.length - 1)}/>
	);
}

render(): Object {
	const padding = this.getPadding();
	const { rows } = this.state;

	return (
		<FlatList
			data={rows}
			renderItem={this.renderRow}
			keyExtractor={this.keyExtractor}
			contentContainerStyle={{
				paddingVertical: padding,
			}}
		/>
	);
}
}

export default (SelectBrand433: Object);

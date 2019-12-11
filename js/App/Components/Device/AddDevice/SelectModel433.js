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
const { Devices433MHz } = utils;

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	currentScreen: string,

    navigation: Object,
    appLayout: Object,
    onDidMount: (string, string, ?Object) => void,
	actions: Object,
	intl: Object,
};

type State = {
    rows: Array<Object>,
};

const prepareDataForList = (data: Array<Object>, brand: string): Array<Object> => {
	let listData = [];
	for (let i = 0; i < data[0].vendor.length; i++) {
		const { name = '', device } = data[0].vendor[i];
		if (name.trim() === brand.trim()) {
			listData = device;
			break;
		}
	}
	return listData;
};

class SelectModel433 extends View<Props, State> {
props: Props;
state: State;

renderRow: (Object) => Object;
onRefresh: () => void;
onChooseLocation: (Object) => void;
constructor(props: Props) {
	super(props);

	const deviceBrand = props.navigation.getParam('deviceBrand', '');
	this.state = {
		rows: prepareDataForList(Devices433MHz, deviceBrand),
	};
	this.renderRow = this.renderRow.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.labelModel), formatMessage(i18n.selectModelOfD));
}

shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
	return nextProps.currentScreen === 'SelectModel433';
}

keyExtractor(item: Object): string {
	return `${item.name}${item.index}`;
}

getPadding(): number {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	return deviceWidth * Theme.Core.paddingFactor;
}

onChooseModel = (deviceModel: string) => {
	const { navigation } = this.props;

	const prevParams = navigation.state.params || {};
	navigation.navigate('Include433', {
		...prevParams,
		deviceModel,
	});
}

prepareName = (lang: Array<Object> = [], modelNameDef: string): string => {
	const { locale } = this.props;
	let name = modelNameDef;
	for (let i = 0; i < lang.length; i++) {
		if (lang[i].lang === locale) {
			name = lang[i].modelName;
		}
	}
	return name;
}

renderRow(item: Object): Object {
	const { navigation, intl } = this.props;
	const {
		lang,
		modelName,
	} = item.item;

	return (
		<Row
			name={this.prepareName(lang, modelName)}
			navigation={navigation}
			intl={intl}
			onPress={this.onChooseModel}
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

export default SelectModel433;

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
import { FlatList, ScrollView } from 'react-native';

import {
	View,
	Text,
} from '../../../../BaseComponents';
import { Row, ShortcutRow } from './SubViews';
import { utils } from 'live-shared-data';
const { Devices433MHz, images } = utils;

const { DEVICES } = images;

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	currentScreen: string,
	locale: string,

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
	for (let h = 0; h < data.length; h++) {
		for (let i = 0; i < data[h].vendor.length; i++) {
			const { name = '', device } = data[h].vendor[i];
			if (name.trim() === brand.trim()) {
				listData = device;
				break;
			}
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

	const shortcutToTelldus = props.navigation.getParam('shortcutToTelldus', false);
	const deviceBrand = shortcutToTelldus ? 'Telldus' : props.navigation.getParam('deviceBrand', '');
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

keyExtractor(item: Object, i: number): string {
	return `${item.modelName}${item.widget}${i}`;
}

onChooseModel = (deviceInfo: Object) => {
	const { navigation, actions } = this.props;

	actions.setWidgetParamId(deviceInfo.widget);

	const prevParams = navigation.state.params || {};
	navigation.navigate('SetDeviceName433', {
		...prevParams,
		deviceInfo,
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
		image = '',
	} = item.item;

	const img = DEVICES[`d_${image.replace(/-/g, '_')}`];

	return (
		<Row
			name={this.prepareName(lang, modelName)}
			img={img}
			navigation={navigation}
			intl={intl}
			rowProps={{
				...item.item,
			}}
			onPress={this.onChooseModel}
			isLast={item.index === (this.state.rows.length - 1)}/>
	);
}

onPressShortcutRow = (deviceInfo: Object) => {
	const { navigation, actions } = this.props;

	actions.setWidgetParamId(deviceInfo.widget);

	const prevParams = navigation.state.params || {};
	navigation.navigate('SetDeviceName433', {
		...prevParams,
		shortcutToTelldus: false,
		deviceInfo,
	});
}

onPressOtherBrand = () => {
	const { navigation } = this.props;
	const prevParams = navigation.state.params || {};
	navigation.navigate('SelectBrand433', {
		...prevParams,
	});
}

renderRowShortcut = (data: Object, key: number): Object => {
	const {
		image,
		modelName,
		lang,
	} = data;

	const img = DEVICES[`d_${image.replace(/-/g, '_')}`];

	return (
		<ShortcutRow
			name={this.prepareName(lang, modelName)}
			img={img}
			rowProps={{
				...data,
			}}
			onPress={this.onPressShortcutRow}
			key={key}/>
	);
}

render(): Object {
	const {
		padding,
		shortCutItemsCover,
		clickTextStyle,
	} = this.getStyles();
	const { rows } = this.state;

	const { navigation } = this.props;
	const shortcutToTelldus = navigation.getParam('shortcutToTelldus', false);
	if (shortcutToTelldus) {
		const telldusDevices = rows.map((data: Object, i: number): Object => {
			return this.renderRowShortcut(data, i);
		});
		return (
			<ScrollView
				style={{
					flex: 1,
				}}
				contentContainerStyle={{
					flexGrow: 1,
					paddingVertical: padding,
				}}>
				<View style={shortCutItemsCover}>
					{telldusDevices}
					<Text style={clickTextStyle} onPress={this.onPressOtherBrand}>
							Click here to show devices from other brands
					</Text>
				</View>
			</ScrollView>
		);
	}

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

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const padding = deviceWidth * Theme.Core.paddingFactor;

	const fontSize = deviceWidth * 0.038;

	return {
		padding,
		shortCutItemsCover: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'center',
			paddingRight: padding / 2,
		},
		clickTextStyle: {
			fontSize,
			color: Theme.Core.textColor,
			padding,
			marginVertical: padding,
		},
	};
}

}

export default SelectModel433;

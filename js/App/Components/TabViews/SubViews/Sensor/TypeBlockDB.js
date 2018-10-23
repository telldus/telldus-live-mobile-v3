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

import {
	View,
} from '../../../../../BaseComponents';
import TypeBlock from './TypeBlock';

type Props = {
	defaultType?: string,
	lastUpdated: number,

    style: Array<any> | number | Object,
	valueCoverStyle: Array<any> | number | Object,
	dotStyle: Object,
	dotCoverStyle: Array<any> | number | Object,
    sensors: Object,
	id: number,
	onPress: () => void,
};

class TypeBlockDB extends View<Props, null> {
props: Props;
changeDisplayType: () => void;

constructor(props: Props) {
	super(props);

	this.changeDisplayType = this.changeDisplayType.bind(this);
}

shouldComponentUpdate(nextProps: Object): boolean {
	// The component needs to update when default type change or when sensor value change.
	// 'lastUpdated' is used to check if value changed or not.
	const { defaultType, lastUpdated } = this.props;
	const typeChanged = defaultType !== nextProps.defaultType;

	const newUpdate = lastUpdated !== nextProps.lastUpdated;
	return typeChanged || newUpdate;
}

changeDisplayType() {
	this.props.onPress();
}

getSupportedDisplayTypes(sensors: Object): Array<string> {
	return Object.keys(sensors);
}

getDefaultType(sensors: Object): string {
	const { defaultType } = this.props;
	if (defaultType && sensors[defaultType]) {
		return defaultType;
	}
	const totalTypes = this.getSupportedDisplayTypes(sensors);
	return totalTypes[0];
}

render(): Object {
	const { style, sensors, valueCoverStyle, dotCoverStyle, dotStyle } = this.props;
	let defaultType = null, defaultSensor = null, totalTypes = this.getSupportedDisplayTypes(sensors);
	if (totalTypes.length > 0) {
		defaultType = this.getDefaultType(sensors);
		defaultSensor = sensors[defaultType];
	}

	const props = {
		...this.props,
		valueCoverStyle,
		style,
		dotCoverStyle,
		dotStyle,
		defaultSensor,
		defaultType,
		totalTypes,
		changeDisplayType: this.changeDisplayType,
	};

	return (
		<TypeBlock
			{...props}/>
	);
}
}

function prepareDefaultDisplayType(defaultSettings: Object): string | null {
	if (!defaultSettings || !defaultSettings.displayTypeDB) {
		return null;
	}
	return defaultSettings.displayTypeDB;
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { defaultSensorSettings } = store.sensorsList;
	const defaultSettings = defaultSensorSettings[ownProps.id];
	const defaultType = prepareDefaultDisplayType(defaultSettings);
	return {
		defaultType,
	};
}

export default connect(mapStateToProps, null)(TypeBlockDB);

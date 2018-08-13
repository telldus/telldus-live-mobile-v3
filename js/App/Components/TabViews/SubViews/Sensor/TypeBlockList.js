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
import { LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';

import {
	View,
} from '../../../../../BaseComponents';
import TypeBlock from './TypeBlock';
import { changeDefaultDisplayType } from '../../../../Actions';
import {
	LayoutAnimations,
} from '../../../../Lib';

type Props = {
	defaultType?: string,

    style: Array<any> | number | Object,
	valueCoverStyle: Array<any> | number | Object,
	dotStyle: Object,
	dotCoverStyle: Array<any> | number | Object,
    sensors: Object,
    onLayout: Function,
    changeDefaultDisplayType: Function,
	id: number,
	isOpen: boolean,
	closeSwipeRow: () => void,
};

class TypeBlockList extends View<Props, null> {
props: Props;
changeDisplayType: () => void;

constructor(props: Props) {
	super(props);

	this.changeDisplayType = this.changeDisplayType.bind(this);
}

changeDisplayType() {
	const { sensors, id, isOpen, closeSwipeRow } = this.props;
	if (isOpen && closeSwipeRow) {
		closeSwipeRow();
		return;
	}
	const totalTypes = this.getSupportedDisplayTypes(sensors);
	const defaultType = this.getDefaultType(sensors);
	const max = totalTypes.length;
	const currentTypeIndex = totalTypes.indexOf(defaultType);
	const nextTypeIndex = currentTypeIndex + 1;
	const nextType = nextTypeIndex > (max - 1) ? totalTypes[0] : totalTypes[nextTypeIndex];
	LayoutAnimation.configureNext(LayoutAnimations.SensorChangeDisplay);
	this.props.changeDefaultDisplayType(id, nextType);
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
	if (!defaultSettings || !defaultSettings.displayType) {
		return null;
	}
	return defaultSettings.displayType;
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { defaultSensorSettings } = store.sensorsList;
	const defaultSettings = defaultSensorSettings[ownProps.id];
	const defaultType = prepareDefaultDisplayType(defaultSettings);
	return {
		defaultType,
	};
}

function mapDispatchToProps(dispatch: Function): Object {
	return {
		changeDefaultDisplayType: (id: number, displayType: string): any => {
			return dispatch(changeDefaultDisplayType(id, displayType));
		},
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(TypeBlockList);

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
import { TouchableOpacity, Animated, UIManager, LayoutAnimation } from 'react-native';
import { connect } from 'react-redux';

import {
	View,
} from '../../../../../BaseComponents';
import { changeDefaultDisplayType } from '../../../../Actions';
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type Props = {
    style: Array<any> | number | Object,
    valueCoverStyle: Array<any> | number | Object,
    sensors: Object,
    defaultType?: string,
    onLayout: Function,
    changeDefaultDisplayType: Function,
    id: number,
};

class TypeBlock extends View<Props, null> {
props: Props;
changeDisplayType: () => void;

constructor(props: Props) {
	super(props);

	this.changeDisplayType = this.changeDisplayType.bind(this);
	UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
	this.LayoutLinear = {
		duration: 200,
		create: {
			type: LayoutAnimation.Types.linear,
			property: LayoutAnimation.Properties.scaleXY,
			  },
		update: {
			type: LayoutAnimation.Types.linear,
			property: LayoutAnimation.Properties.scaleXY,
		},
	};
}

changeDisplayType() {
	const { sensors, id } = this.props;
	const totalTypes = this.getSupportedDisplayTypes(sensors);
	const defaultType = this.getDefaultType(sensors);
	const max = totalTypes.length;
	const currentTypeIndex = totalTypes.indexOf(defaultType);
	const nextTypeIndex = currentTypeIndex + 1;
	const nextType = nextTypeIndex > (max - 1) ? totalTypes[0] : totalTypes[nextTypeIndex];
	LayoutAnimation.configureNext(this.LayoutLinear);
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
	const { style, sensors, valueCoverStyle } = this.props;
	let defaultSensor = null, totalTypes = this.getSupportedDisplayTypes(sensors);
	if (totalTypes.length > 0) {
		const defaultType = this.getDefaultType(sensors);
		defaultSensor = sensors[defaultType];
	}

	return (
		<AnimatedTouchable
			onPress={this.changeDisplayType}
			accessible={false}
			disabled={totalTypes.length <= 1}
			onLayout={this.props.onLayout}
			style={style}
			importantForAccessibility="no-hide-descendants">
			<View
				style={valueCoverStyle}
				importantForAccessibility="no-hide-descendants">
				{defaultSensor}
			</View>
		</AnimatedTouchable>
	);
}
}

function mapStateToProps(store: Object, ownProps: Object): Object {
	const { defaultTypeById } = store.sensorsList;
	const defaultType = defaultTypeById[ownProps.id];
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

export default connect(mapStateToProps, mapDispatchToProps)(TypeBlock);

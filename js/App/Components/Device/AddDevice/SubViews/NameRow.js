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

import {
	View,
	EditBox,
} from '../../../../../BaseComponents';

type Props = {
	value: string,
	appLayout: Object,

    id: number,
    header?: Object,
    label?: string,
    placeholder: string,
    submitName: () => void,
    containerStyle: number | Object,
	autoFocus?: boolean,
	onChangeName: (string, number) => void,
	setRef: (ref: any, id: number) => void,
};

class NameRow extends View<Props, null> {
props: Props;

submitName: () => void;
onChangeName: (string) => void;
setRef: (any) => void;
constructor(props: Props) {
	super(props);

	this.submitName = this.submitName.bind(this);
	this.onChangeName = this.onChangeName.bind(this);
	this.setRef = this.setRef.bind(this);
}

onChangeName(deviceName: string) {
	const { onChangeName, id } = this.props;
	if (onChangeName && typeof onChangeName === 'function') {
		onChangeName(deviceName, id);
	}
}

submitName() {
	const { submitName } = this.props;
	if (submitName && typeof submitName === 'function') {
		submitName();
	}
}

setRef(ref: any) {
	const { setRef, id } = this.props;
	if (setRef && typeof setRef === 'function') {
		setRef(ref, id);
	}
}

render(): Object {
	const { appLayout, value, header, label, placeholder, containerStyle, autoFocus } = this.props;

	return (
		<EditBox
			value={value}
			setRef={this.setRef}
			icon={'device-alt'}
			label={label}
			header={header}
			onChangeText={this.onChangeName}
			onSubmitEditing={this.submitName}
			appLayout={appLayout}
			placeholder={placeholder}
			containerStyle={containerStyle}
			autoFocus={autoFocus}/>
	);
}
}

export default NameRow;

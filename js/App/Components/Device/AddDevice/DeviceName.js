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
} from '../../../../BaseComponents';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,

    intl: Object,
    onDidMount: (string, string, ?Object) => void,
};

type State = {
    deviceName: string,
};

class DeviceName extends View<Props, State> {
props: Props;
state: Styate;

onChangeName: (string) => void;
submitName: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		deviceName: '',
	};
	this.onChangeName = this.onChangeName.bind(this);
	this.submitName = this.submitName.bind(this);
}

componentDidMount() {
	const { onDidMount } = this.props;
	onDidMount('4. Name', 'Choose a name for your device');
}

onChangeName(deviceName: string) {
	this.setState({
		deviceName,
	});
}

submitName() {

}

render(): Object {
	const { deviceName } = this.state;
	const { appLayout, intl } = this.props;
	const {
		container,
	} = this.getStyles();
	return (
		<View style={container}>
			<EditBox
				value={deviceName}
				icon={'device'}
				label={intl.formatMessage(i18n.name)}
				onChangeText={this.onChangeName}
				onSubmitEditing={this.submitName}
				appLayout={appLayout}
			/>
		</View>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const { paddingFactor } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	return {
		container: {
			flex: 1,
			padding: padding,
		},
	};
}
}

export default DeviceName;

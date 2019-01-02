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
import { TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { intlShape } from 'react-intl';

import {
	View,
	IconTelldus,
	Text,
} from '../../../../BaseComponents';
import AdvancedSettings from './AdvancedSettings';

import Theme from '../../../Theme';

import i18n from '../../../Translations/common';

type Props = {
	retries: number,
	retryInterval: number,
	reps: number,
    appLayout: Object,

    intl: intlShape.isRequired,
	onPressInfo: (string, any) => void,
    onDoneEditAdvanced: (Object) => void,
    onToggleAdvanced: (boolean) => void,
};

type State = {
    showAdvanced: boolean,
};

export default class AdvancedSettingsBlock extends View<null, Props, State> {
props: Props;
state: State;

toggleAdvanced: () => void;
constructor(props: Props) {
	super(props);

	this.state = {
		showAdvanced: false,
	};

	this.toggleAdvanced = this.toggleAdvanced.bind(this);
}

toggleAdvanced() {
	const { showAdvanced } = this.state;
	this.setState({
		showAdvanced: !showAdvanced,
	}, () => {
		const { onToggleAdvanced } = this.props;
		if (onToggleAdvanced) {
			onToggleAdvanced(this.state.showAdvanced);
		}
	});
}

render(): Object {
	const { showAdvanced } = this.state;
	const { intl } = this.props;

	const {
		settingsTextStyle,
		iconSettingsStyle,
		toggleAdvancedCover,
	} = this.getStyles();

	return (
		<KeyboardAvoidingView
			behavior="padding"
			style={{flex: 1}}
			contentContainerStyle={{flexGrow: 1}}>
			<TouchableOpacity
				onPress={this.toggleAdvanced}
				style={toggleAdvancedCover}>
				<IconTelldus icon={'settings'} style={iconSettingsStyle}/>
				<Text style={settingsTextStyle}>
					{showAdvanced ?
						intl.formatMessage(i18n.labelHideAdvanced)
						:
						intl.formatMessage(i18n.labelShowAdvanced)
					}
				</Text>
			</TouchableOpacity>
			{showAdvanced && (
				<AdvancedSettings
					{...this.props}/>
			)}
		</KeyboardAvoidingView>
	);
}

getStyles(): Object {
	const { appLayout } = this.props;
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const { paddingFactor, brandSecondary } = Theme.Core;

	const padding = deviceWidth * paddingFactor;
	return {
		toggleAdvancedCover: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			paddingVertical: 4 + padding,
		},
		iconSettingsStyle: {
			fontSize: deviceWidth * 0.040666667,
			color: brandSecondary,
			marginRight: 8,
		},
		settingsTextStyle: {
			fontSize: deviceWidth * 0.040666667,
			color: brandSecondary,
		},
	};
}
}

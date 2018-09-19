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
import { intlShape } from 'react-intl';

import {
	View,
	SettingsRow,
} from '../../../../BaseComponents';

import { LayoutAnimations } from '../../../Lib';
import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,

    intl: intlShape.isRequired,
	onPressInfo: (string, any) => void,
	onDoneEditAdvanced: (Object) => void,
};

type State = {
	retries: string,
	retryInterval: string,
	reps: string,
	showAdvanced: boolean,
	inLineEditActive: 0 | 1 | 2 | 3,
};

class AdvancedSettings extends View<null, Props, State> {

state: State;

onPressRetriesInfo: () => void;
onPressRetriesEdit: () => void;
onPressIntervalInfo: () => void;
onPressIntervalEdit: () => void;
onPressRepeatsInfo: () => void;
onPressRepeatsEdit: () => void;

onChangeRetries: (string) => void;
onChangeInterval: (string) => void;
onChangeRepeat: (string) => void;
onDoneEdit: () => void;

constructor(props: Props) {
	super(props);

	this.state = {
		retries: 3,
		retryInterval: 5,
		reps: 1,
		showAdvanced: false,
		inLineEditActive: 0,
	};
	this.onPressRetriesInfo = this.onPressRetriesInfo.bind(this);
	this.onPressRetriesEdit = this.onPressRetriesEdit.bind(this);
	this.onPressIntervalInfo = this.onPressIntervalInfo.bind(this);
	this.onPressIntervalEdit = this.onPressIntervalEdit.bind(this);
	this.onPressRepeatsInfo = this.onPressRepeatsInfo.bind(this);
	this.onPressRepeatsEdit = this.onPressRepeatsEdit.bind(this);

	this.onChangeRetries = this.onChangeRetries.bind(this);
	this.onChangeInterval = this.onChangeInterval.bind(this);
	this.onChangeRepeat = this.onChangeRepeat.bind(this);
	this.onDoneEdit = this.onDoneEdit.bind(this);
}

onPressRetriesInfo() {
	const extras = {
		dialogueHeader: 'Number of retries',
		showPositive: false,
		showNegative: false,
		imageHeader: true,
		showIconOnHeader: true,
	};
	this.props.onPressInfo('Number of retries How many times the schedule will try again if your location is ' +
'offline when the schedule should run.If your location is online, the schedule will only run once.', extras);
}

onPressIntervalInfo() {
	const extras = {
		dialogueHeader: 'Number of retries',
		showPositive: false,
		showNegative: false,
		imageHeader: true,
		showIconOnHeader: true,
	};
	this.props.onPressInfo('Retry interval The interval, in minutes, between retries if your location is ' +
'offline when the schedule should run. The location must come online within \'number of retries\' * \'interval\' for ' +
'the schedule to run.', extras);
}

onPressRepeatsInfo() {
	const extras = {
		dialogueHeader: 'Number of retries',
		showPositive: false,
		showNegative: false,
		imageHeader: true,
		showIconOnHeader: true,
	};
	this.props.onPressInfo('Repeats Number of times a schedule command will be resent from the location. ' +
'Default value is 1 time, but it may be set to a maximum of 10, if the location for example is placed in an ' +
'environment with a lot of interference. There will be a 3 second pause between each resend.', extras);
}

animate() {
	LayoutAnimation.configureNext(LayoutAnimations.linearCUD(300));
}

onPressRetriesEdit() {
	this.animate();
	this.setState({
		inLineEditActive: 1,
	});
}

onPressIntervalEdit() {
	this.animate();
	this.setState({
		inLineEditActive: 2,
	});
}

onPressRepeatsEdit() {
	this.animate();
	this.setState({
		inLineEditActive: 3,
	});
}

onDoneEdit() {
	this.animate();
	this.setState({
		inLineEditActive: 0,
	});
	const { retries, retryInterval, reps } = this.state;
	this.props.onDoneEditAdvanced({ retries, retryInterval, reps });
}

onChangeRetries(retries: string) {
	this.setState({
		retries: retries ? parseInt(retries, 10) : 0,
	});
}

onChangeInterval(retryInterval: string) {
	this.setState({
		retryInterval: retryInterval ? parseInt(retryInterval, 10) : 0,
	});
}

onChangeRepeat(reps: string) {
	this.setState({
		reps: reps ? parseInt(reps, 10) : 0,
	});
}

render(): React$Element<any> {
	const { retries, retryInterval, reps, inLineEditActive } = this.state;
	const { appLayout, intl } = this.props;
	const { formatMessage } = intl;

	const { iconValueRightSize } = this._getStyle(appLayout);

	return (
		<View style={{flex: 1}}>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={inLineEditActive === 1}
				label={formatMessage(i18n.labelNumberOfRetries)}
				value={retries}
				appLayout={appLayout}
				iconLabelRight={'help'}
				iconValueRight={inLineEditActive === 1 ? 'done' : 'edit'}
				onPress={false}
				iconValueRightSize={inLineEditActive === 1 ? iconValueRightSize : null}
				onPressIconLabelRight={this.onPressRetriesInfo}
				onPressIconValueRight={inLineEditActive === 1 ? this.onDoneEdit : this.onPressRetriesEdit}
				onChangeText={this.onChangeRetries}
				onSubmitEditing={this.onDoneEdit}/>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={inLineEditActive === 2}
				label={formatMessage(i18n.labelRetryInterval)}
				value={retryInterval}
				appLayout={appLayout}
				iconLabelRight={'help'}
				iconValueRight={inLineEditActive === 2 ? 'done' : 'edit'}
				onPress={false}
				iconValueRightSize={inLineEditActive === 2 ? iconValueRightSize : null}
				onPressIconLabelRight={this.onPressIntervalInfo}
				onPressIconValueRight={inLineEditActive === 2 ? this.onDoneEdit : this.onPressIntervalEdit}
				onChangeText={this.onChangeInterval}
				onSubmitEditing={this.onDoneEdit}/>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={inLineEditActive === 3}
				label={formatMessage(i18n.labelRepeats)}
				value={reps}
				appLayout={appLayout}
				iconLabelRight={'help'}
				iconValueRight={inLineEditActive === 3 ? 'done' : 'edit'}
				onPress={false}
				iconValueRightSize={inLineEditActive === 3 ? iconValueRightSize : null}
				onPressIconLabelRight={this.onPressRepeatsInfo}
				onPressIconValueRight={inLineEditActive === 3 ? this.onDoneEdit : this.onPressRepeatsEdit}
				onChangeText={this.onChangeRepeat}
				onSubmitEditing={this.onDoneEdit}/>
		</View>
	);
}

_getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;


	return {
		iconValueRightSize: deviceWidth * 0.05,
	};
};

}

export default AdvancedSettings;

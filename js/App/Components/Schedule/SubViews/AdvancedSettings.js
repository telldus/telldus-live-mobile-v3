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
	retries: number,
	retryInterval: number,
	reps: number,
    appLayout: Object,

    intl: intlShape.isRequired,
	onPressInfo: (Object) => void,
	onDoneEditAdvanced: (Object) => void,
};

type State = {
	retries: number,
	retryInterval: number,
	reps: number,
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

	const { retries = 3, retryInterval = 5, reps = 1 } = this.props;

	this.state = {
		retries: parseInt(retries, 10),
		retryInterval: parseInt(retryInterval, 10),
		reps: parseInt(reps, 10),
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
	const { formatMessage } = this.props.intl;
	const message = `${formatMessage(i18n.retriesInfoPhraseOne)}.\n\n${formatMessage(i18n.retriesInfoPhraseTwo)}.`;
	const extras = {
		show: true,
		showHeader: true,
		header: formatMessage(i18n.labelNumberOfRetries),
		text: message,
		showPositive: false,
		showNegative: false,
		imageHeader: true,
		showIconOnHeader: true,
		closeOnPressHeader: true,
	};
	this.props.onPressInfo(extras);
}

onPressIntervalInfo() {
	const { formatMessage } = this.props.intl;
	const message = `${formatMessage(i18n.intervalInfoPhraseOne)}.\n\n${formatMessage(i18n.intervalInfoPhraseTwo)}.`;
	const extras = {
		show: true,
		showHeader: true,
		header: formatMessage(i18n.labelRetryInterval),
		text: message,
		showPositive: false,
		showNegative: false,
		imageHeader: true,
		showIconOnHeader: true,
		closeOnPressHeader: true,
	};
	this.props.onPressInfo(extras);
}

onPressRepeatsInfo() {
	const { formatMessage } = this.props.intl;
	const message = `${formatMessage(i18n.repeatInfoPhraseOne)}.\n\n${formatMessage(i18n.repeatInfoPhraseTwo)}.`;
	const extras = {
		show: true,
		showHeader: true,
		header: formatMessage(i18n.labelRepeats),
		text: message,
		showPositive: false,
		showNegative: false,
		imageHeader: true,
		showIconOnHeader: true,
		closeOnPressHeader: true,
	};
	this.props.onPressInfo(extras);
}

animate() {
	LayoutAnimation.configureNext(LayoutAnimations.linearU(300));
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
				onSubmitEditing={this.onDoneEdit}
				intl={intl}/>
			<SettingsRow
				type={'text'}
				edit={false}
				inLineEditActive={inLineEditActive === 2}
				label={formatMessage(i18n.labelRetryInterval)}
				value={retryInterval}
				valuePostfix={formatMessage(i18n.minutes).toLowerCase()}
				appLayout={appLayout}
				iconLabelRight={'help'}
				iconValueRight={inLineEditActive === 2 ? 'done' : 'edit'}
				onPress={false}
				iconValueRightSize={inLineEditActive === 2 ? iconValueRightSize : null}
				onPressIconLabelRight={this.onPressIntervalInfo}
				onPressIconValueRight={inLineEditActive === 2 ? this.onDoneEdit : this.onPressIntervalEdit}
				onChangeText={this.onChangeInterval}
				onSubmitEditing={this.onDoneEdit}
				intl={intl}/>
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
				onSubmitEditing={this.onDoneEdit}
				style={{marginBottom: 5}}
				intl={intl}/>
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

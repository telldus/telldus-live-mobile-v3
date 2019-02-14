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
} from '../../../../BaseComponents';

import { CantEnterInclusionExclusionUI } from '../Common';

import i18n from '../../../Translations/common';

type Props = {
    appLayout: Object,

    intl: Object,
	onDidMount: (string, string, ?Object) => void,
	actions: Object,
	navigation: Object,
};

class CantEnterInclusion extends View<Props, null> {
props: Props;

onPressExit: () => void;
constructor(props: Props) {
	super(props);

	this.onPressExit = this.onPressExit.bind(this);
}

componentDidMount() {
	const { onDidMount, intl } = this.props;
	const { formatMessage } = intl;
	onDidMount(formatMessage(i18n.cantInclude), formatMessage(i18n.cantEnterInclusionTwo));
}

onPressExit() {
	const { navigation } = this.props;
	const { params = {}} = navigation.state;
	navigation.navigate({
		routeName: 'Devices',
		key: 'Devices',
		params,
	});
}

render(): Object {
	const { intl, appLayout } = this.props;
	const { formatMessage } = intl;

	return (
		<CantEnterInclusionExclusionUI
			infoMessage={formatMessage(i18n.couldNotEnterInclusionInfo)}
			onPressExit={this.onPressExit}
			appLayout={appLayout}
		/>
	);
}
}

export default CantEnterInclusion;

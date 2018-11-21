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

import {
	View,
	DropDown,
} from '../../../../BaseComponents';

import shouldUpdate from '../../../Lib/shouldUpdate';

import i18n from '../../../Translations/common';

type Props = {
	appLayout: Object,
	smoothing: boolean,

	intl: Object,
	onValueChange: (string, number, Array<any>) => void,
};

export default class SmoothingDropDown extends View<Props, null> {
	props: Props;
	constructor(props: Props) {
		super(props);

		const { formatMessage } = this.props.intl;
		this.on = formatMessage(i18n.on);
		this.off = formatMessage(i18n.off);
		this.DDLabel = formatMessage(i18n.labelSmoothing);
		this.Options = [{ key: true, value: this.on }, { key: false, value: this.off }];
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(this.props, nextProps, ['smoothing', 'appLayout']);
	}

	render(): Object {
		const { appLayout, smoothing, onValueChange } = this.props;

		return (
			<DropDown
				items={this.Options}
				value={smoothing ? this.on : this.off}
				label={this.DDLabel}
				onValueChange={onValueChange}
				appLayout={appLayout}
			/>
		);
	}
}

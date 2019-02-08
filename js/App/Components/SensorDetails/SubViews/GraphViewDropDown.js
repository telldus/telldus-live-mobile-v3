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

import Theme from '../../../Theme';
type Props = {
	appLayout: Object,
	graphView: 'overview' | 'detailed',

	intl: Object,
	onValueChange: (string, number, Array<any>) => void,
};

type DefaultProps = {
	graphView: 'overview' | 'detailed',
};

export default class GraphViewDropDown extends View<Props, null> {
	props: Props;

	static defaultProps: DefaultProps = {
		graphView: 'detailed',
	};

	constructor(props: Props) {
		super(props);

		const { formatMessage } = this.props.intl;
		this.overview = formatMessage(i18n.overviewHeader);
		this.detailed = formatMessage(i18n.labelDetailed);
		this.DDLabel = formatMessage(i18n.labelView);
		this.Options = [{ key: 'overview', value: this.overview }, { key: 'detailed', value: this.detailed }];
	}

	shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
		return shouldUpdate(this.props, nextProps, ['graphView', 'appLayout']);
	}

	render(): Object {
		const { appLayout, graphView, onValueChange } = this.props;
		const { height, width } = appLayout;
		const isPortrait = height > width;
		const deviceWidth = isPortrait ? width : height;

		const { paddingFactor } = Theme.Core;
		const padding = deviceWidth * paddingFactor;

		return (
			<DropDown
				items={this.Options}
				value={graphView === 'detailed' ? this.detailed : this.overview}
				label={this.DDLabel}
				onValueChange={onValueChange}
				appLayout={appLayout}
				dropDownContainerStyle={{
					marginLeft: padding / 2,
				}}
				dropdownMargins={{
					min: padding,
					max: padding,
				}}
				accessibilityLabelPrefix={this.DDLabel}
			/>
		);
	}
}

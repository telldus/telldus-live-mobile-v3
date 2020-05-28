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
import { View } from 'react-native';
import Base from './Base';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';

import {
	prepareRootPropsView,
} from './prepareRootProps';
import {
	withTheme,
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

type NewProps = {|padder?: boolean, level?: number, style: Object | Array<any>|};
type Props = {|...NewProps, ...ViewProps|};


type PropsThemedViewComponent = Props & PropsThemedComponent;
class ViewComponent extends Base {
	props: PropsThemedViewComponent;

	render(): React$Element<any> {
		const {
			children,
			...others
		} = this.props;

		return (
			<View
				{...prepareRootPropsView(others)}>
				{children}
			</View>
		);
	}
}

export default withTheme(ViewComponent, true);

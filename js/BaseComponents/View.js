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

import React, {
	createRef,
	memo,
	forwardRef,
} from 'react';
import { View, Animated } from 'react-native';
import Base from './Base';
import type { ViewProps } from 'react-native/Libraries/Components/View/ViewPropTypes';

import {
	prepareRootPropsView,
} from './prepareRootProps';
import {
	useAppTheme,
} from '../App/Hooks/Theme';

type NewProps = {|padder?: boolean, level?: number, animated?: boolean, style: Object | Array<any>|};
type Props = {|...NewProps, ...ViewProps|};


type PropsThemedViewComponent = Props & Object;

const ThemedView = memo<Object>(forwardRef<Object, Object>((props: Object, ref: any): Object => {
	const {
		children,
		animated,
		...others
	} = props;

	const theme = useAppTheme();

	if (animated) {
		return (
			<Animated.View
				ref={ref}
				{...prepareRootPropsView({
					...others,
					...theme,
				})}>
				{children}
			</Animated.View>
		);
	}

	return (
		<View
			ref={ref}
			{...prepareRootPropsView({
				...others,
				...theme,
			})}>
			{children}
		</View>
	);
}));

class ViewComponent extends Base {
	props: PropsThemedViewComponent;

	viewRef: any;
	measureInWindow: Function;

	constructor(props: PropsThemedViewComponent) {
		super(props);
		this.viewRef = createRef();
		this.measureInWindow = this._measureInWindow;
	}

	_measureInWindow(callback?: Function) {
		this.viewRef.current.measureInWindow(callback);
	}

	render(): React$Element<any> {
		return <ThemedView
			ref={this.viewRef}
			{...this.props}
		/>;
	}
}

export default (ViewComponent: Object);

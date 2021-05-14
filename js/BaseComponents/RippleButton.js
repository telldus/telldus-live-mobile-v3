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

import React, {
	useCallback,
} from 'react';
import Ripple from 'react-native-material-ripple';

import {
	prepareRootPropsView,
} from './prepareRootProps';

import Theme from '../App/Theme';

import {
	useAppTheme,
} from '../App/Hooks/Theme';
import {
	PropsThemedComponent,
} from '../App/Components/HOC/withTheme';

type Props = {
	children: Object,
	onPress: Function,
	level?: number,
	onPressData?: any,
};

type ThemedRippleButton = Props & PropsThemedComponent;

const RippleButton = (props: ThemedRippleButton): Object => {
	const { children, onPress, onPressData, ...others } = props;

	const theme = useAppTheme();

	const { rippleColor, rippleOpacity, rippleDuration } = Theme.Core;

	const _onPress = useCallback(() => {
		onPress(onPressData);
	}, [onPressData, onPress]);

	return (
		<Ripple
			rippleColor={rippleColor}
			rippleOpacity={rippleOpacity}
			rippleDuration={rippleDuration}
			rippleCentered={true}
			onPress={_onPress}
			{
				...prepareRootPropsView({
					...others,
					...theme,
				})}>
			<>
				{children}
			</>
		</Ripple>
	);
};

export default (React.memo<Object>(RippleButton): Object);

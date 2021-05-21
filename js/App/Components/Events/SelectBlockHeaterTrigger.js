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
	useEffect,
	// useCallback,
} from 'react';
// import { useIntl } from 'react-intl';

import {
	ThemedScrollView,
	Text,
} from '../../../BaseComponents';
import {
	useAppTheme,
} from '../../Hooks/Theme';

import Theme from '../../Theme';

// import i18n from '../../Translations/common';

type Props = {
	navigation: Object,
	appLayout: Object,
	onDidMount: (string, string, ?string) => void,
};

const SelectBlockHeaterTrigger = React.memo<Object>((props: Props): Object => {
	const {
		// navigation,
		appLayout,
		onDidMount,
	} = props;

	const {
		colors,
	} = useAppTheme();

	// const intl = useIntl();
	// const {
	// 	formatMessage,
	// } = intl;

	useEffect(() => {
		onDidMount('Block heater', 'Add blockheater trigger'); // TODO: Translate
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// const onPressNext = useCallback((index: number) => {
	// 	navigation.navigate('');
	// }, [navigation]);

	const {
		container,
		contentContainerStyle,
	} = getStyles({
		appLayout,
		colors,
	});

	return (
		<ThemedScrollView
			level={2}
			style={container}
			contentContainerStyle={contentContainerStyle}>
			<Text>
                Block heater
			</Text>
		</ThemedScrollView>
	);
});

const getStyles = ({
	appLayout,
	colors,
}: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		container: {
			flex: 1,
		},
		contentContainerStyle: {
			flexGrow: 1,
			paddingVertical: padding,
		},
	};
};

export default SelectBlockHeaterTrigger;

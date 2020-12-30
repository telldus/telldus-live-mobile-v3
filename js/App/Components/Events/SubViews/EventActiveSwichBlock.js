
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
	useState,
	useEffect,
	useRef,
	useCallback,
} from 'react';
import {
	useDispatch,
	useSelector,
} from 'react-redux';
import { useIntl } from 'react-intl';

import {
	SettingsRow,
	View,
} from '../../../../BaseComponents';

import {
	eventSetActive,
} from '../../../Actions/Event';

import Theme from '../../../Theme';

// import i18n from '../../../Translations/common';

function usePrevious(value: string): ?string {
	const ref = useRef();
	useEffect(() => {
	  ref.current = value;
	});
	return ref.current;
}

const EventActiveSwichBlock = (props: Object): Object => {
	const {
		value,
	} = props;
	const intl = useIntl();
	// const { formatMessage } = intl;

	const { layout } = useSelector((state: Object): Object => state.app);

	const [ valueInscreen, setValueInscreen ] = useState(value);
	const prevValueInscreen = usePrevious(value);
	useEffect(() => {
		if (prevValueInscreen !== valueInscreen) {
			setValueInscreen(value);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	const dispatch = useDispatch();

	const onValueChange = useCallback(() => {
		const next = !value;
		setValueInscreen(next);
		dispatch(eventSetActive(next));
	}, [dispatch, value]);

	const {
		containerStyle,
	} = getStyle(layout);

	return (
		<View
			style={containerStyle}>
			<SettingsRow
				type={'switch'}
				edit={false}
				label={'Event active'}
				value={valueInscreen}
				appLayout={layout}
				onPress={false}
				onValueChange={onValueChange}
				intl={intl}/>
		</View>
	);
};

const getStyle = (appLayout: Object): Object => {
	const { height, width } = appLayout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;
	const {
		paddingFactor,
	} = Theme.Core;
	const padding = deviceWidth * paddingFactor;
	return {
		containerStyle: {
			flex: 1,
			marginHorizontal: padding,
		},
	};
};

export default React.memo<Object>(EventActiveSwichBlock);

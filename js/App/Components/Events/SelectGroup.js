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
	useState,
	memo,
	useCallback,
	useEffect,
} from 'react';
import {
	useSelector,
	useDispatch,
} from 'react-redux';
import {
	RefreshControl,
} from 'react-native';

import {
	FloatingButton,
	ThemedScrollView,
	View,
} from '../../../BaseComponents';
import {
	SelectGroupDD,
} from './SubViews';

import {
	getEventGroupsList,
} from '../../Actions/Events';
import {
	useAppTheme,
} from '../../Hooks/Theme';

import Theme from '../../Theme';

type Props = {
    onDidMount: Function,
	navigation: Object,
	route: Object,
};

const SelectGroup: Object = memo<Object>((props: Props): Object => {
	const {
		onDidMount,
		navigation,
		route,
	} = props;
	const {
		params = {},
	} = route;

	const dispatch = useDispatch();

	const {
		group,
	} = useSelector((state: Object): Object => state.event) || {};

	const [groupsList, setGroupsList] = useState([]);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const refreshGroups = useCallback((refreshing?: boolean = true) => {
		setIsRefreshing(refreshing);
		dispatch(getEventGroupsList()).then((res: Object) => {
			setIsRefreshing(false);
			if (res && res.eventGroup) {
				const gl = res.eventGroup.map((g: Object): Object => {
					return {
						key: g.id,
						value: g.name,
					};
				});
				setGroupsList(gl);
			}
		}).catch(() => {
			setIsRefreshing(false);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		refreshGroups(true);
		onDidMount('Add the event to a group', 'Add the event to a group by selecting one'); // TODO: Translate
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		layout,
	} = useSelector((state: Object): Object => state.app) || {};
	const {
		coverStyle,
	} = getStyles({
		layout,
	});
	const _onPressNext = useCallback(() => {
		navigation.navigate('SelectTriggerType', {
			...params,
		});
	}, [navigation, params]);

	const {
		colors,
	} = useAppTheme();
	const {
		inAppBrandSecondary,
	} = colors;

	return (
		<View
			level={2}
			style={{flex: 1}}>
			<ThemedScrollView
				refreshControl={
					<RefreshControl
						enabled={true}
						refreshing={isRefreshing}
						onRefresh={refreshGroups}
						colors={[inAppBrandSecondary]}
						tintColor={inAppBrandSecondary}
					/>
				}
				level={2}
				style={{
					flex: 1,
				}}
				contentContainerStyle={{
					flexGrow: 1,
				}}>
				<View
					level={2}
					style={coverStyle}>
					<SelectGroupDD
						groupsList={groupsList}
						dropDownPosition={'bottom'}
						groupId={group}/>
				</View>
			</ThemedScrollView>
			<FloatingButton
				onPress={_onPressNext}
				iconName={'checkmark'}/>
		</View>
	);
});

const getStyles = ({layout}: Object): Object => {

	const { height, width } = layout;
	const isPortrait = height > width;
	const deviceWidth = isPortrait ? width : height;

	const {
		paddingFactor,
	} = Theme.Core;

	const padding = deviceWidth * paddingFactor;

	return {
		coverStyle: {
			marginVertical: padding,
		},
	};
};

export default SelectGroup;

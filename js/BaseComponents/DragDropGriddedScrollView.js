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
	memo,
	useMemo,
	useCallback,
	useRef,
	useState,
} from 'react';
import {
	ScrollView,
	View,
	PanResponder,
	Animated,
} from 'react-native';


const RowItem = memo<Object>((props: Object): Object => {
	const {
		renderItem,
		item,
		index,
		moveEnd,
		move,
		onLayout,
		style,
		setRowRefs,
	} = props;

	const _move = useCallback(() => {
		if (move) {
			move(index);
		}
	}, [index, move]);

	const _onLayout = useCallback((event: Object) => {
		if (onLayout) {
			onLayout(event, index);
		}
	}, [index, onLayout]);

	const component = useMemo((): Object => {
		return renderItem({
			isActive: false,
			item,
			index,
			move: _move,
			moveEnd,
		});
	}, [_move, index, item, moveEnd, renderItem]);

	const _setRowRefs = useCallback((ref: any) => {
		if (setRowRefs) {
			setRowRefs(ref, index);
		}
	}, [index, setRowRefs]);

	return (
		<Animated.View
			ref={_setRowRefs}
			onLayout={_onLayout}
			style={style}>
			{component}
		</Animated.View>
	);
});

const DragDropGriddedScrollView = memo<Object>((props: Object): Object => {

	const {
		data,
		renderItem,
	} = props;

	const _rowInfo = useRef({});
	const _rowRefs = useRef({});
	const _refSelected = useRef({});
	const _currentGest = useRef({});
	const _containerLayoutInfo = useRef({});
	const [ selectedIndex, setSelectedIndex ] = useState(-1);

	const onRelease = (evt: Object, gestureState: Object) => {
		console.log('TEST onRelease');
		setSelectedIndex(-1);
	};

	const _setRowRefs = useCallback((ref: any, index: number) => {
		const _rowRefsNew = {
			..._rowRefs.current,
			[index]: ref,
		};
		_rowRefs.current = _rowRefsNew;
	}, []);

	const _setRowRefSelected = useCallback((ref: any, index: number) => {
		_refSelected.current = ref;
	}, []);

	const _panResponder = PanResponder.create({
		onStartShouldSetPanResponderCapture: (evt: Object, gestureState: Object): boolean => {
			_currentGest.current = gestureState;
			return false;
		},
		onMoveShouldSetPanResponder: (evt: Object, gestureState: Object): boolean => {
			const { numberActiveTouches } = gestureState;
			if (numberActiveTouches > 1) {
				onRelease();
				return false;
			}
			const shouldSet = selectedIndex !== -1;
			return shouldSet;
		},
		onPanResponderMove: (evt: Object, gestureState: Object) => {
			console.log('TEST onPanResponderMove', {...gestureState});
			console.log('TEST evt.nativeEvent', {...evt.nativeEvent});
			if (gestureState.numberActiveTouches > 1) {
				onRelease();
				return;
			}
			if (selectedIndex === -1) {
				return;
			}

			const {
				moveX,
				moveY,
			} = gestureState;
			console.log('TEST _containerLayoutInfo.current', {..._containerLayoutInfo.current});
			_refSelected.current.setNativeProps({
				style: {
					left: moveX,
					top: (moveY - _containerLayoutInfo.current.x),
				},
			});
		},
		onPanResponderTerminationRequest: ({ nativeEvent }: Object, gestureState: Object): boolean => {
			return false;
		},
		onPanResponderRelease: onRelease,
	});

	const _move = useCallback((index: number) => {
		const selectedItemInfo = _rowInfo.current[index];
		setSelectedIndex(index);
		if (!_refSelected.current) {
			return;
		}
		console.log('TEST selectedItemInfo', selectedItemInfo);
		console.log('TEST _currentGest.current', {..._currentGest.current});
		const {
			moveX,
			moveY,
		} = _currentGest.current;
		_refSelected.current.setNativeProps({
			style: {
				left: moveX || selectedItemInfo.x,
				top: moveY || selectedItemInfo.y,
				transform: [{
					scaleX: 1.2,
				}, {
					scaleY: 1.2,
				}],
			},
		});
	}, []);

	const _moveEnd = useCallback(() => {
		setSelectedIndex(-1);
	}, []);

	const _onLayoutRow = useCallback((event: Object, index: number) => {
		const _rowInfoNext = {
			..._rowInfo.current,
			[index]: event.nativeEvent.layout,
		};
		_rowInfo.current = _rowInfoNext;
	}, [_rowInfo]);

	const onLayoutContainer = useCallback((event: Object) => {
		_containerLayoutInfo.current = event.nativeEvent.layout;
	}, []);

	const rows = useMemo((): Array<Object> => {
		return data.map((item: Object, index: number): Object => {
			return (
				<RowItem
					key={`${index}`}
					setRowRefs={_setRowRefs}
					onLayout={_onLayoutRow}
					renderItem={renderItem}
					item={item}
					index={index}
					move={_move}/>
			);
		});
	}, [data, _setRowRefs, _onLayoutRow, renderItem, _move]);

	const selectedItem = useMemo((): null | Object => {
		if (selectedIndex === -1) {
			return null;
		}
		return (
			<RowItem
				key={`${selectedIndex}-selected`}
				renderItem={renderItem}
				item={data[selectedIndex]}
				index={`${selectedIndex}-selected`}
				moveEnd={_moveEnd}
				setRowRefs={_setRowRefSelected}
				style={{
					position: 'absolute',
				}}/>
		);
	}, [selectedIndex, renderItem, data, _moveEnd, _setRowRefSelected]);

	return (
		<View
			style={{
				flex: 1,
			}}
			{..._panResponder.panHandlers}
			onLayout={onLayoutContainer}>
			<ScrollView
				{...props}>
				{rows}
			</ScrollView>
			{!!selectedItem && selectedItem}
		</View>
	);
});

export default DragDropGriddedScrollView;

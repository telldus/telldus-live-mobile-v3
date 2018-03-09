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
import { ListView, RefreshControl } from 'react-native';
import SwipeRow from './SwipeRow';

type Props = {
	onRefresh: ?(() => void),
	/**
	 * How to render a row. Should return a valid React Element.
	 */
	renderRow: (Object, number, number, Object) => Object,
	/**
	 * How to render a hidden row (renders behind the row). Should return a valid React Element.
	 * This is required unless renderRow is passing a SwipeRow.
	 */
	renderHiddenRow: (Object, number, number, Object) => Object,
	/**
	 * TranslateX value for opening the row to the left (positive number)
	 */
	leftOpenValue: number,
	/**
	 * TranslateX value for opening the row to the right (negative number)
	 */
	rightOpenValue: number,
	/**
	 * Should open rows be closed when the listView begins scrolling
	 */
	closeOnScroll: boolean,
	/**
	 * Should open rows be closed when a row is pressed
	 */
	closeOnRowPress: boolean,
	/**
	 * Disable ability to swipe rows left
	 */
	disableLeftSwipe: boolean,
	/**
	 * Disable ability to swipe rows right
	 */
	disableRightSwipe: boolean,
	/**
	 * Enable hidden row onLayout calculations to run always.
	 *
	 * By default, hidden row size calculations are only done on the first onLayout event
	 * for performance reasons.
	 * Passing ```true``` here will cause calculations to run on every onLayout event.
	 * You may want to do this if your rows' sizes can change.
	 * One case is a SwipeListView with rows of different heights and an options to delete rows.
	 */
	recalculateHiddenLayout: boolean,
	/**
	 * Called when a swipe row is animating open
	 */
	onRowOpen: (number, number, Object) => void,
	/**
	 * Called when a swipe row is animating closed
	 */
	onRowClose: (number, number, Object) => void,
	/**
	 * Styles for the parent wrapper View of the SwipeRow
	 */
	swipeRowStyle: Object,
	/**
	 * Called when the ListView ref is set and passes a ref to the ListView
	 * e.g. listViewRef={ ref => this._swipeListViewRef = ref }
	 */
	listViewRef: (Object) => void,
	/**
	 * Should the first SwipeRow do a slide out preview to show that the list is swipeable
	 */
	previewFirstRow: boolean,
	/**
	 * Duration of the slide out preview animation
	 */
	previewDuration: number,
	/**
	 * TranslateX value for the slide out preview animation
	 * Default: 0.5 * props.rightOpenValue
	 */
	previewOpenValue: number,

	editMode: boolean,

	dataSource: Object,

	onScroll: (Object) => void,

	removeClippedSubviews: boolean,
};

type DefaultProps = {
	onRefresh: ?(() => void),
	/**
	 * TranslateX value for opening the row to the left (positive number)
	 */
	leftOpenValue: number,
	/**
	 * TranslateX value for opening the row to the right (negative number)
	 */
	rightOpenValue: number,
	/**
	 * Should open rows be closed when the listView begins scrolling
	 */
	closeOnScroll: boolean,
	/**
	 * Should open rows be closed when a row is pressed
	 */
	closeOnRowPress: boolean,
	/**
	 * Disable ability to swipe rows left
	 */
	disableLeftSwipe: boolean,
	/**
	 * Disable ability to swipe rows right
	 */
	disableRightSwipe: boolean,
	/**
	 * Enable hidden row onLayout calculations to run always.
	 *
	 * By default, hidden row size calculations are only done on the first onLayout event
	 * for performance reasons.
	 * Passing ```true``` here will cause calculations to run on every onLayout event.
	 * You may want to do this if your rows' sizes can change.
	 * One case is a SwipeListView with rows of different heights and an options to delete rows.
	 */
	recalculateHiddenLayout: boolean,
	/**
	 * Should the first SwipeRow do a slide out preview to show that the list is swipeable
	 */
	previewFirstRow: boolean,

	editMode: boolean,
};

type State = {
	refreshing: boolean,
	scrollEnabled: boolean,
};

class ListComponent extends React.Component<Props, State> {
	props: Props;
	static defaultProps: DefaultProps;
	state: State;
	_rows: Object;
	openCellId: ?string;
	_listView: Object;
	onRefresh: () => void;
	setScrollEnabled: (boolean) => void;
	onScroll: (Object) => void;
	setRefs: (any) => mixed;
	renderRow: (Object, number, number, Object) => Object;

	constructor(props: Props) {
		super(props);
		this._rows = {};
		this.openCellId = null;
		this.state = {
			refreshing: false,
			scrollEnabled: true,
		};

		this.onRefresh = this.onRefresh.bind(this);
		this.onScroll = this.onScroll.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.setRefs = this.setRefs.bind(this);
		this.setScrollEnabled = this.setScrollEnabled.bind(this);
	}

	onRefresh() {
		this.setState({ refreshing: true });
		if (this.props.onRefresh) {
			this.props.onRefresh();
			this.setState({ refreshing: false });
		} else {
			setTimeout(() => {
				this.setState({ refreshing: false });
			}, 1000);
		}
	}

	setScrollEnabled(enable: boolean) {
		if (this._listView) {
			this._listView.setNativeProps({ scrollEnabled: enable });
			this.setState({ scrollEnabled: enable });
		}
	}

	safeCloseOpenRow() {
		// if the openCellId is stale due to deleting a row this could be undefined
		if (this._rows[this.openCellId]) {
			this._rows[this.openCellId].closeRow();
		}
	}

	onRowOpen(secId: number, rowId: number, rowMap: Object) {
		const cellIdentifier = `${secId}${rowId}`;
		if (this.openCellId && this.openCellId !== cellIdentifier) {
			this.safeCloseOpenRow();
		}
		this.openCellId = cellIdentifier;
		this.props.onRowOpen && this.props.onRowOpen(secId, rowId, rowMap);
	}

	onRowPress(id: string) {
		if (this.openCellId) {
			if (this.props.closeOnRowPress) {
				this.safeCloseOpenRow();
				this.openCellId = null;
			}
		}
	}

	onScroll(e: Object) {
		if (this.openCellId) {
			if (this.props.closeOnScroll) {
				this.safeCloseOpenRow();
				this.openCellId = null;
			}
		}
		this.props.onScroll && this.props.onScroll(e);
	}

	setRefs(ref: Object) {
		this._listView = ref;
		this.props.listViewRef && this.props.listViewRef(ref);
	}

	renderRow(rowData: Object, secId: number, rowId: number, highlightRow: Object): Object {
		const Component = this.props.renderRow(rowData, secId, rowId, highlightRow);
		if (!this.props.renderHiddenRow) {
			return React.cloneElement(
				Component,
				{
					...Component.props,
					ref: (row: Object): Object => (this._rows[`${secId}${rowId}`] = row),
					onRowOpen: (_: void): void => this.onRowOpen(secId, rowId, this._rows),
					onRowClose: (_: void): void => this.props.onRowClose && this.props.onRowClose(secId, rowId, this._rows),
					onRowPress: (_: void): void => this.onRowPress(`${secId}${rowId}`),
					setScrollEnabled: (enable: boolean): void => this.setScrollEnabled(enable),
				}
			);
		}
		const firstRowId = this.props.dataSource && this.props.dataSource.getRowIDForFlatIndex(0);
		return (
			<SwipeRow
				ref={(row: any): any => (this._rows[`${secId}${rowId}`] = row)} // eslint-disable-line react/jsx-no-bind
				onRowOpen={(_: void): void => this.onRowOpen(secId, rowId, this._rows)} // eslint-disable-line react/jsx-no-bind
				onRowClose={(_: void): void => this.props.onRowClose && this.props.onRowClose( // eslint-disable-line react/jsx-no-bind
					secId,
					rowId,
					this._rows
				)}
				onRowPress={(_: void): void => this.onRowPress(`${secId}${rowId}`)} // eslint-disable-line react/jsx-no-bind
				setScrollEnabled={this.setScrollEnabled}
				leftOpenValue={this.props.leftOpenValue}
				rightOpenValue={this.props.rightOpenValue}
				closeOnRowPress={this.props.closeOnRowPress}
				disableLeftSwipe={this.props.disableLeftSwipe}
				disableRightSwipe={this.props.disableRightSwipe}
				recalculateHiddenLayout={this.props.recalculateHiddenLayout}
				style={this.props.swipeRowStyle}
				preview={this.props.previewFirstRow && rowId === firstRowId}
				previewDuration={this.props.previewDuration}
				previewOpenValue={this.props.previewOpenValue}
				editMode={this.props.editMode}
			>
				{this.props.renderHiddenRow(rowData, secId, rowId, this._rows)}
				{this.props.renderRow(rowData, secId, rowId, this._rows)}
			</SwipeRow>
		);
	}

	render(): React$Element<any> {
		return (
			<ListView
				removeClippedSubviews={false}
				{...this.props}
				refreshControl={
					<RefreshControl
						refreshing={this.state.refreshing}
						onRefresh={this.onRefresh}
						enableEmptySections={true}
						enabled={this.state.scrollEnabled}
					/>
				}
				ref={this.setRefs}
				onScroll={this.onScroll}
				renderRow={this.renderRow}
				contentInset={{ bottom: 64 }}
				enableEmptySections={true}
			/>
		);
	}

}

ListComponent.defaultProps = {
	onRefresh: null,
	leftOpenValue: 0,
	rightOpenValue: 0,
	closeOnScroll: true,
	closeOnRowPress: true,
	disableLeftSwipe: false,
	disableRightSwipe: true,
	recalculateHiddenLayout: false,
	previewFirstRow: false,
	editMode: false,
};

export default ListComponent;

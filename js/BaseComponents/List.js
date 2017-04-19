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

'use strict';

import React from 'react';
import { ListView, RefreshControl, View } from 'react-native';
import SwipeRow from './SwipeRow';

class ListComponent extends React.Component {

	constructor(props){
		super(props);
		this._rows = {};
		this.openCellId = null;
		this.state = {
			refreshing: false
		};
	}

	_onRefresh() {
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

	setScrollEnabled(enable) {
		this._listView.setNativeProps({scrollEnabled: enable});
	}

	safeCloseOpenRow() {
		// if the openCellId is stale due to deleting a row this could be undefined
		if (this._rows[this.openCellId]) {
			this._rows[this.openCellId].closeRow();
		}
	}

	onRowOpen(secId, rowId, rowMap) {
		const cellIdentifier = `${secId}${rowId}`;
		if (this.openCellId && this.openCellId !== cellIdentifier) {
			this.safeCloseOpenRow();
		}
		this.openCellId = cellIdentifier;
		this.props.onRowOpen && this.props.onRowOpen(secId, rowId, rowMap);
	}

	onRowPress(id) {
		if (this.openCellId) {
			if (this.props.closeOnRowPress) {
				this.safeCloseOpenRow();
				this.openCellId = null;
			}
		}
	}

	onScroll(e) {
		if (this.openCellId) {
			if (this.props.closeOnScroll) {
				this.safeCloseOpenRow();
				this.openCellId = null;
			}
		}
		this.props.onScroll && this.props.onScroll(e);
	}

	setRefs(ref) {
		this._listView = ref;
		this.props.listViewRef && this.props.listViewRef(ref);
	}

	renderRow(rowData, secId, rowId, highlightRow) {
		const Component = this.props.renderRow(rowData, secId, rowId, highlightRow);
		if (!this.props.renderHiddenRow) {
			return React.cloneElement(
				Component,
				{
					...Component.props,
					ref: row => this._rows[`${secId}${rowId}`] = row,
					onRowOpen: _ => this.onRowOpen(secId, rowId, this._rows),
					onRowClose: _ => this.props.onRowClose && this.props.onRowClose(secId, rowId, this._rows),
					onRowPress: _ => this.onRowPress(`${secId}${rowId}`),
					setScrollEnabled: enable => this.setScrollEnabled(enable)
				}
			);
		} else {
			const firstRowId = this.props.dataSource && this.props.dataSource.getRowIDForFlatIndex(0);
			return (
				<SwipeRow
					ref={row => this._rows[`${secId}${rowId}`] = row}
					onRowOpen={ _ => this.onRowOpen(secId, rowId, this._rows) }
					onRowClose={ _ => this.props.onRowClose && this.props.onRowClose(secId, rowId, this._rows) }
					onRowPress={ _ => this.onRowPress(`${secId}${rowId}`) }
					setScrollEnabled={ (enable) => this.setScrollEnabled(enable) }
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
	}

	render() {
		return (
			<ListView
				{...this.props}
				refreshControl={
					<RefreshControl
						refreshing={this.state.refreshing}
						onRefresh={this._onRefresh.bind(this)}
						enableEmptySections={true}
					/>
				}
				ref={ c => this.setRefs(c) }
				onScroll={ e => this.onScroll(e) }
				renderRow={this.renderRow.bind(this)}
			/>
		)
	}

}

ListComponent.propTypes = {

	onRefresh: React.PropTypes.func,
	/**
	 * How to render a row. Should return a valid React Element.
	 */
	renderRow: React.PropTypes.func.isRequired,
	/**
	 * How to render a hidden row (renders behind the row). Should return a valid React Element.
	 * This is required unless renderRow is passing a SwipeRow.
	 */
	renderHiddenRow: React.PropTypes.func,
	/**
	 * TranslateX value for opening the row to the left (positive number)
	 */
	leftOpenValue: React.PropTypes.number,
	/**
	 * TranslateX value for opening the row to the right (negative number)
	 */
	rightOpenValue: React.PropTypes.number,
	/**
	 * Should open rows be closed when the listView begins scrolling
	 */
	closeOnScroll: React.PropTypes.bool,
	/**
	 * Should open rows be closed when a row is pressed
	 */
	closeOnRowPress: React.PropTypes.bool,
	/**
	 * Disable ability to swipe rows left
	 */
	disableLeftSwipe: React.PropTypes.bool,
	/**
	 * Disable ability to swipe rows right
	 */
	disableRightSwipe: React.PropTypes.bool,
	/**
	 * Enable hidden row onLayout calculations to run always.
	 *
	 * By default, hidden row size calculations are only done on the first onLayout event
	 * for performance reasons.
	 * Passing ```true``` here will cause calculations to run on every onLayout event.
	 * You may want to do this if your rows' sizes can change.
	 * One case is a SwipeListView with rows of different heights and an options to delete rows.
	 */
	recalculateHiddenLayout: React.PropTypes.bool,
	/**
	 * Called when a swipe row is animating open
	 */
	onRowOpen: React.PropTypes.func,
	/**
	 * Called when a swipe row is animating closed
	 */
	onRowClose: React.PropTypes.func,
	/**
	 * Styles for the parent wrapper View of the SwipeRow
	 */
	swipeRowStyle: React.PropTypes.object,
	/**
	 * Called when the ListView ref is set and passes a ref to the ListView
	 * e.g. listViewRef={ ref => this._swipeListViewRef = ref }
	 */
	listViewRef: React.PropTypes.func,
	/**
	 * Should the first SwipeRow do a slide out preview to show that the list is swipeable
	 */
	previewFirstRow: React.PropTypes.bool,
	/**
	 * Duration of the slide out preview animation
	 */
	previewDuration: React.PropTypes.number,
	/**
	 * TranslateX value for the slide out preview animation
	 * Default: 0.5 * props.rightOpenValue
	 */
	previewOpenValue: React.PropTypes.number,

	editMode: React.PropTypes.bool,
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
}

export default ListComponent;

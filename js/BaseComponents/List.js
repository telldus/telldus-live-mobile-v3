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
import { ListView, RefreshControl } from 'react-native';

class ListComponent extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			refreshing: false,
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

	render() {
		return (
			<ListView
				refreshControl={
					<RefreshControl
						refreshing={this.state.refreshing}
						onRefresh={this._onRefresh.bind(this)}
					/>
				}
				{...this.props}
			/>
		);
	}
}

ListComponent.propTypes = {
	onRefresh: React.PropTypes.func
}

ListComponent.defaultProps = {
	onRefresh: null
}

export default ListComponent;

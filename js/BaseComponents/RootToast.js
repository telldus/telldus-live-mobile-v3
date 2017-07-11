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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';

type DefaultProps = {
	onToastShow: bool,
	onToastShown: bool,
	onToastHide: bool,
	onToastHidden: bool,
	position: number,
	duration: number,
};

class RootToast extends Component {
	static defaultProps: DefaultProps;

	onShow: Function;
	onShown: Function;
	onHide: Function;
	onHidden: Function;
	constructor() {
		super();
		this.onShow = this.onShow.bind(this);
		this.onShown = this.onShown.bind(this);
		this.onHide = this.onHide.bind(this);
		this.onHidden = this.onHidden.bind(this);
	}

	onShow() {
		if (this.props.onToastShow) {
			this.props.onToastShow();
		}
	}

	onShown() {
		let that = this;
		if (this.props.onToastShown) {
			this.props.onToastShown();
		}
		setTimeout(() => {
			that.hideToast();
		}, that.props.duration);
	}

	hideToast() {
		this.props.dispatch({
			type: 'GLOBAL_ERROR_HIDE',
		});
	}

	onHide() {
		if (this.props.onToastHide) {
			this.props.onToastHide();
		}
	}

	onHidden() {
		if (this.props.onToastHidden) {
			this.props.onToastHidden();
		}
	}

	render() {
		return (
			<Toast
				visible={this.props.toastVisible}
				position={this.props.position}
				shadow={false}
				duration={this.props.duration}
				animation={true}
				hideOnPress={true}
				delay={this.props.delay}
				onShow={this.onShow}
				onShown={this.onShown}
				onHide={this.onHide}
				onHidden={this.onHidden}
				>{this.props.toastMessage}</Toast>
		);
	}
}

RootToast.defaultProps = {
	onToastShow: false,
	onToastShown: false,
	onToastHide: false,
	onToastHidden: false,
	position: 60,
	duration: 3000,
};

RootToast.propTypes = {
	toastVisible: React.PropTypes.bool.isRequired,
	toastMessage: React.PropTypes.string.isRequired,
	position: React.PropTypes.number,
	shadow: React.PropTypes.bool,
	animation: React.PropTypes.bool,
	hideOnPress: React.PropTypes.bool,
	delay: React.PropTypes.number,
};


function mapDispatchToProps(dispatch) {
	return {
		dispatch,
	};
}

module.exports = connect(null, mapDispatchToProps)(RootToast);

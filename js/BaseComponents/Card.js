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
import { View } from 'react-native';
import Base from './Base';
import computeProps from './computeProps';

export default class CardComponent extends Base {

  getInitialStyle() {
    return {
      card: {
        flex: 1,
        borderWidth: this.getTheme().borderWidth,
        borderRadius: this.getTheme().borderRadiusBase,
        borderColor: this.getTheme().listBorderColor,
        flexWrap: 'wrap',
        borderBottomWidth: 0,
        backgroundColor: this.props.transparent ? 'transparent' : this.getTheme().cardDefaultBg,
        shadowColor: this.props.transparent ? undefined : '#000',
        shadowOffset: this.props.transparent ? undefined : { width: 0, height: 2 },
        shadowOpacity: this.props.transparent ? undefined : 0.1,
        shadowRadius: this.props.transparent ? undefined : 1.5,
        elevation: this.props.transparent ? undefined : 2,
        marginTop: 4,
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 4,
      },
    };
  }

  prepareRootProps() {

    let defaultProps = {
      style: this.getInitialStyle().card,
    };

    return computeProps(this.props, defaultProps);

  }

  renderChildren() {
    let childrenArray = React.Children.map(this.props.children, (child) => {
      return child;
    });

    return childrenArray;
  }

  render() {
    return (
			<View {...this.prepareRootProps()} >
				{this.renderChildren()}
			</View>
    );
  }

}

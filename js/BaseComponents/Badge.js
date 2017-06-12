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
import Text from './Text';

type Props = {
  primary: Object,
  success: boolean,
  info: Object,
  warning: boolean,
  danger: boolean,
  children: Object,
  textStyle: Object,
};

export default class BadgeComponent extends Base {
  props: Props;

  prepareRootProps() {
    let type = {
      backgroundColor: this.props.primary ? this.getTheme().brandPrimary : this.props.success ? this.getTheme().brandSuccess :
			this.props.info ? this.getTheme().brandInfo : this.props.warning ? this.getTheme().brandWarning :
			this.props.danger ? this.getTheme().brandDanger : this.getTheme().badgeBg,
      padding: 4,
      alignSelf: 'flex-start',
      borderRadius: 13,
      width: 27,
      height: 27,
    };
    let defaultProps = {
      style: type,
    };
    return computeProps(this.props, defaultProps);
  }

  render() {
    return (
			<View {...this.prepareRootProps()}>
				<Text style={{ color: (this.props.textStyle && this.props.textStyle.color) ? this.props.textStyle.color : this.getTheme().badgeColor,
  fontSize: this.getTheme().fontSizeBase,
  lineHeight: this.getTheme().lineHeight - 2,
  textAlign: 'center' }}>{this.props.children}
				</Text>
			</View>
    );
  }

}

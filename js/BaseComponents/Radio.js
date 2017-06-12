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

// props

'use strict';

import React from 'react';
import { View, Platform } from 'react-native';
import Base from './Base';
import Icon from './Icon';

type Props = {
  selected: boolean,
};

export default class Radio extends Base {
  props: Props;

  getInitialStyle() {
    return {
      radio: {},
    };
  }

  render() {
    return (
      <View >
          {(Platform.OS === 'ios') ?
              <Icon name={this.props.selected ? 'ios-radio-button-on' : 'ios-radio-button-off-outline'} style={{ color: this.props.selected ? this.getTheme().radioSelectedColor : this.getTheme().radioColor, lineHeight: this.getTheme().radioBtnSize + 4, fontSize: this.getTheme().radioBtnSize }} />
            :
              <Icon name={this.props.selected ? 'md-radio-button-on' : 'md-radio-button-off'} style={{ color: this.props.selected ? this.getTheme().radioSelectedColor : this.getTheme().radioColor, lineHeight: this.getTheme().radioBtnSize + 1, fontSize: this.getTheme().radioBtnSize }} />
          }
      </View>
    );
  }
}

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
import { Picker, Modal } from 'react-native';
import Base from './Base';
import computeProps from './computeProps';
import View from './View';
import Text from './Text';
import List from './List';
import Icon from './Icon';
import Container from './Container';
import Content from './Content';
import ListItem from './ListItem';
import Button from './Button';
import Header from './Header';
import Title from './Title';
import _ from 'lodash';

type Props = {
  value: Object,
  selectedValue: Object,
  label: string,
  children: Object,
};

type State = {
  modalVisible: boolean,
  current: string,
};

export default class PickerComponent extends Base {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      modalVisible: false,
      current: this.getSelected().props.label,
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setModalVisible = this.setModalVisible.bind(this);
    this.renderRow = this.renderRow.bind(this);
  }

  getInitialStyle() {
    return {
      picker: {
				// alignItems: 'flex-end'
      },
      pickerItem: {

      },
    };
  }

  openModal() {
    this.setModalVisible(true);
  }

  closeModal() {
    this.setModalVisible(false);
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  prepareRootProps() {

    let defaultProps = {
      style: this.getInitialStyle().picker,
      itemStyle: this.getInitialStyle().pickerItem,
    };

    return computeProps(this.props, defaultProps);

  }

  getSelected() {
    const selected = _.find(this.props.children, (o) => {
      return o.props.value === this.props.selectedValue;
    });
    console.log('title', );
    return selected;
  }

  renderRow(child) {
    return (
			<ListItem style={{ paddingVertical: 10 }}
				iconRight button
				onPress={() => { // eslint-disable-line react/jsx-no-bind
  this._setModalVisible(false);
  this.props.onValueChange(child.props.value);
  this.setState({ current: child.props.label });
}} >
				<Text>{child.props.label}</Text>
				{(child.props.value === this.props.selectedValue) ?
					(<Icon name="ios-checkmark-outline" />)
					:
					(<Icon name="ios-checkmark-outline" style={{ color: 'transparent' }} />)
				}
			</ListItem>
    );
  }

  render() {
    return (
		<View>
			<Button transparent onPress={this.openModal}>{this.state.current}</Button>
			<Modal animationType="slide"
				transparent={false}
				visible={this.state.modalVisible}
				onRequestClose={this.onRequestClose}
				>
				<Container>
					<Header >
						<Button transparent onPress={this.closeModal}>Back</Button>
						<Title>{this.props.iosHeader}</Title>
						<Button transparent textStyle={{ color: 'transparent' }}>Back</Button>
					</Header>
					<Content>
						<List dataArray={this.props.children}
							renderRow={this.renderRow} />
					</Content>
				</Container>
			</Modal>
		</View>
    );
  }

}

PickerComponent.Item = React.createClass({
  render: function () {
    return (
			<Picker.Item {...this.props()}/>
    );
  },
});

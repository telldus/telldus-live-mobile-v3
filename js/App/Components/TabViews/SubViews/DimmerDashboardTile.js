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
import { Text, View } from 'BaseComponents';
import { TouchableOpacity, StyleSheet } from 'react-native';
import DashboardShadowTile  from './DashboardShadowTile';
import VerticalSlider from './VerticalSlider';

const Title = ({ item, tileWidth }) => (
    <View style={[styles.title, {
		backgroundColor: item.childObject.state === 0 ? '#bfbfbf' : '#e56e18'}]}>
		<Text
			ellipsizeMode="middle"
			numberOfLines={1}
			style = {[styles.name, {
				fontSize:  Math.floor(tileWidth / 8),
				opacity: item.childObject.name ? 1 : 0.7,
			}]}>
			{item.childObject.name ? item.childObject.name : '(no name)'}
		</Text>
	</View>
);

const GenericButton = ({ item, tileWidth, text, activeBgColor, deactiveBgColor, activeTextColor, deactiveTextColor, onPress}) => (
    <View style={{
		flex:1,
		backgroundColor: item.childObject.state === 0 ? activeBgColor : deactiveBgColor,
	}}>
		<TouchableOpacity
			onPress={onPress}
			style={styles.button} >
			<Text
				ellipsizeMode="middle"
				numberOfLines={1}
				style = {[styles.buttonText, {
					color: item.childObject.state === 0 ? activeTextColor : deactiveTextColor,
					fontSize:  Math.floor(tileWidth / 8)
				}]}>
				{text}
			</Text>
		</TouchableOpacity>
	</View>
);

const OffButton = ({ item, tileWidth, onPress}) => (
    <GenericButton item={item} tileWidth={tileWidth} onPress={onPress} text="Off" activeBgColor="white" deactiveBgColor="#eeeeee" activeTextColor="red" deactiveTextColor="#a0a0a0" />
);

const OnButton = ({ item, tileWidth, onPress}) => (
    <GenericButton item={item} tileWidth={tileWidth} onPress={onPress} text="On" activeBgColor="#eeeeee" deactiveBgColor="white" activeTextColor="#a0a0a0" deactiveTextColor="green" />
);

class DimmerDashboardTile extends View {
	constructor(props) {
		super(props);
        this.parentScrollEnabled = true;
        this.state = {
            bodyWidth: 0,
            bodyHeight: 0
        };
	}

    onOnButtonSelected() {
        console.log('onOnButtonSelected');
        // TODO: Implement the logic for selecting 'On' button
    }

    onOffButtonSelected() {
        console.log('onOffButtonSelected');
        // TODO: Implement the logic for selecting 'Off' button
    }

    layoutView(x) {
        let {width, height} = x.nativeEvent.layout;
        this.setState({
            bodyWidth:width,
            bodyHeight:height
        });
    }

	render() {
		const item = this.props.item;
		const tileWidth = item.tileWidth - 8;

		return (
			<DashboardShadowTile
				item={item}
				style={	[this.props.style,{
					width: tileWidth,
					height: tileWidth
				}]}>
				<View style={styles.body} onLayout={this.layoutView.bind(this)}>
                    <OffButton item={item} tileWidth={tileWidth} onPress={this.onOffButtonSelected} />
                    <OnButton item={item} tileWidth={tileWidth} onPress={this.onOnButtonSelected} />
                    <VerticalSlider
                        style={[styles.slider, {
                            width: this.state.bodyWidth / 5,
                            height: this.state.bodyHeight,
                            left: this.state.bodyWidth / 2 - this.state.bodyWidth / 10,
                            bottom:0,
                        }]}
                        setScrollEnabled={this.props.setScrollEnabled}
                    />
				</View>
                <Title item={item} tileWidth={tileWidth} />
			</DashboardShadowTile>
		);
	}
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        justifyContent:'center'
    },
	body: {
        flex:30,
        flexDirection: 'row'
    },
    title: {
		flex:13,
		justifyContent: 'center'
    },
	name: {
        padding : 5,
		color: 'white',
		textAlign: 'center',
		textAlignVertical: 'center'
	},
    button: {
        flex:1,
        justifyContent: 'center'
    },
    buttonText: {
		textAlign: 'center',
		textAlignVertical: 'center',
    },
    slider: {
        flex: 1,
        position: 'absolute',
    },
    thumb: {
        flex:1,
        borderRadius: 7,
        borderWidth:1,
        borderColor:'gray',
        elevation:2,
        position:'absolute',
        bottom:0,
        width:30,
        height:12,
        justifyContent: 'center',
        backgroundColor:'white'
    },
    thumbText: {
        color: '#a2a2a2',
        fontSize:  10,
        textAlign: 'center',
        textAlignVertical: 'center'
    }
});

module.exports = DimmerDashboardTile;

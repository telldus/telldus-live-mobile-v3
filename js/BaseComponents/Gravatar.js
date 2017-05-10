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
import {
    StyleSheet,
    View,
    Image
} from 'react-native';

import md5 from 'blueimp-md5';

const GRAVATAR_URI = 'https://www.gravatar.com/avatar/';

class Gravatar extends React.Component {

    _calculateStyle() {
        const size = {width: this.props.size, height: this.props.size};
        let border = {};

        switch (this.props.mask) {
            case 'circle':
                border = {borderRadius: size.width / 2};
                break;
            case 'rounded':
                border = {borderRadius: size.width / 20};
                break;
            case 'square':
                break;
        }

        return {...size, ...border};
    }

    render() {
        const uri = GRAVATAR_URI + md5(this.props.emailAddress) + '?d=mm&s=' + this.props.size * 2;
        const style = this._calculateStyle();
        return (
            <View style={[styles.overlay]}>
                <Image source={{uri}} style={[styles.image, style]} />
            </View>
        );
    }
}

Gravatar.propTypes = {
    ...View.PropTypes,
    emailAddress: React.PropTypes.string.isRequired,
    size: React.PropTypes.number.isRequired,
    mask: React.PropTypes.oneOf(['circle', 'square', 'rounded'])
};

Gravatar.defaultProps = {
    size: 600,
    mask: 'circle'
};

const styles = StyleSheet.create({
    overlay: {
        overflow: 'hidden',
    },

    image: {
        flexGrow: 1,
    },
});

export default Gravatar;

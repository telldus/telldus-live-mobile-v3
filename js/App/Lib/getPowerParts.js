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

/*
 * Returns an array of powers that fit inside a given number
 * 5 => [2, 0] (because: 2^2 + 2^0 = 5)
 * 18 => [4, 1] (because: 2^4 + 2^1 = 16)
 * etc.
 */
function getBiggestPower(num) {
    return Math.floor(Math.log(num) / Math.log(2));
}

export default function getParts(num, memo = []) {
    const biggestPower = getBiggestPower(num);
    const biggestPart = Math.pow(2, biggestPower);
    const remainder = num - biggestPart;
    const newMemo = [...memo, biggestPart];
    if (remainder < 1) {
        return newMemo;
    }
    return getParts(remainder, newMemo);
}

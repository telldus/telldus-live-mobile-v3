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

package com.telldus.live.mobile.Utility;

import android.content.Context;
import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;


public class DevicesUtilities {

    Map<Integer, String> methods = new HashMap<Integer, String>() {{
        put(1, "TURNON");
        put(2, "TURNOFF");
        put(4, "BELL");
        put(8, "TOGGLE");
        put(16, "DIM");
        put(32, "LEARN");
        put(64, "EXECUTE");
        put(128, "UP");
        put(256, "DOWN");
        put(512, "STOP");
        put(1024, "RGB");
        put(2048, "THERMOSTAT");
    }};

    public Integer getBiggestPower(Integer num) {
        int pow = (int) Math.floor(Math.log(num) / Math.log(2));
        return pow;
    }

    public List<Integer> getParts(Integer num,List<Integer> memo) {
        Integer biggestPower = getBiggestPower(num);
        Double biggestPartD = Math.pow(2, biggestPower);
        Integer biggestPart = biggestPartD.intValue();
        Integer remainder = num - biggestPart;

        List<Integer> newMemo = memo;
        newMemo.add( biggestPart);

        if (remainder < 1) {
            return newMemo;
        }
        return getParts(remainder, newMemo);
    }

    public Map<String, Boolean> getSupportedMethods(Integer methodsAggregate) {
        Map<String, Boolean> methodHashmap = new HashMap<String, Boolean>();
        List<Integer> memo = new ArrayList<Integer>();
        List<Integer> methodNumbers = getParts(methodsAggregate, memo);

        Iterator<Integer> itr = methodNumbers.iterator();
        while (itr.hasNext()) {
            Integer methodNumber = itr.next();
            String item = methods.get(methodNumber);
            if (item != null) {
                methodHashmap.put(item, true);
            }
        }
        return methodHashmap;
    }
}
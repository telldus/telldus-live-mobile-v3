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

import android.os.Handler;
import android.os.Looper;

public class HandlerRunnablePair {
    private Handler handler;
    private Runnable runnable;

    public HandlerRunnablePair(Handler handler, Runnable runnable) {
        this.handler = handler;
        this.runnable = runnable;
    }

    /**
     * @return the runnable
     */
    public Runnable getRunnable() {
        return runnable;
    }

    /**
     * @param runnable the runnable to set
     */
    public void setRunnable(Runnable runnable) {
        this.runnable = runnable;
    }

    /**
     * @return the handler
     */
    public Handler getHandler() {
        return handler;
    }

    /**
     * @param handler the handler to set
     */
    public void setHandler(Handler handler) {
        this.handler = handler;
    }
}
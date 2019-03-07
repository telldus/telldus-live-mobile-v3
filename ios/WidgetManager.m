//
//  WidgetManager.m
//  TelldusLiveApp
//
//  Created by micra on 07/03/19.
//  Copyright © 2019 Telldus Technologies AB. All rights reserved.
//

#import "WidgetManager.h"
#import <NotificationCenter/NotificationCenter.h>

@implementation WidgetManager

// To export a module named WidgetManager
RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(showWidget:(BOOL)show)
{
  [[NCWidgetController widgetController] setHasContent:show forWidgetWithBundleIdentifier:@"com.telldus.live.mobile.Widget"];
}

@end

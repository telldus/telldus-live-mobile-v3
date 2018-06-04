//
//  WidgetEntity.m
//  TelldusLiveApp
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import "WidgetEntity.h"

@implementation WidgetEntity

@dynamic name;
@dynamic clientDeviceId;
@dynamic type;
@dynamic client;
@dynamic identifier;
@dynamic clientName;
@dynamic metadataHash;
@dynamic statevalue;
@dynamic devType;
@dynamic state;
@dynamic ignored;
@dynamic methods;
@dynamic editable;
@dynamic online;

-(Widget *)getDevicesList {
  
  Widget *widget = [[Widget alloc] init];
  widget.name = self.name;
  widget.clientDeviceId = self.clientDeviceId;
  widget.type = self.type;
  widget.client = self.client;
  widget.identifier = self.identifier;
  widget.clientName = self.clientName;
  widget.metadataHash = self.metadataHash;
  widget.statevalue = self.statevalue;
  widget.devType = self.devType;
  widget.state = [self.state intValue];
  widget.ignored = [self.ignored intValue];
  widget.methods = [self.methods intValue];
  widget.editable = [self.editable intValue];
  widget.online = [self.online intValue];
  
  return widget;
}

-(void)setDeviceDetails: (Widget *)widget {
  
  self.name = widget.name;
  self.clientDeviceId = widget.clientDeviceId;
  self.type = widget.type;
  self.client = widget.client;
  self.identifier = widget.identifier;
  self.clientName = widget.clientName;
  self.metadataHash = widget.metadataHash;
  self.statevalue = widget.statevalue;
  self.devType = widget.devType;
  self.state = [NSNumber numberWithInteger: widget.state];
  self.ignored = [NSNumber numberWithInteger: widget.ignored];
  self.methods = [NSNumber numberWithInteger: widget.methods];
  self.editable = [NSNumber numberWithInteger: widget.editable];
  self.online = [NSNumber numberWithInteger: widget.online];
}

@end

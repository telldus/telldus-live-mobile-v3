//
//  WidgetEntity.h
//  TelldusLiveApp
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>
#import "Widget.h"

@interface WidgetEntity : NSManagedObject

@property (nonatomic, retain) NSString *name;
@property (nonatomic, retain) NSString *clientDeviceId;
@property (nonatomic, retain) NSString *type;
@property (nonatomic, retain) NSString *client;
@property (nonatomic, retain) NSString *identifier;
@property (nonatomic, retain) NSString *clientName;
@property (nonatomic, retain) NSString *metadataHash;
@property (nonatomic, retain) NSString *statevalue;
@property (nonatomic, retain) NSString *devType;
@property (nonatomic) NSNumber* state;
@property (nonatomic) NSNumber* ignored;
@property (nonatomic) NSNumber* methods;
@property (nonatomic) NSNumber* editable;
@property (nonatomic) NSNumber* online;


-(Widget *)getDevicesList;
-(void)setDeviceDetails: (Widget *)widget;

@end


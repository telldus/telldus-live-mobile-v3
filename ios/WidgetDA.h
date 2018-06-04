//
//  WidgetDA.h
//  TelldusLiveApp
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//


#import <Foundation/Foundation.h>
#import <CoreData/CoreData.h>
#import "AppDelegate.h"
#import "Widget.h"
#import "WidgetEntity.h"

@interface WidgetDA : NSObject

@property (nonatomic) NSManagedObjectContext *managedObjectContext;
@property (readonly, strong) NSPersistentContainer *persistentContainer;

- (void)saveContext;
-(void)checkManagedObjectContext;
-(NSMutableArray *)fetchAllDevices;
-(void)addDevice: (Widget *)widget;
-(void)deleteDevice:(Widget *)widget;
-(void)updateDevice: (Widget *)widget;
@end

//
//  WidgetDA.m
//  TelldusLiveApp
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import "WidgetDA.h"

@implementation WidgetDA

-(NSManagedObjectModel*)getManagedObjectModel {
  return [[NSManagedObjectModel alloc] initWithContentsOfURL: [[NSBundle mainBundle] URLForResource:@"TodayWidget" withExtension:@"momd"]];
}

- (NSURL *)applicationDocumentsDirectory {
  return [[[NSFileManager defaultManager] containerURLForSecurityApplicationGroupIdentifier:@"group.com.telldus.mobile"] URLByAppendingPathComponent:@"TodayWidget.sqlite"];
}

-(void)checkManagedObjectContext {
  if (self.managedObjectContext == nil) {
    NSPersistentStoreCoordinator *coordinator = [[NSPersistentStoreCoordinator alloc] initWithManagedObjectModel: [self getManagedObjectModel]];
    NSError *error;
    [coordinator addPersistentStoreWithType:NSSQLiteStoreType configuration:nil URL: [self applicationDocumentsDirectory] options:nil error:&error];
    NSLog(@"---sss-----iii----->> %@", self.applicationDocumentsDirectory);
    if (error != nil) {
      NSLog(@"Unresolved error %@, %@", error, error.userInfo);
      abort();
    }
    
    
    NSManagedObjectContext *context = [[NSManagedObjectContext alloc] initWithConcurrencyType:NSMainQueueConcurrencyType];
    context.persistentStoreCoordinator = coordinator;
    self.managedObjectContext = context;
  }
}


- (void)saveContext {
  NSManagedObjectContext *context = self.persistentContainer.viewContext;
  NSError *error = nil;
  if ([context hasChanges] && ![context save:&error]) {
    NSLog(@"Unresolved error %@, %@", error, error.userInfo);
    abort();
  }
}


-(void)addDevice: (Widget *)widget {
  
  [self checkManagedObjectContext];
  WidgetEntity *medicineEntityObj =  (WidgetEntity *)[NSEntityDescription insertNewObjectForEntityForName:@"WidgetEntity" inManagedObjectContext:self.managedObjectContext];
  [medicineEntityObj setDeviceDetails:widget];
  [self saveData];
}

-(NSMutableArray *)fetchAllDevices {
  NSArray *fetchedObjects;
  [self checkManagedObjectContext];
  NSMutableArray *medicationDetailsList = [[NSMutableArray alloc] init];
  NSFetchRequest *fetch = [[NSFetchRequest alloc] init];
  NSEntityDescription *entityDescription = [NSEntityDescription entityForName:@"WidgetEntity"  inManagedObjectContext: self.managedObjectContext];
  [fetch setEntity:entityDescription];
  //    [fetch setPredicate:[NSPredicate predicateWithFormat:@"nurseEmailId == %@", [Utils getCurrentNurseEmailId]]];
  NSError * error = nil;
  fetchedObjects = [self.managedObjectContext executeFetchRequest:fetch error:&error];
  
  if (error) {
    NSLog(@"%@, %@", error, error.localizedDescription);
  } else {
    if([fetchedObjects count] > 0) {
      for (WidgetEntity *obj in fetchedObjects) {
        //                NSString *objId = [NSString stringWithFormat:@"%@",[obj objectID]];
        Widget *medicationDetailsObj = [obj getDevicesList];
        //                medicationDetailsObj.medicineObjectId = objId;
        [medicationDetailsList addObject:medicationDetailsObj];
      }
    }
  }
  
  return medicationDetailsList;
}

-(void)deleteDevice:(Widget *)widget {
  
  [self checkManagedObjectContext];
  NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] init];
  NSEntityDescription *entity = [NSEntityDescription entityForName:@"WidgetEntity" inManagedObjectContext:self.managedObjectContext];
  [fetchRequest setEntity:entity];
  [fetchRequest setPredicate:[NSPredicate predicateWithFormat:@"identifier == %@", widget.identifier]];
  
  NSError *error = nil;
  NSArray *fetchedObjects = [self.managedObjectContext executeFetchRequest:fetchRequest error:&error];
  
  if (error) {
    NSLog(@"%@, %@", error, error.localizedDescription);
    
  } else {
    if([fetchedObjects count] > 0) {
      for (WidgetEntity *obj in fetchedObjects) {
        [self.managedObjectContext deleteObject:(NSManagedObject *)obj];
        [self saveData];
      }
    }
  }
}

-(void)updateDevice: (Widget *)widget {
  
  NSArray *fetchedObjects;
  [self checkManagedObjectContext];
  NSFetchRequest *fetch = [[NSFetchRequest alloc] init];
  NSEntityDescription *entityDescription = [NSEntityDescription entityForName:@"WidgetEntity"  inManagedObjectContext: self.managedObjectContext];
  [fetch setEntity:entityDescription];
  [fetch setPredicate:[NSPredicate predicateWithFormat:@"identifier == %@", widget.identifier]];
  NSError * error = nil;
  fetchedObjects = [self.managedObjectContext executeFetchRequest:fetch error:&error];
  
  if (error) {
    NSLog(@"%@, %@", error, error.localizedDescription);
    
  } else {
    if([fetchedObjects count] > 0) {
      for (WidgetEntity *obj in fetchedObjects) {
        [self DeleteDeviceEntity:obj];
      }
      [self addDevice:widget];
    }
  }
}

-(void)DeleteDeviceEntity: (WidgetEntity *)widgetEntityObject {
  
  [self checkManagedObjectContext];
  [self.managedObjectContext deleteObject:(NSManagedObject *)widgetEntityObject];
  [self saveData];
}

-(void)saveData {
  NSError *error = nil;
  [self.managedObjectContext save:&error];
  
  if (error) {
    NSLog(@"%@, %@", error, error.localizedDescription);
  }
}

@end

//
//  TodayViewController.m
//  TelldusLiveWidget
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//


#import "TodayViewController.h"
#import "WidgetCollectionViewCell.h"
#import "AddWidgetCollectionViewCell.h"
#import "Widget.h"
#import "WidgetDA.h"
#import <NotificationCenter/NotificationCenter.h>

@interface TodayViewController () <NCWidgetProviding>
@property int dimmerValue;
@property WidgetDA* widgetDa;
@property NSMutableArray<Widget*> *allSelectedDevice;
@property BOOL displayRemoveBtn;
@property BOOL login;
@property NSString* accessToken;
@end

@implementation TodayViewController


- (void)viewDidLoad {
  [super viewDidLoad];
  _displayRemoveBtn = YES;
  _collectionView.delegate = self;
  _collectionView.dataSource = self;
  
  _allSelectedDevice = [[NSMutableArray alloc] init];
  _widgetDa = [[WidgetDA alloc] init];
  [self fetchAllStoredDevices];
  _loginBtn.backgroundColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
  _loginBtn.layer.cornerRadius = 25.0;
  
  _accessToken = [[[NSUserDefaults alloc] initWithSuiteName:@"group.com.telldus.TokenUserDefaults"] stringForKey:@"accessToken"];
  NSLog(@"-tesxting key value ->%@", _accessToken);
  
  if(_accessToken == FALSE || [_accessToken  isEqual: @"false"]) {
    NSLog(@"false-->");
    _login = NO;
  } else {
    NSLog(@"have vaue-->");
    _login = YES;    
  }
  
  if ([[NSUserDefaults standardUserDefaults] stringForKey:@"dimmerValue"] != nil) {
    _dimmerValue = (int) [[NSUserDefaults standardUserDefaults] integerForKey:@"dimmerValue"];
  } else {
    _dimmerValue = 0;
  }
  
  [self.extensionContext setWidgetLargestAvailableDisplayMode:NCWidgetDisplayModeExpanded];
}

-(void)fetchAllStoredDevices {
  _allSelectedDevice = [NSMutableArray arrayWithArray: [[_widgetDa fetchAllDevices] sortedArrayUsingComparator:^NSComparisonResult(Widget* w1, Widget* w2) {
    return ![w1.name compare:w2.name];
  }]];
  [_collectionView reloadData];
}

- (NSInteger)numberOfSectionsInCollectionView:(UICollectionView *)collectionView {
  return 2;
}

- (NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section {
  return (section == 0) ? _allSelectedDevice.count : 1 ;
}

- (UICollectionViewCell *)collectionView:(UICollectionView *)collectionView cellForItemAtIndexPath:(NSIndexPath *)indexPath {
  
  static NSString *identifier = @"collectionViewCell";
  //    WidgetCollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:identifier forIndexPath:indexPath];
  //    return cell;
  WidgetCollectionViewCell *cell = [collectionView dequeueReusableCellWithReuseIdentifier:identifier forIndexPath:indexPath];
  
  AddWidgetCollectionViewCell *btnCell = [collectionView dequeueReusableCellWithReuseIdentifier:@"AddWidgetCollectionViewCell" forIndexPath:indexPath];
  NSLog(@"---->>%@", _allSelectedDevice);
  NSLog(@"---->>%@", NSPersistentContainer.defaultDirectoryURL);
  
  if(_login == NO) {
    [_loginView setHidden:NO];
    if(indexPath.section == 0) {
      [cell setHidden:YES];
      return cell;
    } else {
      [btnCell setHidden:YES];
      return btnCell;
    }
  } else {
  
  if(indexPath.section == 0) {
    [_loginView setHidden: YES];
    [cell updateCell: (int)indexPath.row];
    [cell.removeMinusBtn setHidden:_displayRemoveBtn];
    [cell.removeMinusBtn addTarget:self action:@selector(removeDeviceFromWidgets:) forControlEvents:UIControlEventTouchUpInside];
    NSString *deviceName = _allSelectedDevice[indexPath.row].name;
    
    for (Widget* device in _allSelectedDevice) {
      NSLog(@"rahul--> check device type --->> %@", device.devType);
      if(device.name == deviceName && [device.devType  isEqual: @"DEVICE"]) {
        [cell.onBtn setHidden:NO];
        [cell.onBtn setImage:[UIImage imageNamed:@"on_dark"] forState: normal];
        cell.onBtn.contentEdgeInsets = UIEdgeInsetsMake(10,10,10,10);
        [cell.onBtn addTarget:self action:@selector(deviceControl:) forControlEvents:UIControlEventTouchUpInside];
        [cell.offBtn setHidden:NO];
        [cell.offBtn setImage:[UIImage imageNamed:@"off_dark"] forState: normal];
        cell.offBtn.contentEdgeInsets = UIEdgeInsetsMake(10,25,10,25);
        [cell.offBtn addTarget:self action:@selector(deviceControl:) forControlEvents:UIControlEventTouchUpInside];
        [cell displayContent:deviceName];
        if (device.state == 1)  {
          cell.onBtn.tintColor = [UIColor whiteColor];
          cell.onBtn.backgroundColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.offBtn.tintColor = [UIColor colorWithRed:0.105 green:0.212 blue:0.363 alpha:1];
          cell.offBtn.backgroundColor = [UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
        } else if (device.state == 2)  {
          cell.onBtn.tintColor =[UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.onBtn.backgroundColor =  [UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
          cell.offBtn.tintColor =[UIColor whiteColor];
          cell.offBtn.backgroundColor = [UIColor colorWithRed:0.105 green:0.212 blue:0.363 alpha:1];
        }
        
      } else if(device.name == deviceName && [device.devType  isEqual: @"DIM"]) {
        [cell.minusBtn setHidden:NO];
        [cell.minusBtn addTarget:self action:@selector(dimmerControl:) forControlEvents:UIControlEventTouchUpInside];
        [cell.plusBtn setHidden:NO];
        [cell.plusBtn addTarget:self action:@selector(dimmerControl:) forControlEvents:UIControlEventTouchUpInside];
        [cell.dimmerSlider setHidden:NO];
        
        cell.dimmerSlider.value = _dimmerValue;
        [cell displayContent:deviceName];
        
      } else if(device.name == deviceName && [device.devType  isEqual: @"CONTROLDEV"]){
        [cell.downBtn setHidden:NO];
        [cell.downBtn setImage:[UIImage imageNamed:@"downarrow"] forState: normal];
        [cell.downBtn addTarget:self action:@selector(deviceUDSControl:) forControlEvents:UIControlEventTouchUpInside];
        [cell.upBtn setHidden:NO];
        [cell.upBtn setImage:[UIImage imageNamed:@"uparrow"] forState: normal];
        [cell.upBtn addTarget:self action:@selector(deviceUDSControl:) forControlEvents:UIControlEventTouchUpInside];
        [cell.stopBtn setHidden:NO];
        [cell.stopBtn setImage:[UIImage imageNamed:@"stop"] forState: normal];
        [cell.stopBtn addTarget:self action:@selector(deviceUDSControl:) forControlEvents:UIControlEventTouchUpInside];
        [cell displayContent:deviceName];
        if (device.state == 128)  {
          cell.downBtn.tintColor = [UIColor whiteColor];
          cell.downBtn.backgroundColor = [UIColor colorWithRed:0.105 green:0.212 blue:0.363 alpha:1];
          cell.upBtn.tintColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.upBtn.backgroundColor = [UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
          cell.stopBtn.tintColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.stopBtn.backgroundColor = [UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
          
        } else if (device.state == 256)  {
          cell.downBtn.tintColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.downBtn.backgroundColor =[UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
          cell.upBtn.tintColor = [UIColor whiteColor];
          cell.upBtn.backgroundColor =  [UIColor colorWithRed:0.105 green:0.212 blue:0.363 alpha:1];
          cell.stopBtn.tintColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.stopBtn.backgroundColor = [UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
          
        } else if (device.state == 512)  {
          cell.downBtn.tintColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.downBtn.backgroundColor = [UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
          cell.upBtn.tintColor = [UIColor colorWithRed:0.885 green:0.415 blue:0.147 alpha:1];
          cell.upBtn.backgroundColor = [UIColor colorWithRed:0.959 green:0.967 blue:0.967 alpha:1];
          cell.stopBtn.tintColor = [UIColor whiteColor];
          cell.stopBtn.backgroundColor =  [UIColor colorWithRed:0.105 green:0.212 blue:0.363 alpha:1];
        }
        
      } else {
        [cell displayContent:deviceName];
      }
    }
    self.preferredContentSize =
    self.preferredContentSize = CGSizeMake(collectionView.collectionViewLayout.collectionView.contentSize.width + 20.0,collectionView.collectionViewLayout.collectionView.contentSize.height+20.0);
    return cell;
    
  } else {
    [_loginView setHidden: YES];
    
    btnCell.addWidgetBtn.layer.cornerRadius = 15.0;
    btnCell.addWidgetBtn.backgroundColor = [UIColor colorWithRed:0.943 green:0.354 blue:0.155 alpha:1];
    btnCell.removeBtn.layer.cornerRadius = 15.0;
    if(_displayRemoveBtn == YES) {
      btnCell.removeWidgetLbl.text = @"REMOVE";
    } else {
      btnCell.removeWidgetLbl.text = @"DONE";
    }
    return btnCell;
    
  }
    
  }
  
}

- (void)collectionView:(UICollectionView *)collectionView didSelectItemAtIndexPath:(NSIndexPath *)indexPath {
  
}

- (CGSize)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout sizeForItemAtIndexPath:(NSIndexPath *)indexPath {
  
  CGFloat tWidth = (collectionView.frame.size.width/2.0) - 5.0;
  CGFloat tHeight = 80.0;
  
  if(indexPath.section == 1) {
    tWidth = _collectionView.frame.size.width;
    tHeight = 30.0;
  }
  
  return CGSizeMake(tWidth, tHeight);
}

- (UIEdgeInsets)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout insetForSectionAtIndex:(NSInteger)section {
  return (section == 0) ? UIEdgeInsetsMake(0.0, 5.0, 0.0, 0.0) : UIEdgeInsetsMake(10.0, 0.0, 0.0, 0.0);
}

- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout minimumLineSpacingForSectionAtIndex:(NSInteger)section {
  return 10.0;
}

- (CGFloat)collectionView:(UICollectionView *)collectionView layout:(UICollectionViewLayout *)collectionViewLayout minimumInteritemSpacingForSectionAtIndex:(NSInteger)section {
  return 0.0;
}

- (void)widgetPerformUpdateWithCompletionHandler:(void (^)(NCUpdateResult))completionHandler {
  completionHandler(NCUpdateResultNoData);
}

- (void)widgetActiveDisplayModeDidChange:(NCWidgetDisplayMode)activeDisplayMode withMaximumSize:(CGSize)maxSize {
  CGFloat height = _collectionView.collectionViewLayout.collectionView.contentSize.height;
  
  if (activeDisplayMode == NCWidgetDisplayModeCompact) {
//    CGFloat height;
    
    if(_login == YES) {
      height = maxSize.height;
    } else {
      height = 300.0;
    }
    self.preferredContentSize = CGSizeMake(maxSize.width, height);
  } else if (activeDisplayMode == NCWidgetDisplayModeExpanded) {
    if(_login == YES) {
      height = height + 25.0;
    } else {
      height = 300.0;
    }
    NSLog(@"----->>  %f", height);
    self.preferredContentSize = CGSizeMake(maxSize.width, height);
  }
}


- (void)removeDeviceFromWidgets:(UIButton *)sender {
  [self.widgetDa deleteDevice: _allSelectedDevice[sender.tag]];
  [self fetchAllStoredDevices];
}

- (void)dimmerControl:(UIButton *)sender {
  
  CGPoint buttonPosition = [sender convertPoint:CGPointMake(0, 0) toView:self.collectionView];
  NSIndexPath *indexPath = [self.collectionView indexPathForItemAtPoint:buttonPosition];
  if (sender.tag == 5) {
    [self controlDevices:_allSelectedDevice[indexPath.row] method:16];
  } else if (sender.tag == 6) {
    [self controlDevices:_allSelectedDevice[indexPath.row] method:16];
  }
}

-(void)controlDevices: (Widget*)widget method:(int)value {
  NSString *url = @"";
    NSLog(@"-->%d", _dimmerValue);
    
  if([widget.devType isEqual: @"DEVICE"]) {
    url = [NSString stringWithFormat:@"https://api3.telldus.com/oauth2/device/command?id=%@&method=%d&value=null", widget.identifier, value];
  } else if([widget.devType isEqual: @"BELL"]) {
    url = [NSString stringWithFormat:@"https://api3.telldus.com/oauth2/device/command?id=%@&method=4&value=null", widget.identifier];
  } else if([widget.devType isEqual: @"LEARN"]) {
    url = @"";
  } else if([widget.devType isEqual: @"CONTROLDEV"]) {
    url = [NSString stringWithFormat:@"https://api3.telldus.com/oauth2/device/command?id=%@&method=%d&value=null", widget.identifier, value];
  }  else if([widget.devType isEqual: @"DIM"]) {
    if(_dimmerValue == 0) {
      _dimmerValue = 20;
      [[NSUserDefaults standardUserDefaults] setInteger:20 forKey:@"dimmerValue"];
    } else if(_dimmerValue == 20) {
      _dimmerValue = 40;
      [[NSUserDefaults standardUserDefaults] setInteger:20 forKey:@"dimmerValue"];
    } else if(_dimmerValue == 40) {
      _dimmerValue = 60;
      [[NSUserDefaults standardUserDefaults] setInteger:20 forKey:@"dimmerValue"];
    } else if(_dimmerValue == 60) {
      _dimmerValue = 80;
      [[NSUserDefaults standardUserDefaults] setInteger:20 forKey:@"dimmerValue"];
    } else if(_dimmerValue == 80) {
      _dimmerValue = 100;
      [[NSUserDefaults standardUserDefaults] setInteger:20 forKey:@"dimmerValue"];
    } else {
      _dimmerValue = 0;
      [[NSUserDefaults standardUserDefaults] setInteger:20 forKey:@"dimmerValue"];
    }
    url = [NSString stringWithFormat:@"https://api3.telldus.com/oauth2/device/command?id=%@&method=%d&value=%d", widget.identifier, value, _dimmerValue];
  }
  
  NSLog(@"%@", url);
  
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString: url] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:60.0];
  [request setHTTPMethod:@"GET"];
  
  [request setValue:_accessToken forHTTPHeaderField:@"Authorization"];
  [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
  [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
  
  NSURLResponse * response = nil;
  NSError * error = nil;
  NSData * data = [NSURLConnection sendSynchronousRequest:request
                                        returningResponse:&response
                                                    error:&error];
  NSLog(@"%@", data);
  NSLog(@"%d", value);
  if (error == nil) {
    
    NSError *error1;
    NSMutableDictionary * innerJson = [NSJSONSerialization
                                       JSONObjectWithData:data options:kNilOptions error:&error1
                                       ];
    NSLog(@"response json: %@", innerJson);
    
    NSLog(@"Request Success");
    widget.state = value;
    [self.widgetDa updateDevice:widget];
    [self fetchAllStoredDevices];
  } else {
    NSLog(@"Request failed");
  }
  
}

- (void)deviceUDSControl:(UIButton *)sender {
  CGPoint buttonPosition = [sender convertPoint:CGPointMake(0, 0) toView:self.collectionView];
  NSIndexPath *indexPath = [self.collectionView indexPathForItemAtPoint:buttonPosition];
  if (sender.tag == 2) {
    [self controlDevices:_allSelectedDevice[indexPath.row] method:128];
  } else if (sender.tag == 3) {
    [self controlDevices:_allSelectedDevice[indexPath.row] method:256];
  } else if (sender.tag == 4) {
    [self controlDevices:_allSelectedDevice[indexPath.row] method:512];
  }
}

- (void)deviceControl:(UIButton *)sender {
  NSLog(@"--- i and u bith are here");
  CGPoint buttonPosition = [sender convertPoint:CGPointMake(0, 0) toView:self.collectionView];
  NSIndexPath *indexPath = [self.collectionView indexPathForItemAtPoint:buttonPosition];
  if (sender.tag == 0) {
    [self controlDevices:_allSelectedDevice[indexPath.row] method:1];
  } else if (sender.tag == 1) {
    [self controlDevices:_allSelectedDevice[indexPath.row] method:2];
  }
}

- (IBAction)removeWidgetControl:(id)sender {
  _displayRemoveBtn = !_displayRemoveBtn;
  [_collectionView reloadData];
}

- (IBAction)addNewWidget:(id)sender {
  NSURL *url = [NSURL URLWithString:@"Widget://"];
  [self.extensionContext openURL:url completionHandler:^(BOOL success) {
    NSLog(@"fun=%s after completion. success=%d", __func__, success);
  }];
  [self.extensionContext completeRequestReturningItems:self.extensionContext.inputItems completionHandler:nil];
}

- (IBAction)clickToLogin:(id)sender {
  NSLog(@"-----here0--->");
  NSURL *url = [NSURL URLWithString:@"TelldusLiveApp://"];
  [self.extensionContext openURL:url completionHandler:^(BOOL success) {
    NSLog(@"fun=%s after completion. success=%d", __func__, success);
  }];
}

@end

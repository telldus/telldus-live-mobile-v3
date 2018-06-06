//
//  WidgetViewController.m
//  TodayWidgetDemo
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import "WidgetViewController.h"
#import "Widget.h"

@interface WidgetViewController ()
@property NSMutableArray<Widget*> *devices;
//@property NSMutableData *responseData;
@property Widget *selectedDevice;
@property UIPickerView *picker;
@property NSString* accessToken;
@end

@implementation WidgetViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  
  _accessToken = [[[NSUserDefaults alloc] initWithSuiteName:@"group.com.telldus.TokenUserDefaults"] stringForKey:@"accessToken"];
  
  _devices = [[NSMutableArray alloc] init];
  
  UIToolbar *toolBar = [[UIToolbar alloc] init];
  toolBar.barStyle = UIBarStyleDefault;
  [toolBar setTranslucent:YES];
  toolBar.tintColor = [UIColor colorWithRed:76/255 green:217/255 blue:100/255 alpha:1];
  [toolBar sizeToFit];
  
  UIBarButtonItem *doneBtn = [[UIBarButtonItem alloc] initWithTitle:@"Done" style:UIBarButtonItemStylePlain target:self action:@selector(donePicker)];
  UIBarButtonItem *flexibleItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace target:self action:nil];
  UIBarButtonItem *cancelBtn = [[UIBarButtonItem alloc] initWithTitle:@"Cancel" style:UIBarButtonItemStylePlain target:self action:@selector(cancelPicker)];
  NSArray *array = @[cancelBtn, flexibleItem, doneBtn];
  [toolBar setItems: array];
  [toolBar setUserInteractionEnabled:YES];
  
  _picker = [UIPickerView new];
  _picker.delegate = self;
  _picker.dataSource = self;
  _picker.showsSelectionIndicator = YES;
  _selectDevices.inputView = _picker;
  _selectDevices.inputAccessoryView = toolBar;
  
  [self getAllDevices];  
  _devicefontimage.text = @"device-alt";
  _devicefontimage.textColor = UIColor.whiteColor;
 
}

- (void)viewWillAppear:(BOOL)animated {
  [super viewWillAppear:animated];
 [_navBar setBarTintColor:[UIColor colorWithRed:0 green:0 blue:0 alpha:0]];
  
  UIImageView *imageView = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, 40, 40)];
  [imageView setContentMode:UIViewContentModeScaleAspectFit];
  imageView.image=[UIImage imageNamed:@"telldus_1.png"];
  [self.navigationItem.titleView addSubview:imageView];
}

-(void)donePicker {
  [self.view endEditing:YES];
  _selectDevices.text = _selectedDevice.name;
  WidgetDA *widgetDa = [[WidgetDA alloc] init];
  
//  NSLog()
  
  if ((_selectedDevice.state == 1) || (_selectedDevice.state == 2)) {
    _selectedDevice.devType = @"DEVICE";
  } else if (_selectedDevice.state == 4) {
    _selectedDevice.devType = @"BELL";
  } else if (_selectedDevice.state == 16) {
    _selectedDevice.devType = @"DIM";
  } else if (_selectedDevice.state == 32) {
    _selectedDevice.devType = @"LEARN";
  } else if (_selectedDevice.state == 128 || _selectedDevice.state == 256 || _selectedDevice.state == 512) {
    _selectedDevice.devType = @"CONTROLDEV";
  }
  [widgetDa addDevice:_selectedDevice];
}

-(void)cancelPicker {
  [self.view endEditing:YES];
}

- (void)getAllDevices {
  
  NSLog(@"--->>%@", _accessToken);
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString: @"https://api3.telldus.com/oauth2/devices/list?supportedMethods=951&includeIgnored=1"] cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:60.0];
  [request setHTTPMethod:@"GET"];  
  [request setValue:_accessToken forHTTPHeaderField:@"Authorization"];
  [request setValue:@"application/json" forHTTPHeaderField:@"Accept"];
  [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
  
  NSURLResponse * response = nil;
  NSError * error = nil;
  NSData * data = [NSURLConnection sendSynchronousRequest:request
                                        returningResponse:&response
                                                    error:&error];
  if (error == nil) {
    NSError *error1;
    NSMutableDictionary * innerJson = [NSJSONSerialization
                                       JSONObjectWithData:data options:kNilOptions error:&error1
                                       ];
    NSLog(@"response json: %@", innerJson);
    NSMutableArray *array = innerJson[@"device"];
    for (NSDictionary *dict in array) {
      Widget *widget = [[Widget alloc] init];
      widget.name = dict[@"name"];
      widget.clientDeviceId = dict[@"clientDeviceId"];
      widget.type = dict[@"type"];
      widget.client = dict[@"client"];
      widget.identifier = dict[@"id"];
      widget.clientName = dict[@"clientName"];
      widget.metadataHash = dict[@"metadataHash"];
      widget.statevalue = (dict[@"statevalue"] == nil || dict[@"statevalue"] == [NSNull null]) ? @"" : dict[@"statevalue"];
      widget.state = [dict[@"state"] intValue];
      widget.ignored = [dict[@"ignored"] intValue];
      widget.methods = [dict[@"methods"] intValue];
      widget.editable = [dict[@"editable"] intValue];
      widget.online = [dict[@"online"] intValue];
      [self.devices addObject:widget];
    }
    
    if ([_devices count] > 0) {
      _selectedDevice = [self.devices objectAtIndex:0];
    }
  } else {
    NSLog(@"Request failed %@", error.localizedDescription);
  }
}

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerView {
  return 1;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component {
  return _devices.count;
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component {
  return [self.devices objectAtIndex:row].name;
}

- (void)pickerView:(UIPickerView *)pickerView didSelectRow:(NSInteger)row inComponent:(NSInteger)component {
  if(_devices.count > 0) {
    _selectedDevice = [self.devices objectAtIndex:row];
  }
}
@end

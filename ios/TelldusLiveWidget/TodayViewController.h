//
//  TodayViewController.h
//  TelldusLiveWidget
//
//  Created by Telldus Technologies AB on 28/05/18.
//  Copyright © 2018 Telldus Technologies AB. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <NotificationCenter/NotificationCenter.h>

@interface TodayViewController : UIViewController <NCWidgetProviding, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout>

@property (weak, nonatomic) IBOutlet UICollectionView *collectionView;
@property (weak, nonatomic) IBOutlet UIView *loginView;
@property (weak, nonatomic) IBOutlet UIButton *loginBtn;

@end

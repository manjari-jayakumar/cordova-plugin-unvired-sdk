//
//  IOSSyncEnginePlugin.h
//  HTML5_KERNEL_iOS
//
//  Created by Srinidhi Anand Rao on 03/10/12.
//  Copyright (c) 2012 Unvired Software India Pvt. Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CDV.h"

@interface IOSSyncEnginePlugin : CDVPlugin

#pragma mark - S Y N C

- (void)submitInSync:(CDVInvokedUrlCommand *)command;

#pragma mark - A S Y N C

- (void)submitInASync:(CDVInvokedUrlCommand *)command;

#pragma mark - O T H E R S

- (void)getMessages:(CDVInvokedUrlCommand *)command;

- (void)registerNotifListener:(CDVInvokedUrlCommand *)command;

- (void)unRegisterNotifListener:(CDVInvokedUrlCommand *)command;

@end

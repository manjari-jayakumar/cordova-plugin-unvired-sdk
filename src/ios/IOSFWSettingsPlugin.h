//
//  IOSFWSettingsPlugin.h
//  HTML5_KERNEL_iOS
//
//  Created by Srinidhi Anand Rao on 03/10/12.
//  Copyright (c) 2012 Unvired Software India Pvt. Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CDV.h"

@interface IOSFWSettingsPlugin : CDVPlugin

- (void)startSettingActivity:(CDVInvokedUrlCommand *)command;

- (void)userSettings:(CDVInvokedUrlCommand *)command;

- (void)clearData:(CDVInvokedUrlCommand *)command;

- (void)updateSystemCredentials:(CDVInvokedUrlCommand *)command;

- (void)getSystemCredentials:(CDVInvokedUrlCommand *)command;

/**
 Returns version numbers.
 
 {
     "appVersion": "1.0",
     "appBuildNumber": "1234",
     "appRevisionNumber": "4567"
     
     "SDKVersion": "3.2",
     "SDKBuildNumber": "8767",
     "SDKRevisionNumber": "6947"
 }
 */
- (void)getVersionNumbers:(CDVInvokedUrlCommand *)command;

- (void)encrypt:(CDVInvokedUrlCommand *)command;

/**
 Input: { "LID" : "ABC21" }
 
 Returns: Array of InfoMessage Objects:
 {
 "type": "8000",
 "category": "FAILURE",
 "message": "Reason code must be specified."
 }
 
 */
- (void)getInfoMessages:(CDVInvokedUrlCommand *)command;

@end

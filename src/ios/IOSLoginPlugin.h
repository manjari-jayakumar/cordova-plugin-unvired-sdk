//
//  IOSLoginPlugin.h
//  iOS HTML5 Kernel
//
//  Created by Srinidhi on 09/09/14.
//  Copyright (c) 2014 Unvired Software India Pvt. Ltd. All rights reserved.
//

#import "CDV.h"

@interface IOSLoginPlugin : CDVPlugin

- (void)getAllAccount:(CDVInvokedUrlCommand *)command;

- (void)switchAccount:(CDVInvokedUrlCommand *)command;

- (void)deleteAccount:(CDVInvokedUrlCommand *)command;

- (void)login:(CDVInvokedUrlCommand *)command;

- (void)logout:(CDVInvokedUrlCommand *)command;

- (void)authenticateAndActivate:(CDVInvokedUrlCommand *)command;

- (void)authenticate:(CDVInvokedUrlCommand *)command;

- (void)authenticateLocal:(CDVInvokedUrlCommand *)command;

@end

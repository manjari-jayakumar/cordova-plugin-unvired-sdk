//
//  IOSLoggerPlugin.h
//  Unvired_Framework
//
//  Created by Venkadesh P on 13/05/16.
//  Copyright © 2016 Unvired Software India Pvt. Ltd. All rights reserved.
//

#import "CDVPlugin.h"
#import <MessageUI/MFMailComposeViewController.h>

@interface IOSLoggerPlugin : CDVPlugin <MFMailComposeViewControllerDelegate>

- (void)logDebug:(CDVInvokedUrlCommand *)command;

- (void)logError:(CDVInvokedUrlCommand *)command;

- (void)logImportant:(CDVInvokedUrlCommand *)command;

- (void)getLogs:(CDVInvokedUrlCommand *)command;

- (void)deleteLogs:(CDVInvokedUrlCommand *)command;

- (void)sendViaServer:(CDVInvokedUrlCommand *)command;

- (void)sendViaEmail:(CDVInvokedUrlCommand *)command;

@end

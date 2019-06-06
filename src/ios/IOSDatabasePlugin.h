//
//  IOSDatabasePlugin.h
//  HTML5_KERNEL_iOS
//
//  Created by Srinidhi Anand Rao on 03/10/12.
//  Copyright (c) 2012 Unvired Software India Pvt. Ltd. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CDV.h"

@interface IOSDatabasePlugin : CDVPlugin

/*
 * INSERT_BE action...
 * Takes an array of Business Entities.Retrive each array item(Header,items).Convert each header and each items to
 * JSDatastructure and insertOrUpdateBasedOnGID and return Header LID...
 */
- (void)insert:(CDVInvokedUrlCommand *)command;
- (void)insertOrUpdate:(CDVInvokedUrlCommand *)command;
- (void)select:(CDVInvokedUrlCommand *)command;
- (void)deleteRecord:(CDVInvokedUrlCommand *)command;
- (void)update:(CDVInvokedUrlCommand *)command;
- (void)executeQuery:(CDVInvokedUrlCommand *)command;
- (void)pullDb;
- (void)pushDb;

@end

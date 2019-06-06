//
//  AttachmentPlugin.h
//  UnviredCordovaSDK
//
//  Created by Srinidhi Rao on 20/11/17.
//  Copyright © 2017 Unvired Software India Pvt. Ltd. All rights reserved.
//

#import "CDV.h"

@interface AttachmentPlugin : CDVPlugin

- (void)createAttachmentItem:(CDVInvokedUrlCommand *)command;

- (void)uploadAttachment:(CDVInvokedUrlCommand *)command;

- (void)downloadAttachment:(CDVInvokedUrlCommand *)command;

- (void)getAttachmentFolderPath:(CDVInvokedUrlCommand *)command;

@end

/********* HelloWorld.m Cordova Plugin Implementation *******/

#import <Cordova/CDV.h>
#import "HelloWorld.h"

@implementation HelloWorld

- (void)coolMethod:(CDVInvokedUrlCommand*)command
{
    CDVPluginResult* pluginResult = nil;
    NSDictionary* echo = [command.arguments objectAtIndex:0];
    NSLog(@"SUCCESS ✅✅✅✅✅✅✅✅✅✅✅✅✅✅");
    if (echo != nil && echo.count > 0) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:echo[@"_sMessage"]];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end

//
//  IOSUtils.h
//  HTML5_KERNEL_iOS
//
//  Created by Srinidhi Anand Rao on 10/10/12.
//  Copyright (c) 2012 Unvired Software India Pvt. Ltd. All rights reserved.
//

/**
   This is a Utility class which does the following tasks:
   <ul>
   <li>Registering for Push Notification</li>
   <li>Handling the received push notification</li>
   <li>Calling Get Message</li>
   <li>Handling Application termination</li>
   </ul>
 */

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

static NSString *DONT_SHOW_PORT_ = @"DONT_SHOW_PORT_"; //followed by port name

@interface UnviredFrameworkUtils : NSObject

/**
 *  Encodes a given string using AES 256 with the key stored in Framework Database.
 *  
 *  @param stringToBeEncrypted String which needs encryption
 *  @return Returns a Base64 string representing the encrypted string.
 */
+ (NSString *)encrypt:(NSString *)stringToBeEncrypted error:(NSError **)error;

/**
 *  Encodes a given string using AES Encryption Algorithm with the key stored in Framework Database.
 *  @param encryptedBase64String Encrypted Base64 string
 *  @return String
 */
+ (NSString *)decrypt:(NSString *)encryptedBase64String error:(NSError **)error;

+ (void)lockApp;

/**
   Returns the Count of Inbox Items.
 */
+ (int)countOfInboxItems;

/**
   Set HTTP Connection Timeout. You can set this time interval before making a long running process agent call.
   @warning After the function call, call the method resetHTTPConnectionTimeout to reset to the default value.
 */
+ (void)setHTTPConnectionTimeout:(NSTimeInterval)timeout;

/**
   Resets the Timeout interval to the value specified in LoginParameters.httpConectionTimeoutInterval or to a default value if none specified.
 */
+ (void)resetHTTPConnectionTimeout;


/**
   Registers the application to receive APNS Notifications. This method should be called only upon successfull login which is notified through LoginActivityListener methods `-loginSuccessful` and `-authenticationAndActivationSuccessful`.
 */
+ (void)registerForAPNS;

/**
   Retreives all the pending messages in the server for this application. This method should be called only upon successfull login.
 */
+ (void)callGetMessage;

/**
   Resets the badge number and handles the notification if there are any.

   <b>Example</b>

     - (void)applicationDidBecomeActive:(UIApplication *)application
     {
         // Restart any tasks that were paused (or not yet started) while the application was inactive.
         // If the application was previously in the background, optionally refresh the user interface.

         // If there are Notifications call receive Data and reset the application Badge Number
         // Do this action only if the App is running opn the device
         [UnviredFrameworkUtils resetBadgeAndHandleNotificationForApplication:application];
     }

   @param application UIApplication Object
 */
+ (void)resetBadgeAndHandleNotificationForApplication:(UIApplication *)application;

/**
   Handles APNS Notifications received by this application. Call this method as following

   <b>Example</b>

     - (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
     {
         [UnviredFrameworkUtils handleNotificationforApplication:application
         withUserInfo:userInfo];
     }

   @param application UIApplication Object
   @param userInfo NSDicationary containing userInfo when the application receives notification.
 */
+ (void)handleNotificationforApplication:(UIApplication *)application
                            withUserInfo:(NSDictionary *)userInfo;

/**
   Send the APNS Token to the server. Use this method in your application's `AppDelegate` method `-application:didRegisterForRemoteNotificationsWithDeviceToken:`

   <b>Example</b>

     - (void)application:(UIApplication*)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData*)deviceToken
     {
        [UnviredFrameworkUtils sendDeviceTokenTotheServer:deviceToken];
     }

   @param deviceToken A NSData object representing the device token.
 */
+ (void)sendDeviceTokenTotheServer:(NSData *)deviceToken;

/**
   Handles the application termination.

   <b>Example</b>

     - (void)applicationWillTerminate:(UIApplication *)application
     {
         // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
         // Close the Application and Framework Databases
         [UnviredFrameworkUtils handleApplicationTermination];
     }

   @param error On input, a pointer to an error object. If an error occurs, this pointer is set to an actual error object containing the error information. You may specify nil for this parameter if you do not want the error information.

 */
+ (BOOL)handleApplicationTerminationWithError:(NSError **)error;

+ (float)getiOSVersion;

/** check whether system credentials are updated in the device. Write a block to present and dismiss the controller in the application and pass the block
   @param presentBlock A block to present UIViewController
   @param dismissBlock A block to dismiss presented UIViewController when the user skips System Credential Screens.
 */
+ (void)checkSystemCredentialsWithPresentBlock:(void (^) (UIViewController *))presentBlock dismissBlock:(void (^) ())dismissBlock;

/** returns the array of system credential objects */
+ (NSMutableArray *)getSystemCredentials;

/**
 Returns the App name as displayed in the iOS Device.
 */
+ (NSString *)getAppBundleDisplayName;

@end

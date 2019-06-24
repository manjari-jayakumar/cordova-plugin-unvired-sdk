
var exec = require('cordova/exec');
var parameters;

var UMP = function () {
};

var helper = function () {

}

var loginListenerType = {
    auth_activation_required: 0, // Mobile app not yet activated and requires authentication and activation
    app_requires_login: 1, // Mobile app requires offline / local login
    auth_activation_success: 2, // Account authenticated and activated on the server
    auth_activation_error: 3, // Acoount authentication or aactivation failed on the server
    login_success: 4, // Mobile app login successful
    login_error: 5, // Mobile app login failure
    app_requires_current_account: 6 // Multiple account found hence app has to set current active account
}

var loginType = {
    unvired: "UNVIRED_ID",
    ads: "ADS",
    sap: "SAP",
    custom: "CUSTOM"
}

/**
 *  loginMode is used to check for specific parameters for different mode 
 */
var loginMode = {
    authActivate: 0,
    authLocal: 1,
    forgotPassword: 2
}
/**
 * result type in returned callbackResult
 */
var resultType = {
    success: 0,
    error: 1
}
/**
 * Decide application data add /modify / delete based on the request type.
 * 0. RQST - Response for client initiated request. Act based on the 'action' flag.
 * 1. PULL - Server initiated push. The data on the client should be replaced with this data. 
 * 2. PUSH - Backend application initiated push of data. Act on this based on the 'action' flag.
 * 3. QUERY - Data query requests from client to server.
 * 4. REQ - Data submit only requests from client to server.
 */
var requestType = {
    RQST: 0,
    PULL: 1,
    PUSH: 2,
    QUERY: 3,
    REQ: 4
}

var conflictRule = {
    SERVER_WINS: 0,
    CLIENT_WINS: 1
}

var AttachmentItemStatus = {
    DEFAULT: 0,
    QUEUED_FOR_DOWNLOAD: 1,
    DOWNLOADED: 2,
    ERROR_IN_DOWNLOAD: 3,
    SAVED_FOR_UPLOAD: 4,
    UPLOADED: 5,
    ERROR_IN_UPLOAD: 6,
    MARKED_FOR_DELETE: 7,
    EXTERNAL: 8
}

var notifListenerType = {
    dataSend: 0, //Notify successful asynchronous send of data to the server.
    dataChanged: 1, //Notify data changes for each BusinessEntity when received data from server.
    dataReceived: 2, //Notify data receive completion on receive of all BusinessEntity
    appReset: 3, //Notify application data reset.
    attachmentDownloadSuccess: 4, // Notify application with error message and attchment item on attachment download error
    attachmentDownloadError: 5, //Notify application with error message and attchment item on attachment download success 
    incomingDataProcessingFinished: 6, //Notify application when incoming data handling finished 
    attachmentDownloadWaiting: 7, //Notify application when attachment download is waiting on the server
    infoMessage: 8, //Notify application with any InfoMessages
    serverError: 9, //Notify application with Server errors
    attachmentDownloadCompleted: 10 //Notify attachment downloads completed
}

var metadata = {
    "sMeta": [],
    "fMeta": [],
    "bMeta": []
}

const httpType = {
    get: "GET",
    post: "POST",
    del: "DELETE"
};

var restApis = {
    defaultApi: '/UMP/API/v2/applications/',
    activate: '/activate/',
    authenticate: '/authenticate',
    session: '/UMP/API/v2/session/',
    execute: '/execute/',
    users: '/UMP/API/v2/users/'
};

UMP.prototype.logDebug = function (sourceClass, method, message) {
    cordova.exec(null, null, "LoggerPlugin", "logDebug", [{
        "srcClass": sourceClass,
        "srcMethod": method,
        "message": message
    }]);
    console.log("Debug | " + sourceClass + " | " + method + " | " + message + " | ");
};

UMP.prototype.logError = function (sourceClass, method, message) {
    cordova.exec(null, null, "LoggerPlugin", "logError", [{
        "srcClass": sourceClass,
        "srcMethod": method,
        "message": message
    }]);
    console.log("Error | " + sourceClass + " | " + method + " | " + message + " | ");
};

UMP.prototype.logInfo = function (sourceClass, method, message) {
    cordova.exec(null, null, "LoggerPlugin", "logImportant", [{
        "srcClass": sourceClass,
        "srcMethod": method,
        "message": message
    }]);
    console.log("Important | " + sourceClass + " | " + method + " | " + message + " | ");
};

UMP.prototype.logRead = function (success, fail) {
    cordova.exec(success, fail, "LoggerPlugin", "getLogs", []);
}

UMP.prototype.logDelete = function () {
    cordova.exec(null, null, "LoggerPlugin", "deleteLogs", []);
};

UMP.prototype.sendLogToServer = function (success, fail) {
    cordova.exec(success, fail, "LoggerPlugin", "sendViaServer", []);
};

UMP.prototype.sendLogViaEmail = function (success, fail) {
    cordova.exec(success, fail, "LoggerPlugin", "sendViaEmail", []);
};

UMP.prototype.login = function (loginParameters, success, fail) {
    parameters = loginParameters
    if (helper.isEmpty(parameters.appName)) {
        helper.sendError("Please provide valid app name!", fail);
        return;
    }
    cordova.exec(success, fail, "LoginPlugin", "login", [parameters]);
};
/**;
 * logout() - Close all database and shut down all thread
 */
UMP.prototype.logout = function (success, fail) {
    cordova.exec(success, fail, "LoginPlugin", "logout", []);
};

/**
 * authenticateAndActivate - authenticate and activate application against ump. Framework gives callback to registered LoginListener
 * Returns response object with Type (success/failure) and message
 *
 * Example - ump.login.parameters.appName = "SAP_ERP_SO_TEMPLATE";
 *           ump.login.parameters.username ="TARAK";
 *           ump.login.parameters.url = "http://demo.unvired.io/UMP";
 *           ump.login.parameters.company = "UNVIRED";
 *
 *           ump.login.authenticateAndActivate(callback(res){ });
 *
 *  in Login listener callback check   if(res.type === ump.login.listenerType.auth_success){  //Navigate to Application Home  }
 *
 *  @param {function} callback - (Optional) user supplied async callback / error handler
 */
UMP.prototype.authenticateAndActivate = function (loginParameters, success, fail) {
    /* Add to the existing Login Parameters */

    for (var k in loginParameters) parameters[k] = loginParameters[k];

    if (!helper.validateLoginParameters(loginMode.authActivate, fail))
        return;

    cordova.exec(success, fail, "LoginPlugin", "authenticateAndActivate", [parameters]);
};
/**
 * authenticateLocal - Authenticate with username,password saved in database
 *
 * Example - ump.login.parameters.username ="TARAK";
 *           ump.login.parameters.password = "MS123*";
 *
 *           ump.login.authenticateLocal(callback(res){ });
 *
 *  in Login listener callback check   if(res.type === ump.login.listenerType.login_success){  //Handle login success  }
 *
 *  @param {function} callback - (Optional) user supplied async callback / error handler
 *
 *  Mobile Only api
 */
UMP.prototype.authenticateLocal = function (loginParameters, success, fail) {
    /* Add to the existing Login Parameters */
    for (var k in loginParameters) parameters[k] = loginParameters[k];

    if (!helper.validateLoginParameters(loginMode.authLocal, fail))
        return;
    cordova.exec(success, fail, "LoginPlugin", "authenticateLocal", [parameters]);
};
/**
 * getAllAccount - Get all existing Account
 *
 *  @param {function} callback - (Optional) user supplied async callback / error handler
 *
 *  Mobile Only api
 */
UMP.prototype.getAllAccounts = function (success, fail) {
    cordova.exec(success, fail, "LoginPlugin", "getAllAccount", []);
};
/**
 * switchAccount - Switch to given Account.
 *
 *  @param {object} account - Account to switch
 *  @param {function} callback - (Optional) user supplied async callback / error handler
 *
 *  Mobile Only api
 */
UMP.prototype.switchAccount = function (account, success, fail) {
    cordova.exec(success, fail, "LoginPlugin", "switchAccount", [account]);
};
/**
 * deleteAccount - Delete given Account
 *
 *  @param {object} account - Account to switch
 *  @param {function} callback - (Optional) user supplied async callback / error handler
 *
 * Mobile Only api
 */
UMP.prototype.deleteAccount = function (account, success, fail) {
    cordova.exec(success, fail, "LoginPlugin", "deleteAccount", [account]);
};



/**
 * getInfoMessages - Get list of InfoMessages
 */
UMP.prototype.getInfoMessages = function (headerName, lid, success, fail) {
    cordova.exec(success, fail, "SettingsPlugin", "getInfoMessages", [{ 'headerName': headerName, 'LID': lid }]);
};
/**
 * userSettings - Get current User information
 * @param {function} callback
 */
UMP.prototype.userSettings = function (success, fail) {
    cordova.exec(success, fail, "SettingsPlugin", "userSettings", []);
};
/**
 * updateSystemCredentials - Save System Credentials
 */
UMP.prototype.updateSystemCredentials = function (credentials, success, fail) {
    cordova.exec(success, fail, "SettingsPlugin", "updateSystemCredentials", credentials);
};
/**
 * getSystemCredentials - Get all System Credentials
 */
UMP.prototype.getSystemCredentials = function (success, fail) {
    cordova.exec(success, fail, "SettingsPlugin", "getSystemCredentials", []);
};
/**
*  Get Version Infrmation
*/
UMP.prototype.getVersionNumbers = function (success, fail) {
    cordova.exec(success, fail, "SettingsPlugin", "getVersionNumbers", []);
};
/**
 * clearData - clear application databases and files
 */
UMP.prototype.clearData = function (success, fail) {
    cordova.exec(success, fail, "SettingsPlugin", "clearData", []);
};
/**
 * Check for Internet connection
 */
UMP.prototype.hasInternet = function (success, fail) {
    cordova.exec(success, fail, "SettingsPlugin", "hasInternet", []);
};

/**
 * pullDb - pull database file to "temp" folder for development purpose only
 *
 * @param {function} callback - (Optional) user supplied async callback / error handler
 */
UMP.prototype.pullDb = function (success, fail) { // REMOVE
    cordova.exec(success, fail, "DatabasePlugin", "pullDb", []);
};
/**
 * pushDB - push updated database file from "temp" folder to application directory for development purpose only
 *
 * @param {function} callback - (Optional) user supplied async callback / error handler
 */
UMP.prototype.pushDB = function (success, fail) { // REMOVE
    cordova.exec(success, fail, "DatabasePlugin", "pushDb", []);
};
/**
 * encrypt - Get encrypted string
 * @param {function} callback
 */
UMP.prototype.encrypt = function (input, success, fail) {
    cordova.exec(success, fail, "DatabasePlugin", "encrypt", [input]);
};
/**
 * Guid
 */
UMP.prototype.guid = function () {
    return helper.guid();
};

/**
 * select - select records from table
 *
 * Example - ump.db.select("CUSTOMERS_RESULTS_HEADER",{'F_NAME':'TARAK','EMP_NO':'0039'},function(result){});
 *
 * @param {string} tableName table name
 * @param {object} whereClause Json object contains field name-value
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 * e.g.
 */
//TODO Handle != clause
UMP.prototype.dbSelect = function (tableName, whereClause, success, fail) {
    var query = {
        "tableName": tableName,
        "whereClause": null
    };
    if (whereClause && whereClause !== null && whereClause !== "") {
        query.whereClause = whereClause;
    }
    cordova.exec(success, fail, "DatabasePlugin", "select", [query]);
};
/**
 * insert - insert record into table
 * In borwser insert always insert or update based on gid
 * Example - ump.db.insert("CUSTOMER_HEADER",{"NAME":"TARAK","NO":"0039"....},true/false,callback);
 *
 * @param {string} tableName table name
 * @param {Object} structureObject - Json object contains field name-value
 * @param {boolean} isHeader - is dataStructure a header or item?
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 */
UMP.prototype.dbInsert = function (tableName, structureObject, isHeader, success, fail) {
    var query = {
        "tableName": tableName,
        "isHeader": isHeader,
        "fields": structureObject
    };
    cordova.exec(success, fail, "DatabasePlugin", "insert", [query]);
};
/**
 * insertOrUpdate - insert record or update record if exists into table
 *
 * Example - ump.db.insert("CUSTOMER_HEADER",{"NAME":"TARAK","NO":"0039"....},true/false,callback);
 *
 * @param {string} tableName table name
 * @param {Object} structureObject - Json object contains field name-value
 * @param {boolean} isHeader - is dataStructure a header or item?
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 */
UMP.prototype.dbInsertOrUpdate = function (tableName, structureObject, isHeader, success, fail) {
    var query = {
        "tableName": tableName,
        "isHeader": isHeader,
        "fields": structureObject
    };
    cordova.exec(success, fail, "DatabasePlugin", "insertOrUpdate", [query]);
};
/**
 * deleteRecord - delete record entry from table
 *
 * Example - ump.db.deleteRecord("CUSTOMER_HEADER",{'EMP_NO':'0039'},callback);
 *
 * @param {string} tableName - table name
 * @param {object} whereClause - (Optional)Json object contains field name-value
 * @param {function} callback - (Optional) user supplied async callback / error handler
 */
UMP.prototype.dbDelete = function (tableName, whereClause, success, fail) {
    var query = {};
    if (whereClause == "" || whereClause == null || whereClause == undefined) {
        query = {
            "tableName": tableName,
            "whereClause": ""
        };
    }
    else {
        query = {
            "tableName": tableName,
            "whereClause": whereClause
        };
    }
    cordova.exec(success, fail, "DatabasePlugin", "deleteRecord", [query]);
};
/**
 * update - update existing record entry in table
 *
 * Example - ump.db.update("CUSTOMER_HEADER",{'SSN':'0097658'},{'EMP_NO':'0039'},callback);
 *
 * @param {string} tableName - table name
 * @param {object} updatedObject - Json object contains only updated field name-value
 * @param {object} whereClause - Json object contains field name-value
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 */
UMP.prototype.dbUpdate = function (tableName, updatedObject, whereClause, success, fail) {
    var query = {
        "tableName": tableName,
        "fields": updatedObject,
        "whereClause": whereClause
    };
    cordova.exec(success, fail, "DatabasePlugin", "update", [query]);
};
/**
 * executeStatement - execure raw query
 *
 * Example - ump.db.executeStatement("SELECT name,COUNT(*) as COUNT FROM CUSTOMERS_RESULTS_HEADER",function(result){// check result.data});
 *
 * @parem {string} query - complete sql query to be executed
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 * Mobile Only api
 */
UMP.prototype.dbExecuteStatement = function (query, success, fail) {
    cordova.exec(success, fail, "DatabasePlugin", "executeQuery", [query]);
};
/**
    * createSavePoint - create a save point for db transaction
    */
UMP.prototype.dbCreateSavePoint = function (savePoint) {
    cordova.exec(null, null, "DatabasePlugin", "createSavePoint", [savePoint]);
};
/**
    * releaseSavePoint - release a save point for db transaction
    */
UMP.prototype.dbReleaseSavePoint = function (savePoint) {
    cordova.exec(null, null, "DatabasePlugin", "releaseSavePoint", [savePoint]);
};
/**
    * rollbackSavePoint - rollback a save point for db transaction
    */
UMP.prototype.dbRollbackToSavePoint = function (savePoint) {
    cordova.exec(null, null, "DatabasePlugin", "rollbackToSavePoint", [savePoint]);
};
/**
    * beginTransaction - Begin a db transaction
    */
UMP.prototype.dbBeginTransaction = function () {
    cordova.exec(null, null, "DatabasePlugin", "beginTransaction", []);
};
/**
    * endTransaction - End a db transaction
    */
UMP.prototype.dbEndTransaction = function () {
    cordova.exec(null, null, "DatabasePlugin", "endTransaction", []);
};

/**
 * launchFile - Luanch file in deafult system application
 * @param filePath File complete path
 * @param callback (Optional) user supplied async callback / error handler
 */
UMP.prototype.launchFile = function (filePath, success, fail) {
    cordova.exec(success, fail, "ProxyPlugin", "launchFile", [filePath]);
};
/**
 * launchBase64 - Save Base64 string in a file and luanch the file in deafult system application
 * @param {string} base64 File content as base64 string
 * @param {string} fileName (Optional) file name to be saves as. Default name is "Temp"
 * @param {string} extension (Optional) file extension to be saves as. Default extension is ".pdf"
 * @param callback (Optional) user supplied async callback / error handler
 */
UMP.prototype.launchBase64 = function (base64String, fileName, extension, success, fail) {
    fileName = helper.isEmpty(fileName) ? "Temp" : fileName;
    extension = helper.isEmpty(extension) ? ".pdf" : extension;
    cordova.exec(success, fail, "ProxyPlugin", "launchBase64", [{ 'base64': base64String, 'fileName': fileName, 'extension': extension }]);
};
/**
 * unzip - Unzip source file to destination path
 * @param srcPath Source file complete path
 * @param destPath Destination path
 * @param callback (Optional) user supplied async callback / error handler
 */
UMP.prototype.unzip = function (srcPath, destPath, success, fail) {
    cordova.exec(success, fail, "ProxyPlugin", "unzip", [{ 'srcPath': srcPath, 'destPath': destPath }]);
};


/**
 * getAttachmentFolderPath - Get attachment directory path
 * Required to get complete attachment file path in iOS. cancatenate this path with file name to get complete file path
 */
UMP.prototype.getAttachmentFolderPath = function (success, fail) {
    cordova.exec(success, fail, "AttachmentPlugin", "getAttachmentFolderPath", []);
};
/**
 * createAttachmentItem - Copy attachment file to application folder and insert attachment itme to databade with updated local path
 * @param {string} tableName attachment item table name
 * @param {Object} structureObject - Attachment Item Json object contains field name-value
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 */
UMP.prototype.createAttachmentItem = function (tableName, structureObject, success, fail) {
    var query = {
        "tableName": tableName,
        "fields": structureObject
    };
    cordova.exec(success, fail, "AttachmentPlugin", "createAttachmentItem", [query]);
};
/**
 * uploadAttachment - Upload attachment
 * @param {string} tableName attachment item table name
 * @param {Object} structureObject - Attachment Item Json object contains field name-value
 * @param {boolean} isAsync - Upload attachment in Async or Sync. Default to Async
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 */
UMP.prototype.uploadAttachment = function (tableName, structureObject, isAsync, success, fail) {
    if (isAsync === void 0) { isAsync = true; }
    var param = {
        "tableName": tableName,
        "fields": structureObject,
        "isAsync": isAsync
    };
    cordova.exec(success, fail, "AttachmentPlugin", "uploadAttachment", [param]);
};
/**
 * downloadAttachment - Download attachment
 * @param {string} tableName attachment item table name
 * @param {Object} structureObject - Attachment Item Json object contains field name-value
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 */
UMP.prototype.downloadAttachment = function (tableName, structureObject, success, fail) {
    var param = {
        "tableName": tableName,
        "fields": structureObject
    };
    cordova.exec(success, fail, "AttachmentPlugin", "downloadAttachment", [param]);
};


/**
 * submitInSync - submit data to ump server in sync mode
 *
 * Example - ump.sync.submitInSync(CUSTOMER_INPUT_HEADER,"","UNVIRED_CUSTOMER_SEARCH_ECC_PA_GET_CUSTOMERS", true, callback);
 *
 * @param {requestType} reqype - Message request type(RQST/PULL/PUSH/QUERY/REQ) to be sent to the server.
 * @param {object} header - Header Datastructure  {"Header name": {field name : field value,...}}
 * @param {string} customData - custome data as string
 * @param {string} paFunction - Name of the process agent that is required to be called in the server.
 * @param {boolean} autoSave - flag to decide whether framework should save the data in databse or not.
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 */
UMP.prototype.syncForeground = function (reqype, header, customData, paFunction, autoSave, success, fail) {
    var query = {
        "requestType": reqype,
        "header": header == null ? "" : header,
        "customData": customData == null ? "" : customData,
        "autoSave": autoSave,
        "paFunction": paFunction
    };
    cordova.exec(success, fail, "SyncEnginePlugin", "submitInSync", [query]);
};
/*
    * submitDataInASync - submit data to ump server in async mode. Application will be notified through register NotificationListener callback.
    *
    * Example - ump.sync.submitInAsync(requestType.RQST,CUSTOMER_HEADER,"","UNVIRED_CUSTOMER_SEARCH_ECC_PA_GET_CUSTOMERS","CUSTOMER",CUSTOMER_HEADER.LID, true, callback);
    *
    * @param {requestType} reqType - Message request type (RQST/PULL/PUSH/QUERY) to be sent to the server.
    * @param {object} header - Header Datastructure object  {"Header name": {field name : field value,...}}
    * @param {string} customData -  custom data
    * @param {string} paFunction - Name of the process agent that is required to be called in the server.
    * @param {string} beName - Name of the BusinessEntity
    * @param {string} beLid - LID of Header
    * @param {boolean} bypassAttachment - boolean whether to ignore attachment while sending data to server
    * @param {function} callback - (Optional) user supplied async callback / error handler
    */
UMP.prototype.syncBackground = function (reqype, header, customData, paFunction, beName, belid, bypassAttachment, success, fail) {
    var query = {
        "requestType": reqype,
        "header": header == null ? "" : header,
        "customData": customData == null ? "" : customData,
        "paFunction": paFunction,
        "beName": beName,
        "belid": belid,
        "bypassAttachment": bypassAttachment
    };
    cordova.exec(success, fail, "SyncEnginePlugin", "submitInASync", [query]);
};
/**
 * getMessages - Request for downloading messages in ready state from server and will be notified through Notification Listener
 *
 *  @param {function} callback - (Optional) user supplied async callback / error handler
 *
 * Mobile Only api
 */
UMP.prototype.getMessages = function () {
    cordova.exec(null, null, "SyncEnginePlugin", "getMessages", []);
};
/**
 * registerNotificationListener - Register for callback on GetMessage status
 *
 * @param {function} callback - (Optional) user supplied async callback / error handler
 *
 * Mobile Only api
 */
UMP.prototype.registerNotifListener = function (success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "registerNotifListener", []);
};
/**
 * unRegisterNotificationListener - UnRegister for callback on GetMessage status
 *
 *  @param {function} callback - (Optional) user supplied async callback / error handler
 *
 * Mobile Only api
 */
UMP.prototype.unRegisterNotifListener = function () {
    cordova.exec(null, null, "SyncEnginePlugin", "unRegisterNotifListener", []);
};
/**
 * isInOutbox - Check whether BE is already in OutBox or not.
 *
 * @param {string} beLid - LID of BE Header
 *
 * returns true/false
 */
UMP.prototype.isInOutBox = function (beLid, success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "isInOutBox", [beLid]);
};
/**
 * outBoxItemCount - Get count of items in OutBox
 *
 * returns count
 */
UMP.prototype.outBoxItemCount = function (success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "outBoxItemCount", []);
};
/**
 * isInSentItem - Check whether BE is already in SentItem or not.
 *
 * @param {string} beLid - LID of BE Header
 *
 * returns true/false
 */
UMP.prototype.isInSentItem = function (beLid, success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "isInSentItem", [beLid]);
};
/**
* sentItemCount - Get count of items in Sentitem
*
* returns count
*/
UMP.prototype.sentItemCount = function (success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "sentItemCount", []);
};
/**
* inBoxItemCount - Get count of items in InBox
*
* returns count
*/
UMP.prototype.inBoxItemCount = function (success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "inBoxItemCount", []);
};
/**
* deleteOutBoxEntry - Delete BE from OutBox.
*
* @param {string} beLid - LID of BE Header
*
* returns true/false
*/
UMP.prototype.deleteOutBoxEntry = function (beLid, success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "deleteOutBoxEntry", [beLid]);
};
/**
* resetApplicationSyncData - Reset application Sync related data(OutObject,SentItemObject,InObject,AttachmentOutObject,AttachmentQObject,Attachment folder).
*/
UMP.prototype.resetApplicationSyncData = function (success, fail) {
    cordova.exec(success, fail, "SyncEnginePlugin", "resetApplicationSyncData", []);
};
UMP.prototype.requestType = requestType;

helper.isEmpty = function (value) {
    if (value == undefined || value === null || value === "")
        return true;
    return false;
};
helper.validateLoginParameters = function (mode, callback) {
    if (this.isEmpty(parameters.loginType)) {
        this.sendError("No Login Type specified in LoginParameters!", callback);
        return false;
    }
    // FIXME: 
    if (parameters.loginType === 'sap' /* this.loginType.sap */ || parameters.loginType === 'ads' /* this.loginType.ads */) {
        if (!parameters.domain) {
            this.sendError("Please provide Domain!", callback);
            return false;
        }
    }
    if (this.isEmpty(mode)) {
        this.sendError("Please set Login Mode!", callback);
        return false;
    }
    var err = undefined;
    switch (mode) {
        case loginMode.authActivate:
            if (this.isEmpty(parameters.url))
                err = "Please provide Url!";
            else if (this.isEmpty(parameters.company))
                err = "Please provide Company Name!";
            else if (this.isEmpty(parameters.username))
                err = "Please provide User Id!";
            else if (this.isEmpty(parameters.password))
                err = "Please provide Password!";
            if (err) {
                this.sendError(err, callback);
                return false;
            }
            break;
        case loginMode.authLocal:
            if (this.isEmpty(parameters.username))
                err = "Please provide User Id!";
            else if (this.isEmpty(parameters.password))
                err = "Please provide Password!";
            if (err) {
                this.sendError(err, callback);
                return false;
            }
            break;
        case loginMode.forgotPassword:
            break;
    }
    return true;
};
helper.guid = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1).toUpperCase();
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

/**
* Clear loki databases
*/
helper.clearLokiDbs = function () {
    localStorage.removeItem("APP_LOKI_DB");
    localStorage.removeItem("FW_LOKI_DB");
    localStorage.removeItem(login.parameters.appName);
    webDb.appDb = null;
    webDb.fwDb = null;
};

helper.sendError = function (msg, callback) {
    var cbResult = {};
    cbResult.type = resultType.error;
    cbResult.error = msg;
    callback(cbResult);
};

/**
 * restUtil - Provides apis to make rest api call.
 *
 * Internal use only module
 */
var restUtil = /** @class */ (function () {
    function restUtil() {
    }
    /**
     * Rest Api call
     * TODO : Remove JQuery dependency for ajax call
     */
    restUtil.performRequest = function (endpoint, msg, callback, httpType) {
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': restUtil.appMeta.authorization
        };
        var postData = {
            frontendUser: restUtil.appMeta.frontEnd,
            messageFormat: 'standard',
            inputMessage: JSON.stringify(msg),
            /**
             * Parameters require for sending SAP port name/ password in initial auth call
             * Clear this on success callback. Henceforth use authkey for subcsequent calls
             */
            credentials: restUtil.appMeta.credentials
        };
        var methodType = httpType ? httpType : "POST";
        $.ajax({
            type: methodType,
            url: endpoint,
            data: postData,
            success: function (res) {
                restUtil.hanldeRestApiCallback(true, res, callback);
            },
            error: function (res) {
                restUtil.hanldeRestApiCallback(false, res, callback);
            },
            headers: headers,
            dataType: 'json'
        });
    };
    restUtil.hanldeRestApiCallback = function (isSuccess, result, callback) {
        var cbResult = {};
        if (isSuccess) {
            cbResult.type = resultType.success;
            cbResult.message = (result && result.message) ? result.message : "";
            cbResult.data = result;
        }
        else {
            cbResult.type = resultType.error;
            cbResult.error = (result && result.responseText) ? result.responseText : "";
            cbResult.message = (result && result.message) ? result.message : "";
        }
        callback(cbResult);
    };
    restUtil.removeLokiMeta = function (postMessage) {
        function traverse(o) {
            for (var i in o) {
                if (!!o[i] && typeof (o[i]) == "object") {
                    // console.log(i, o[i])
                    delete o["$loki"];
                    delete o["meta"];
                    //if(i === "$loki" || i === "meta") delete o[i];
                    traverse(o[i]);
                }
            }
        }
        if (postMessage != "") {
            postMessage = JSON.parse(JSON.stringify(postMessage));
        }
        traverse(postMessage);
        return postMessage;
    };
    restUtil.appMeta = {};
    restUtil.httpType = {
        get: "GET",
        post: "POST",
        del: "DELETE"
    };
    return restUtil;
}());
;
/**
 * loki - inmemory js librabry required for persisting data on web
 * appDb - host application data
 * fwDb - host framework data
 * webDb - Internal use only module
 */
var webDb = /** @class */ (function () {
    function webDb() {
    }
    webDb.initialize = function () {
        var appDbName = helper.isEmpty(login.parameters.appName) ? "APP_LOKI_DB" : login.parameters.appName;
        if (webDb.appDb == null) {
            var idbAdapter = new LokiIndexedAdapter();
            webDb.appDb = new loki(appDbName, { adapter: idbAdapter, autoload: true });
            webDb.appDb.loadDatabase({});
            webDb.appDb.saveDatabase();
        }
        if (webDb.fwDb == null) {
            webDb.fwDb = new loki('FW_LOKI_DB');
            webDb.fwDb.loadDatabase({});
            webDb.fwDb.saveDatabase();
        }
    };
    webDb.reload = function () {
        var appDbName = helper.isEmpty(login.parameters.appName) ? "APP_LOKI_DB" : login.parameters.appName;
        if (webDb.appDb == null) {
            webDb.appDb = new loki(appDbName);
            webDb.appDb.loadDatabase(JSON.parse(localStorage[appDbName]));
            webDb.appDb.saveDatabase();
        }
        if (webDb.fwDb == null) {
            webDb.fwDb = new loki('FW_LOKI_DB');
            webDb.fwDb.loadDatabase(JSON.parse(localStorage['FW_LOKI_DB']));
            webDb.fwDb.saveDatabase();
        }
    };
    /**
     *  insert or update based on gids
     */
    webDb.insert = function (name, structure, isFw) {
        var db = (isFw) ? webDb.fwDb : webDb.appDb;
        var headerInCollection = db.getCollection(name);
        if (headerInCollection == null) {
            headerInCollection = db.addCollection(name);
        }
        var structureInDB = null;
        if (!isFw) {
            structureInDB = webDb.getBasedOnGid(name, structure);
        }
        if (structureInDB == null) {
            //Create LID field if missing
            if (helper.isEmpty(structure["LID"])) {
                structure["LID"] = helper.guid();
            }
            headerInCollection.insert(structure);
        }
        else {
            structure = helper.copyProperty(structure, structureInDB);
            headerInCollection.update(structure);
        }
        db.saveDatabase();
    };
    webDb.select = function (name, whereClause, isFw) {
        var db = (isFw) ? webDb.fwDb : webDb.appDb;
        var headerInCollection = db.getCollection(name);
        if (headerInCollection === null)
            return [];
        if (!helper.isEmpty(whereClause)) {
            return headerInCollection.findObjects(whereClause);
        }
        return headerInCollection.data;
    };
    //Cascade delete
    webDb.deleteCascade = function (tableName, structure, isFw) {
        var db = (isFw) ? webDb.fwDb : webDb.appDb;
        var structureInDB = webDb.getBasedOnGid(tableName, structure);
        if (structureInDB && (structureInDB != null)) {
            var children = helper.getBeChildrenNames(tableName);
            if ((children != null) && (children.length > 0)) {
                for (var i = 0; i < children.length; i++) {
                    var childrenCollection = db.getCollection(children[i]["name"]);
                    if (childrenCollection != null) {
                        childrenCollection.removeWhere({ 'FID': structureInDB.LID });
                    }
                }
            }
            var parentCollection = db.getCollection(tableName);
            if (parentCollection != null) {
                parentCollection.removeWhere({ 'LID': structureInDB.LID });
            }
        }
        db.saveDatabase();
    };
    webDb.getCollection = function (tableName) {
        return webDb.appDb.getCollection(name);
    };
    webDb.saveAppMeta = function (appMeta) {
        webDb.insert("appMeta", appMeta, true);
    };
    webDb.getAppMeta = function () {
        var appMeta = webDb.select("appMeta", "", true);
        if (appMeta != null && appMeta.length > 0)
            return appMeta[0];
        return null;
    };
    /**
     * Considering structure name is unique.(Not handling same structure across multiple BusinessEntity)
     */
    webDb.getBasedOnGid = function (name, structure) {
        if (helper.isEmpty(name))
            return null;
        var gids = metadata.fMeta.filter(function (e) {
            return e.sName === name && e.isGid === true;
        });
        if (gids == null || gids.length <= 0)
            return null;
        var qry = {};
        gids.forEach(function (g) {
            qry[g.name] = structure[g.name];
        });
        var headerInCollection = webDb.appDb.getCollection(name);
        if (headerInCollection === null)
            return null;
        return headerInCollection.findObject(qry);
    };
    webDb.reCreateAppDb = function () {
        var appDbName = helper.isEmpty(login.parameters.appName) ? "APP_LOKI_DB" : login.parameters.appName;
        localStorage.removeItem("APP_LOKI_DB");
        localStorage.removeItem(login.parameters.appName);
        var idbAdapter = new LokiIndexedAdapter();
        webDb.appDb = new loki(appDbName, { adapter: idbAdapter, autoload: true });
        webDb.appDb.loadDatabase({});
        webDb.appDb.saveDatabase();
    };
    webDb.appDb = null;
    webDb.fwDb = null;
    return webDb;
}());
;
/**
 * Parse and save data
 *
 * Internal use only module
 */
var parser = /** @class */ (function () {
    function parser() {
    }
    parser.parseServerResponse = function (data, reqype) {
        var cbResult = {};
        cbResult.type = resultType.success;
        cbResult.data = data;
        cbResult.message = "";
        //Get InfoMessage
        if (data.hasOwnProperty("InfoMessage")) {
            var infoArr = data["InfoMessage"];
            infoArr.forEach(function (element) {
                helper.saveInfoMessage(element);
                cbResult.message = cbResult.message + " " + element.message;
                if (element.category === "FAILURE") {
                    cbResult.type = resultType.error;
                }
            });
        }
        for (var property in data) {
            if (property === "InfoMessage") {
                continue;
            }
            else {
                var beArr = data[property];
                //Clear BE for PULL request.
                if (reqype == ump.requestType.PULL) {
                    var children = helper.getBeTableNames(property);
                    if ((children != null) && (children.length > 0)) {
                        for (var i = 0; i < children.length; i++) {
                            var childrenCollection = webDb.appDb.getCollection(children[i]["name"]);
                            if (childrenCollection != null) {
                                childrenCollection.clear();
                            }
                        }
                        // webDb.appDb.saveDatabase();
                    }
                }
                beArr.forEach(function (element) {
                    parser.handleEachBE(element, reqype, property);
                });
            }
        }
        webDb.appDb.saveDatabase();
        return cbResult;
    };
    parser.handleEachBE = function (be, reqype, beName) {
        var headerLid = "";
        var isActionDelete = false;
        for (var property in be) {
            if (be.hasOwnProperty(property)) {
                var value = be[property];
                //Item
                if (value.constructor === Array) {
                    value.forEach(function (item) {
                        item["FID"] = headerLid;
                        //webDb.insert(property, item);
                        var structureInDB = webDb.getBasedOnGid(property, item);
                        var itemInCollection = webDb.appDb.getCollection(property);
                        if (itemInCollection === null) {
                            itemInCollection = webDb.appDb.addCollection(property);
                        }
                        if (structureInDB == null) {
                            item.FID = headerLid;
                            itemInCollection.insert(item);
                        }
                        else {
                            item = helper.copyProperty(item, structureInDB);
                            itemInCollection.update(item);
                        }
                        //  webDb.appDb.saveDatabase();
                    });
                    //Header    
                }
                else if (value.constructor === Object) {
                    value["LID"] = helper.guid();
                    headerLid = value.LID;
                    //Handle action delete
                    if (isActionDelete) {
                        webDb.deleteCascade(property, value);
                        continue;
                    }
                    var structureInDB = webDb.getBasedOnGid(property, value);
                    //In browser delete all items if header exists.
                    if (reqype === ump.requestType.RQST) {
                        if (structureInDB && (structureInDB != null)) {
                            var children = helper.getBeChildrenNames(property);
                            if ((children != null) && (children.length > 0)) {
                                for (var i = 0; i < children.length; i++) {
                                    var childCollection = webDb.appDb.getCollection(children[i]["name"]);
                                    if (childCollection != null) {
                                        childCollection.removeWhere({ 'FID': structureInDB.LID });
                                    }
                                }
                            }
                        }
                    }
                    var headerInCollection = webDb.appDb.getCollection(property);
                    if (headerInCollection === null) {
                        headerInCollection = webDb.appDb.addCollection(property);
                    }
                    if (structureInDB == null) {
                        value.LID = helper.guid();
                        headerInCollection.insert(value);
                    }
                    else {
                        value = helper.copyProperty(value, structureInDB);
                        headerInCollection.update(value);
                    }
                    headerLid = value.LID;
                    // webDb.appDb.saveDatabase();
                    //Handle Action D - Delete Header and children
                }
                else {
                    isActionDelete = "D" == value;
                }
            }
        }
    };
    return parser;
}());
/**
 * metadataParser - parse metadata.json, create BusinessEntityMeta, StructureMeta and FieldMeta and save.
 *
 * Intenal use only module
 */
var metadataParser = /** @class */ (function () {
    function metadataParser() {
    }
    metadataParser.initialize = function () {
        // TODO :  Check file existance
        metadataParser.loadJSON(metadataParser.parse);
    };
    /**
     * Load metadata.json from same directory where kernel-mobiweb.js
     */
    metadataParser.loadJSON = function (callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        var metadataPath = helper.isEmpty(parameters.metadataPath) ? "metadata.json" : parameters.metadataPath;
        xobj.open('GET', metadataPath, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == 200) {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    };
    metadataParser.parse = function (json) {
        if (helper.isEmpty(json))
            return;
        var data = JSON.parse(json);
        for (var property in data) {
            if (data.hasOwnProperty(property)) {
                var value = data[property];
                if (value.constructor === Object) {
                    metadataParser.parseEachBE(value, property);
                }
            }
        }
    };
    metadataParser.parseEachBE = function (be, name) {
        var beMeta = {};
        beMeta.attachment = helper.isEmpty(be.attachments) ? false : be.attachments;
        beMeta.onConflict = helper.isEmpty(be.onConflict) ? conflictRule.SERVER_WINS : be.onConflict;
        beMeta.save = helper.isEmpty(be.save) ? true : be.save;
        beMeta.name = name;
        metadata.bMeta.push(beMeta);
        for (var property in be) {
            if (be.hasOwnProperty(property)) {
                var value = be[property];
                if (value.constructor === Object) {
                    var sMeta = {};
                    sMeta.beName = beMeta.name;
                    sMeta.isheader = ((property.indexOf("_HEADER") > -1) || (property.indexOf("_HDR") > -1)) ? true : false;
                    sMeta.name = property;
                    metadata.sMeta.push(sMeta);
                    var fields = value.field;
                    if (fields != null && fields.length > 0) {
                        fields.forEach(function (f) {
                            var fMeta = {};
                            fMeta.beName = beMeta.name;
                            fMeta.sName = sMeta.name;
                            fMeta.name = f.name;
                            fMeta.isGid = f.isGid;
                            fMeta.isMandatory = f.mandatory;
                            fMeta.sqlType = f.sqlType;
                            metadata.fMeta.push(fMeta);
                        });
                    }
                }
            }
        }
    };
    return metadataParser;
}());

module.exports = new UMP();
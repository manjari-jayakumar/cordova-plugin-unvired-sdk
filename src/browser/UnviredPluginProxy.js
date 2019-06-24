/**
* Parse metadata.json and hold it in metadata in localstorage
*/
var metadata = {
    "sMeta": [],
    "fMeta": [],
    "bMeta": []
};
var loginParameters;
var loginType = {
    unvired: "UNVIRED_ID",
    ads: "ADS",
    sap: "SAP",
    custom: "CUSTOM"
}
var requestType = {
    RQST: 0,
    PULL: 1,
    PUSH: 2,
    QUERY: 3,
    REQ: 4
}
var loginMode = {
    authActivate: 0,
    authLocal: 1,
    forgotPassword: 2
}

// LOGIN

module.exports.login = function (callback, error, options) {
    console.log("Unvired Plugin Login Options:" + JSON.stringify(options))
    loginParameters = options[0];
    helper.clearLokiDbs();
    metadataParser.initialize();
    if (callback) {
        var cbResult = {};
        cbResult.type = 0;
        callback(cbResult);
    }
}

module.exports.logout = function (success, error, options) {
    helper.clearLokiDbs();
}

module.exports.getListOfFrontEndUsers = function (callback, error, options) {
    if (!helper.validateLoginParameters(loginMode.authActivate, callback))
        return;

    restUtil.appMeta = {};
    restUtil.appMeta.appName = loginParameters.appName;
    restUtil.appMeta.url = loginParameters.url;
    restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + loginParameters.password);
    var endpoint = restUtil.appMeta.url + restApis.users + loginParameters.username;
    restUtil.performRequest(endpoint, "", function (result) {
        callback(result);
    }, restUtil.httpType.get);
};

module.exports.authenticateAndActivate = function (callback) {
    if (!helper.validateLoginParameters(loginMode.authActivate, callback))
        return;

    // For Web sdk choose frontend type as Web and it is auto activate while deployed   
    restUtil.appMeta = {};
    restUtil.appMeta.frontEnd = loginParameters.feUserId;
    restUtil.appMeta.appName = loginParameters.appName;
    restUtil.appMeta.url = loginParameters.url;
    restUtil.appMeta.username = loginParameters.username;
    var endpoint;
    switch (loginParameters.loginType) {
        case loginType.unvired:
            restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + loginParameters.password);
            endpoint = restUtil.appMeta.url + restApis.session;
            break;
        case loginType.sap:
            restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username);
            endpoint = restUtil.appMeta.url + restApis.session + 'applications/' + restUtil.appMeta.appName;
            restUtil.appMeta.credentials = JSON.stringify([{ "port": loginParameters.domain, "user": loginParameters.username, "password": loginParameters.password }]);
            break;
        case loginType.ads:
            restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username);
            endpoint = restUtil.appMeta.url + restApis.session + 'applications/' + restUtil.appMeta.appName;
            restUtil.appMeta.credentials = JSON.stringify([{ "port": loginParameters.port, "user": loginParameters.domain + "\\" + loginParameters.username, "password": loginParameters.password }]);
            break;
    }
    /**
     * Session call. Use authKey for successive calls.
     * Check users for any frontentd of type web to continue else return frontend not found
     */
    restUtil.performRequest(endpoint, "", function (result) {
        if (result.type == resultType.success) {
            var users = result.data.users;
            var isFound = false;
            for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
                var u = users_1[_i];
                if (u["frontendType"] === "BROWSER") {
                    var apps = u.applications;
                    if (!helper.isEmpty(apps)) {
                        for (var _a = 0, apps_1 = apps; _a < apps_1.length; _a++) {
                            var app = apps_1[_a];
                            if (app.name === restUtil.appMeta.appName) {
                                isFound = true;
                                restUtil.appMeta.frontEnd = u["name"];
                            }
                        }
                    }
                }
            }
            if (!isFound) {
                var cbResult = {};
                cbResult.type = 3;
                cbResult.error = 'No Deployed application for frontend type of BROWSER found';
                callback(cbResult);
            }
            restUtil.appMeta.authorization = 'Basic ' + window.btoa(loginParameters.company + "\\" + loginParameters.username + ":" + result.data.authKey);
            //Invalidate session
            endpoint = restUtil.appMeta.url + restApis.session + result.data.sessionId;
            restUtil.performRequest(endpoint, "", function (sessionInvalidateResult) { }, restUtil.httpType.del);
            restUtil.appMeta.credentials = "";
            //On activation success save app meta for further calls.    
            webDb.initialize();
            webDb.saveAppMeta(restUtil.appMeta);
            //Loginlistener callback

            var cbResult = {};
            cbResult.type = 2; //ump.loginListenerType.auth_activation_success;
            cbResult.data = result;
            callback(cbResult);
        }
        else {
            var errText = "";
            if (!helper.isEmpty(result)) {
                errText = helper.isEmpty(result.error) ? "No error description returned from server" : JSON.parse(result.error).error;
            }
            helper.sendError(errText, callback);
            //Loginlistener callback

            var cbResult = {};
            cbResult.type = 3; //ump.loginListenerType.auth_activation_error;
            cbResult.error = errText;
            callback(cbResult)
        }
    }, restUtil.httpType.post);
};

module.exports.authenticateLocal = function (callback) {
    if (!helper.validateLoginParameters(loginMode.authLocal, callback))
        return;
    alert("Api not supported on Web!");
};

module.exports.getAllAccounts = function (callback) {
    alert("Api not supported on Web!");
};

module.exports.switchAccount = function (account, callback) {
    alert("Api not supported on Web!");
};

module.exports.deleteAccount = function (account, callback) {
    alert("Api not supported on Web!");
};

// SYNC

module.exports.syncForeground = function (reqype, header, customData, paFunction, autoSave, callback) {
    webDb.appDb.loadDatabase({});
    if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
        restUtil.appMeta = webDb.getAppMeta();
    }
    var endpoint = restUtil.appMeta.url + restApis.defaultApi + restUtil.appMeta.appName + restApis.execute + paFunction;
    var postMessage = "";
    if (header === null || header === "")
        postMessage = customData;
    postMessage = restUtil.removeLokiMeta(postMessage);
    restUtil.performRequest(endpoint, postMessage, function (result) {
        if (result.type == resultType.success) {
            if (autoSave) {
                result = parser.parseServerResponse(JSON.parse(result.data), reqype);
                return callback(result);
            }
        }
        return callback(result);
    }, restUtil.httpType.post);
};

module.exports.syncBackground = function (reqype, header, customData, paFunction, beName, belid, bypassAttachment, callback) {
    /**
     * In Web Async call works same as in Sync. Receives response data in callback instead of NotificationListener callback in Mobile.
     * App has to handle async response differently for both
     */
    webDb.appDb.loadDatabase({});
    if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
        restUtil.appMeta = webDb.getAppMeta();
    }
    var endpoint = restUtil.appMeta.url + restApis.defaultApi + restUtil.appMeta.appName + restApis.execute + paFunction;
    var postMessage = "";
    if (header === null || header === "")
        postMessage = customData;
    postMessage = restUtil.removeLokiMeta(postMessage);
    restUtil.performRequest(endpoint, postMessage, function (result) {
        return callback(result);
    }, restUtil.httpType.post);
};

module.exports.getMessages = function (callback) {
    alert("Api not supported on Web!");
};

module.exports.registerNotifListener = function (callback) {
    alert("'registerNotifListener' - Api not supported on Web! Web supports only sync call");
};

module.exports.unRegisterNotifListener = function (callback) {
    alert("'unRegisterNotifListener' - Api not supported on Web! Web supports only sync call");
};

// TODO: Web Only
module.exports.generateUBJson = function (headerName, header, itemName, items, callBack) {
    var beName = helper.getBeName(headerName);
    var temp = {};
    var be = {};
    be[headerName] = header;
    be[itemName] = items;
    temp[beName] = [be];
    helper.sendSuccess("", callBack, temp);
};

// TODO: Web Only        
module.exports.parseRawUBJson = function (json, callback) {
    var data = JSON.parse(json);
    var response = {
        infoMessage: [],
        be: []
    };
    var bes = [];
    for (var property in data) {
        if (data.hasOwnProperty(property)) {
            if (property === "InfoMessage") {
                var infoArr = data[property];
                response.infoMessage = infoArr;
            }
            else {
                var beArr = data[property];
                beArr.forEach(function (beElement) {
                    var be = {
                        header: "",
                        items: []
                    };
                    for (var property in beElement) {
                        if (beElement.hasOwnProperty(property)) {
                            var value = beElement[property];
                            if (value.constructor === Array) {
                                value.forEach(function (item) {
                                    be.items.push(item);
                                });
                            }
                            else if (value.constructor === Object) {
                                be.header = value;
                            }
                        }
                    }
                    bes.push(be);
                });
            }
        }
    }
    response.be = bes;
    callback(response);
};

// DB

module.exports.dbSelect = function (tableName, whereClause, callback) {
    webDb.appDb.loadDatabase({});
    var resultSet = webDb.select(tableName, whereClause);
    return helper.sendSuccess("", callback, resultSet);
};

module.exports.dbInsert = function (tableName, structureObject, isHeader, callback) {
    if (!isHeader) {
        if (helper.isEmpty(structureObject["FID"])) {
            helper.sendError("Invalid FID", callback);
        }
    }
    webDb.insert(tableName, structureObject, false);
    return helper.sendSuccess("", callback, "");
};

module.exports.dbInsertOrUpdate = function (tableName, structureObject, isHeader, callback) {
    if (!isHeader) {
        if (helper.isEmpty(structureObject["FID"])) {
            helper.sendError("Invalid FID", callback);
        }
    }
    webDb.insert(tableName, structureObject, false);
    return helper.sendSuccess("", callback, "");
};

module.exports.dbDeleteRecord = function (tableName, whereClause, callback) {
    var tableCollection = webDb.select(tableName, whereClause);
    if (tableCollection != null && tableCollection.length > 0) {
        tableCollection.forEach(function (element) {
            webDb.deleteCascade(tableName, element);
        });
    }
    helper.sendSuccess("Record deleted successfully", callback);
};

module.exports.dbUpdate = function (tableName, updatedObject, whereClause, callback) {
    var headerInCollection = webDb.appDb.getCollection(tableName);
    if (headerInCollection === null) {
        helper.sendError("Table" + tableName + " not found!", callback);
        return;
    }
    var resultSet = headerInCollection.find({
        '$and': [whereClause]
    });
    if (resultSet === null) {
        helper.sendSuccess("No records found", callback);
        return;
    }
    resultSet.forEach(function (col) {
        Object.keys(updatedObject).forEach(function (key, index) {
            var val = updatedObject[key];
            col[key] = val;
            headerInCollection.update(col);
        });
    });
    webDb.appDb.saveDatabase();
    helper.sendSuccess(resultSet.length + " Record updated", callback);
};

module.exports.dbExecuteStatement = function (query, callback, tableName) {
    alert("Api not supported on web!. Use select api instead.");
};

// TODO: Expose Webonly Functions.
module.exports.dbGetCollection = function (tableName, callback) {
    callback(webDb.appDb.getCollection(tableName));
};

module.exports.dbCreateSavePoint = function (savePoint, callback) {
    alert("Api not supported on web!.");
};

module.exports.dbReleaseSavePoint = function (savePoint, callback) {
    alert("Api not supported on web!.");
};

module.exports.dbRollbackSavePoint = function (savePoint, callback) {
    alert("Api not supported on web!.");
};

// TODO: Expose Internal Functions.
module.exports.dbReload = function (callback) {
    webDb.reload();
    if (!restUtil.appMeta.url || restUtil.appMeta.url === "") {
        restUtil.appMeta = webDb.getAppMeta();
    }
    metadataParser.initialize();
};

// Attachment

module.exports.getAttachmentFolderPath = function (callback) {
    console.log("ump.attachment.getAttachmentFolderPath - Api not supported in browser!");
};

module.exports.createAttachmentItem = function (tableName, structureObject, callback) {
    console.log("ump.attachment.createAttachmentItem - Api not supported in browser!");
};

module.exports.uploadAttachment = function (tableName, structureObject, isAsync, callback) {
    alert("ump.attachment.createAttachmentItem - Api not supported yet in browser!");
};

module.exports.downloadAttachment = function (tableName, structureObject, callback) {
    alert("ump.attachment.downloadAttachment - Api not supported yet in browser!");
};

// Settings

module.exports.getInfoMessages = function (headerName, lid, callback) {
    var InfoMessages = helper.getInfoMessages(lid);
    helper.sendSuccess("", callback, InfoMessages);
};

module.exports.showSettings = function () {
    alert("Api not supported on Web!");
};

module.exports.userSettings = function (callback) {
    var appMeta = getAppMeta();
    appMeta['USER_ID'] = appMeta.username;
    return helper.sendSuccess("", callback, getAppMeta());
};

module.exports.updateSystemCredentials = function (credentials, callback) {
    alert("Api not supported on web!.");
};

module.exports.getSystemCredentials = function (callback) {
    alert("Api not supported on web!.");
};

module.exports.getVersionNumbers = function (callback) {
    alert("Api not implemented on Web!");
};

module.exports.clearData = function (callback) {
    helper.clearLokiDbs();
};
/**
* reCreateAppDB - Recreate application database.
* Helps in updating application database without reauthenticating with server which requires to drop both app and framework database.
*/
module.exports.reCreateAppDB = function (callback) {
    webDb.reCreateAppDb();
    helper.sendSuccess("", callback, true);
};

module.exports.pullDb = function (callback) {
    alert("Api not supported on Web!");
};

module.exports.pushDB = function (callback) {
    alert("Api not supported on Web!");
};

module.exports.encrypt = function (input, callback) {
    alert("Api not supported on Web!");
};

module.exports.getAppMeta = function (callback) {
    callback(webDb.getAppMeta());
};

module.exports.guid = function (callback) {
    callback(helper.guid());
};

module.exports.hasInternet = function (callback) {
    helper.sendSuccess("", callback, true);
};

// Log

module.exports.logError = function (sourceClass, method, message) {
    console.log("ERROR | " + sourceClass + " | " + method + " | " + message);
};

module.exports.logDebug = function (sourceClass, method, message) {
    console.log("DEBUG | " + sourceClass + " | " + method + " | " + message);
};

module.exports.logImportant = function (sourceClass, method, message) {
    console.log("IMPORTANT | " + sourceClass + " | " + method + " | " + message);
};

module.exports.logRead = function (callback) {
    console.log("Api not supported on Web!");
};

module.exports.logDelete = function () {
    console.log("Api not supported on Web!");
};

module.exports.sendLogToServer = function (callback) {
    console.log("Api not supported on Web!");
};

module.exports.sendLogViaEmail = function (callback) {
    console.log("Api not supported in Web!");
};

/** INTERNAL MODULES.
 */
var helper = /** @class */ (function () {
    function helper() {
    }
    helper.getBeName = function (name) {
        var sMetas = metadata.sMeta.filter(function (e) {
            return e.name === name;
        });
        return sMetas[0].beName;
    };
    helper.getBeHeaderName = function (beName) {
        var headerName = "";
        metadata.sMeta.forEach(function (e) {
            if (e.beName === beName && e.isheader === true) {
                headerName = e.name;
            }
        });
        return headerName;
    };
    helper.getBeChildrenNames = function (structureName) {
        var sMetas = metadata.sMeta.filter(function (e) {
            return e.name === structureName;
        });
        sMetas = metadata.sMeta.filter(function (e) {
            return (e.beName === sMetas[0].beName && e.isheader === false);
        });
        return sMetas;
    };
    helper.getBeTableNames = function (beName) {
        var sMetas = metadata.sMeta.filter(function (e) {
            return e.beName === beName;
        });
        return sMetas;
    };
    helper.saveInfoMessage = function (infoMessage, beName, beLid) {
        var infoMessageInCollection = webDb.appDb.getCollection("InfoMessage");
        if (infoMessageInCollection === null) {
            infoMessageInCollection = webDb.appDb.addCollection("InfoMessage");
        }
        infoMessage.beName = beName;
        infoMessage.beLid = beLid;
        infoMessageInCollection.insert(infoMessage);
        webDb.appDb.saveDatabase();
    };
    helper.getInfoMessages = function (lid) {
        var infoMessageInCollection = webDb.appDb.getCollection("InfoMessage");
        if (infoMessageInCollection == null)
            return [];
        var infoMessages = webDb.select("InfoMessage", JSON.stringify({ beLid: lid }), true);
        if (infoMessages == null)
            return [];
        return infoMessages;
    };
    helper.isEmpty = function (value) {
        if (value == undefined || value === null || value === "")
            return true;
        return false;
    };
    helper.copyProperty = function (src, dest) {
        for (var k in src)
            dest[k] = src[k];
        return dest;
    };
    helper.validateLoginParameters = function (mode, callback) {

        if (helper.isEmpty(loginParameters.appName)) {
            helper.sendError("Please provide Application Name!", callback);
            return false;
        }

        if (helper.isEmpty(loginParameters.loginType)) {
            helper.sendError("Incorrect Login Type!", callback);
            return false;
        }
        if (loginParameters.loginType === loginType.sap || loginParameters.loginType === loginType.ads) {
            if (!loginParameters.domain) {
                helper.sendError("Please provide Domain!", callback);
                return false;
            }
        }
        if (helper.isEmpty(mode)) {
            helper.sendError("Please set Login Mode!", callback);
            return false;
        }
        var err = undefined;
        switch (mode) {
            case loginMode.authActivate:
                if (helper.isEmpty(loginParameters.url))
                    err = "Please provide Url!";
                else if (helper.isEmpty(loginParameters.company))
                    err = "Please provide Company Name!";
                else if (helper.isEmpty(loginParameters.username))
                    err = "Please provide User Id!";
                else if (helper.isEmpty(loginParameters.password))
                    err = "Please provide Password!";
                if (err) {
                    helper.sendError(err, callback);
                    return false;
                }
                break;
            case loginMode.authLocal:
                if (helper.isEmpty(loginParameters.username))
                    err = "Please provide User Id!";
                else if (helper.isEmpty(loginParameters.password))
                    err = "Please provide Password!";
                if (err) {
                    helper.sendError(err, callback);
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
        localStorage.removeItem(loginParameters.appName);
        webDb.appDb = null;
        webDb.fwDb = null;
    };
    helper.sendError = function (msg, callback) {
        var cbResult = {};
        cbResult.type = resultType.error;
        cbResult.error = msg;
        callback(cbResult);
    };
    helper.sendSuccess = function (msg, callback, data) {
        var cbResult = {};
        cbResult.type = resultType.success;
        cbResult.error = msg;
        cbResult.data = data;
        callback(cbResult);
    };
    return helper;
}());

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
        var appDbName = helper.isEmpty(loginParameters.appName) ? "APP_LOKI_DB" : loginParameters.appName;
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
        var appDbName = helper.isEmpty(loginParameters.appName) ? "APP_LOKI_DB" : loginParameters.appName;
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
        var appDbName = helper.isEmpty(loginParameters.appName) ? "APP_LOKI_DB" : loginParameters.appName;
        localStorage.removeItem("APP_LOKI_DB");
        localStorage.removeItem(loginParameters.appName);
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
                if (reqype == requestType.PULL) {
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
                    if (reqype === requestType.RQST) {
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
        //TODO :  Check file existance
        metadataParser.loadJSON(metadataParser.parse);
    };
    /**
     * Load metadata.json from same directory where kernel-mobiweb.js
     */
    metadataParser.loadJSON = function (callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        var metadataPath = helper.isEmpty(loginParameters.metadataPath) ? "metadata.json" : loginParameters.metadataPath;
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

require('cordova/exec/proxy').add('LoginPlugin', module.exports);
require('cordova/exec/proxy').add('LoggerPlugin', module.exports);
require('cordova/exec/proxy').add('SyncEnginePlugin', module.exports);
require('cordova/exec/proxy').add('AttachmentPlugin', module.exports);
require('cordova/exec/proxy').add('SettingsPlugin', module.exports);
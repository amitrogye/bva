// __fileURL = https://scpartner.service-now.com/sys_script_include.do?sys_id=d871f0c8dbc2b600f48efbb9af961909
// __fieldName = script 
// __authentication = STORED

var _BVA_LogHelper = Class.create();
_BVA_LogHelper.prototype = {
    // Error registry for checking and setting error codes
    errorReg: new x_snc_bva_tool._BVA_ErrorRegistry(),
    initialize: function() {},
    /****************************************************************************************************************************
     * Function: logDebug()
     *
     * Parameters: sourceClass - sysparm_source (String) - The source class (e.g. Script Include name) to associate to the message
     *             sourceSubclass - sysparm_source_sub (String) - The source subclass (e.g. Function name) to associate to message
     *             debugString - sysparm_debug_string (String) - The message to log
     * 			logTag - sysparm_log_tag (String) - (OPTIONAL) a custom tag for the source of the log to aid easier identification
     * Returns: None
     *
     * Description: This function writes a standardized debug log entry that will use the format "[BVA] - SourceClass.subClass -
     *              DEBUG: debug message".  Used to standardize the BVA debug log format.
     ****************************************************************************************************************************/
    logDebug: function(sourceClass, sourceSubclass, debugString, logTag) {
        //check for missing required parameters
        if (gs.nil(sourceClass) || gs.nil(sourceSubclass)) {
            this.logError('_BVA_LogHelper', 'logDebug', "bvaErr_1A");
            return false;
        }
        //load default values
        if (gs.nil(debugString)) {
            debugString = '';
        }
        // Handle optional prefix
        if (gs.nil(logTag)) {
            logTag = "BVA";
        }
        gs.debug("[" + logTag + "] " + sourceClass + "." + sourceSubclass + "() - DEBUG: " + debugString);
    },
    /****************************************************************************************************************************
     * Function: logError()
     *
     * Parameters: sourceClass - sysparm_source (String) - The source class (e.g. Script Include name) to associate to the error
     *             sourceSubclass - sysparm_source_sub (String) - The source subclass (e.g. Function name) to associate to error
     *             errorCode - sysparm_error_code (String) - The code of the error in question. (from the CoreErrorRegistry)
     *                         OPTIONALLY, a message may be passed in instead of an error code, and it will be logged directly.
     * 			logTag - sysparm_log_tag (String) - (OPTIONAL) a custom tag for the source of the log to aid easier identification
     * Returns: None
     *
     * Description: This function writes a standardized error log entry that will use the format "[BVA] - SourceClass.subClass -
     *              ERROR: (errorCode) description of the errror".  Used to standardize the BVA error format.
     ****************************************************************************************************************************/
    logError: function(sourceClass, sourceSubclass, errorCode, logTag) {
        //check for missing required parameters
        if (gs.nil(sourceClass) || gs.nil(sourceSubclass)) {
            this.logError('_BVA_LogHelper', 'logError', "bvaErr_1A: sourceClass - " + sourceClass + ", subClass - " + sourceSubclass + ", errorCode - " + errorCode);
            return false;
        }
        // Handle optional prefix
        if (gs.nil(logTag)) {
            logTag = "BVA";
        }
        // If the errorCode string starts with bvaErr and appears in the ErrorRegistry, then set the log format appropriately.
        if (errorCode.startsWith('bvaErr') && this.errorReg.isError(errorCode)) {
            gs.error("[" + logTag + "] " + sourceClass + "." + sourceSubclass + "() - ERROR: (" + errorCode + ") " + this.errorReg.getError(errorCode));
        } else {
            gs.error("[" + logTag + "] " + sourceClass + "." + sourceSubclass + "() - ERROR: " + errorCode);
        }
    },
    /****************************************************************************************************************************
     * Function: logInfo()
     *
     * Parameters: sourceClass - sysparm_source (String) - The source class (e.g. Script Include name) to associate to the message
     *             sourceSubclass - sysparm_source_sub (String) - The source subclass (e.g. Function name) to associate to message
     *             infoString - sysparm_info_string (String) - The message to log
     * 			logTag - sysparm_log_tag (String) - (OPTIONAL) a custom tag for the source of the log to aid easier identification
     * Returns: None
     *
     * Description: This function writes a standardized info log entry that will use the format "[BVA] - SourceClass.subClass -
     *              INFO: info message".  Used to standardize the BVA info log format.
     ****************************************************************************************************************************/
    logInfo: function(sourceClass, sourceSubclass, infoString, logTag) {
        //check for missing required parameters
        if (gs.nil(sourceClass) || gs.nil(sourceSubclass)) {
            this.logError("_BVA_LogHelper", "logError", "bvaErr_1A");
            return;
        }
        //load default values
        if (gs.nil(infoString)) {
            infoString = '';
        }
        // Handle optional prefix
        if (gs.nil(logTag)) {
            logTag = "BVA";
        }
        gs.info("[" + logTag + "] " + sourceClass + "." + sourceSubclass + "() - INFO: " + infoString);
    },
    type: '_BVA_LogHelper'
};

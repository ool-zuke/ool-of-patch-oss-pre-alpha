/************************************************************************************/
// OF-Patch���O���W���[��
/************************************************************************************/
var LOG_LEVEL = LOG_ERROR | LOG_WARNING | LOG_INFO | LOG_DEBUG;// | LOG_DETAIL;

// OFPLOG�N���X
var OFPLOG = function(){};

// OOLLOG���p��
OFPLOG.prototype = new OOLLOG();

//OFPLOG.prototype.log_tag = "OF-PATCH";
OOLLOG.prototype.log_tag = "OF-PATCH";

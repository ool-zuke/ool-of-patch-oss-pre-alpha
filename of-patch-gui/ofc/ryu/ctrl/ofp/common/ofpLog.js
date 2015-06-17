/************************************************************************************/
// OF-Patchログモジュール
/************************************************************************************/
var LOG_LEVEL = LOG_ERROR | LOG_WARNING | LOG_INFO | LOG_DEBUG;// | LOG_DETAIL;

// OFPLOGクラス
var OFPLOG = function(){};

// OOLLOGを継承
OFPLOG.prototype = new OOLLOG();

OOLLOG.prototype.log_tag = "OF-PATCH";

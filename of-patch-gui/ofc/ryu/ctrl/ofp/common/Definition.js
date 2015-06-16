    /************************************************************************************/
    // OF-Patch Manager Endpoint (User Setting)
    /************************************************************************************/
    var OFPM_URL = "http://localhost:18080/ofpm";


    /************************************************************************************/
    // HTTPリクエスト定義
    /************************************************************************************/
    // OF-Patchマネージャ Url
    var OFPM_LOGICAL_TOPOLOGY_URL = OFPM_URL + "/logical_topology";
    var OFPM_DEVICE_MNG_URL = OFPM_URL + "/device_mng";

    // OF-Patch Query paramater key
    var OFPM_PARAM_KEY_DEVICENAME = "deviceNames=";

    /************************************************************************************/
    // 画面定義
    /************************************************************************************/
    // OF-Patch表示エリア クラス
    var OFPATCH_AREA = ".of_patch_area";

    // SVG描画領域サイズ
    var svgWidth = 1280;
    var svgHight = 600;
    jQuery(document).ready(function() {
        svgWidth = $(OFPATCH_AREA).width();      // 表示領域幅
        svgHight = $(OFPATCH_AREA).height();     // 表示領域高
    });

    var SVG_WIDTH = svgWidth;
    var SVG_HIGHT = svgHight;

    var SVG_MIN_SIZE = SVG_WIDTH;
    if (SVG_HIGHT < SVG_MIN_SIZE) {
        SVG_MIN_SIZE = SVG_HIGHT;
    }

    // D3.js Force領域サイズ
    var FORCE_WIDTH = SVG_WIDTH / 2;
    var FORCE_HIGHT = SVG_HIGHT / 2;

    /************************************************************************************/
    // 機器描画サイズ定数定義
    /************************************************************************************/
    // 機器名テキストサイズ
    var DEVICE_NAME_TEXT_SIZE = 14;
    var DEVICE_NAME_TEXT_HIGHT =    3;

    // 機器ベース領域描画サイズ
    var DEVICE_HIGHT =              100;
    var DEVICE_WIDTH =              100;
    var DEVICE_BACKGROUND_OPACITY = 0.25;

    var NOVA_RADIUS_X = 2;
    var NOVA_RADIUS_Y = 2;
    var PATCH_RADIUS_X = 5;
    var PATCH_RADIUS_Y = 5;

    // ポート描画サイズ
    var PORT_HIGHT =        20;
    var PORT_WIDTH =        20;
    var PORT_X_OFFSET = 30;

    // ポート ベース領域描画サイズ
    var PORT_BK_X_OFFSET =  PORT_X_OFFSET;
    var PORT_BK_X =         PORT_WIDTH;
    var PORT_BK_HIGHT =         PORT_HIGHT;
    var PORT_BK_WIDTH =         PORT_WIDTH;
    var PORT_BK_BK_OPACITY =    0.7;
    var PORT_FRONT_OPACITY =    0;

    var NOVA_PORT_BK_Y =        (DEVICE_HIGHT / 2) - (PORT_HIGHT / 2) + DEVICE_NAME_TEXT_HIGHT;
    var PATCH_PORT_BK_Y =       (DEVICE_HIGHT / 2) + DEVICE_NAME_TEXT_HIGHT;

    var NOVA_PORT_BK_RADIUS_X =     5;
    var NOVA_PORT_BK_RADIUS_Y =     5;
    var PATCH_PORT_BK_RADIUS =  10;

    // ポート番号テキストサイズ
    var PORT_TEXT_SIZE =        5;
    var PORT_TEXT_X_OFFSET =    PORT_X_OFFSET;
    var PORT_TEXT_X =           PORT_WIDTH;
    var PORT_TEXT_Y =           (DEVICE_HIGHT / 2) + PORT_TEXT_SIZE + DEVICE_NAME_TEXT_HIGHT;
    var PORT_TEXT_HIGHT =       PORT_HIGHT;
    var PORT_TEXT_WIDTH =       PORT_WIDTH;


    /************************************************************************************/
    // 描画定数定義
    /************************************************************************************/
    // 円サイズ
    var RX_SIZE = SVG_MIN_SIZE / 2;
    var RY_SIZE = SVG_MIN_SIZE / 2;

    // d3.layout.cluster()定義
    var CLUSTER_X_SIZE = 360;
    var CLUSTER_Y_SIZE = RY_SIZE - 180;

    // 回転操作リングサイズ
    var RING_WIDTH = RY_SIZE * 0.35;
    var RING_INNER_RADIUS = RY_SIZE * 0.3;
    var RING_OUTER_RADIUS = RING_INNER_RADIUS + RING_WIDTH;

    // 機器円弧サイズ
    var NODE_ARC_WIDTH = RY_SIZE * 0.15;
    var NODE_ARC_INNER_RADIUS = RY_SIZE * 0.4;
    var NODE_ARC_OUTER_RADIUS = NODE_ARC_INNER_RADIUS + NODE_ARC_WIDTH;
    var PORT_ARC_MARGIN_RATE = 0.05;

    // ポート円弧サイズ
    var PORT_ARC_WIDTH_RATE = 0.5;

    // 機器描画位置
    var NODE_Y_SIZE = NODE_ARC_OUTER_RADIUS * 0.9 ;

    // 機器名
//    var NODE_NAME_FONT_SIZE = (RY_SIZE / 250) * 10;
    var NODE_NAME_FONT_SIZE = (RY_SIZE / 250) * 10;
    var NODE_NAME_Y_SIZE = RY_SIZE * 0.05;

    // ポート名
    var PORT_NAME_FONT_SIZE = (RY_SIZE / 250) * 3;

    // Line tension
    var DEFAULT_LINE_TENSION = .85;

    // Patch link draw position
    //var LINE_DRAW_Y_SIZE = RY_SIZE * 0.025;

    /************************************************************************************/
    // HTTP CODE 定義
    /************************************************************************************/
    var HTTP_CODE_SUCCESS                   = 200;
    var HTTP_CODE_CREATED                   = 201;

    /************************************************************************************/
    // メッセージ定義
    /************************************************************************************/
    var HAS_CHANGED_MSG                     = "Note!! Has changed. Not yet committed.";
    var CONNECT_CONFIRMATION_MSG            = "Want to connect?";
    var CONNECT_ERROR_MSG                   = "Can not connect to the same port."
    var CONNECT_CANCEL_MSG                  = "Link connect canceled.";
    var PORT_ALREADY_USED_ERROR_MSG         = "This port is already used."
    var DISCONNECT_CONFIRMATION_MSG         = "Want to disconnect?";
    var DISCONNECT_CANCEL_MSG               = "Link disconnect canceled.";
    var SUCCESS_MSG                         = "Success";
    var ERROR_MSG                           = "Error";
    var ERR_ALREADY_THIS_PORT_SELECTED_MSG  = "Error: Already this port is selected.";
    var ERR_ALREADY_PORT_CLICKED_MSG        = "Error: Allrady port clicked.";

    /************************************************************************************/
    // モード定義
    /************************************************************************************/
    var MODE_CIRCLE_P2P     = "Circle, Port to Port";
    var MODE_CIRCLE_D2D     = "Circle, Device to Device";
    var MODE_DRAG_D2D       = "Drag, Device to Device";

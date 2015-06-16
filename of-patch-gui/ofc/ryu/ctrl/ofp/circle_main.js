/************************************************************************************/
// Definition Global variables
/************************************************************************************/
var ofplog;

/************************************************************************************/
// 外部javascriptインポート
/************************************************************************************/
function JavaScriptLoader(src, callback){
    var sc = document.createElement('script');
    sc.type = 'text/javascript';
    if (window.ActiveXObject) {
        sc.onreadystatechange = function(){
            if (sc.readyState == 'complete') callback(sc.readyState);
            if (sc.readyState == 'loaded') callback(sc.readyState);
        };
    } else {
        sc.onload = function(){
            callback('onload');
        };
    }
    sc.src = src;
    document.body.appendChild(sc);
}

// ログモジュールインポート
JavaScriptLoader("ofp/common/oolLog.js", function(state){
    // OF-PATCHログモジュールインポート
    JavaScriptLoader("ofp/common/ofpLog.js", function(state){
        // Create OF-Patch log module
        ofplog = new OFPLOG();
        // 定義データインポート
        JavaScriptLoader("ofp/common/Definition.js", function(state){
            //Utilityファイルインポート
            JavaScriptLoader("ofp/common/utility.js", function(state){
                // OF-Patch GUIメイン処理実行
                ofPatchGuiMain();
            });
        });
    });
});


// OF-Patch GUIメイン処理
function ofPatchGuiMain() {
    ofplog.log(LOG_DEBUG, "ofPatchGuiMain() - start");

    // Get Device name from Query param.
    var param = window.location.search.substring( 1 );

    getDeviceList(getDeviceListCallback);

    ofplog.log(LOG_DEBUG, "ofPatchGuiMain() - end");
}

function getDeviceListCallback(result){
    ofplog.log(LOG_DEBUG, "getDeviceListCallback() - start");
    var deviceList = [];

    result.some(function(l, i){
        var deviceName = l.deviceName;
        var deviceType = l.deviceType;
        ofplog.log(LOG_DEBUG, "getDeviceListCallback() : data : deviceName = " + deviceName + ", deviceType" + deviceType);

        if ((deviceType == "Server") || (deviceType == "Switch")){
            deviceList.push(deviceName);
        }
    });

    // OFP main start.
    getTopology(arrayToCsv(deviceList), ofPatchGuiMainExec);

    ofplog.log(LOG_DEBUG, "getDeviceListCallback() - end");
}

function ofPatchGuiMainExec(classes){
    ofplog.log(LOG_DEBUG, "ofPatchGuiMainExec() - start");

    var context = {
            portClickFlag:false,
            sourcePort:undefined,
            m0:undefined,
            rotate:0,
            mode:undefined,
            isP2PFlag:false,
            undoButton:undefined,
            ofpAreaDiv:undefined,
            notificationArea:undefined,
            popUpDiv:undefined,
            svg:undefined,
            zoom:undefined,
            zoomArea:undefined,
            opeZoomArea:undefined,
            cluster:undefined,
            nodes:undefined,
            links:[],
            usedLinks:[],
            nodeArc:undefined,
            bundle:undefined,
            splines:undefined,
            line:undefined,
            patchLinks:undefined,
            operations:[],
            currentOpeIndex:-1,
            maxOpeIndex:-1,
            undoButton:undefined,
            redoButton:undefined,
            commitButton:undefined,
            cancelButton:undefined,
            orgNodes:[]};

    // OF-Patch GUI Mode Check.
    context.mode = d3.select(".mode");
    if(context.mode[0][0].value !== "Circle, Port to Port") {
        context.isP2PFlag = false;
    } else {
        context.isP2PFlag = true;
    }
    ofplog.log(LOG_DEBUG, "ofPatchGuiMainExec() : OF-Patch GUI Mode = " + context.mode[0][0].value);

    // Create D3js Cluster.
    context.cluster = d3.layout.cluster()
        .size([CLUSTER_X_SIZE, NODE_Y_SIZE])
        .sort(function(a, b) { return d3.ascending(a.deviceName, b.deviceName); });

    // Convert & Create data.
    convertNodes2InternalNodes(context, classes.nodes);
    convertLinks2InternalLinks(context, classes.links);

    // Select OF-Patch Area.
    context.ofpAreaDiv = d3.select(OFPATCH_AREA)
        .style("width", SVG_WIDTH + "px")
        .style("height", SVG_HIGHT + "px")
        .style("position", "absolute");

    // Select Notification Area.
    context.notificationArea = d3.select(".notification_area")
            .style("opacity", 0);

    // Create Popup box.
    context.popupDiv = context.ofpAreaDiv
        .append("div")
            .attr("class", "popup-box")
            .style("opacity", 0);

    context.zoom = d3.behavior.zoom()
            .scaleExtent([0.5, 10])
            .on("zoom", function(){zoomed(context);});

    // Create SVG Area.
//    context.svg = context.ofpAreaDiv.append("svg:svg")
    context.svg = d3.select(".svg_area")
//            .attr("width", SVG_WIDTH)
//            .attr("height", SVG_HIGHT)
        .append("svg:g")
            .call(context.zoom)
        .on("mousemove", function(d) { mousemove(context);})
        .on("mouseup", function(d) { mouseup(context);});

    // Create Operation Zoom & Pan Area.
    context.opeZoomArea = context.svg.append("rect")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HIGHT)
        .attr("class", "opeZoomArea")
        .style("fill", "white");

    // Create Zoom & Pan Area.
    context.zoomArea = context.svg
        .append('svg:g')
        .attr("class", "zoomArea");
    context.zoomArea.translate = [];
    context.zoomArea.translate[0] = 0;
    context.zoomArea.translate[1] = 0;
    context.zoomArea.scale = 1;

    // Create Rotate Area.
    context.rotateBaseArea = context.zoomArea.append("svg:g")
            .attr("width", SVG_MIN_SIZE)
            .attr("height", SVG_MIN_SIZE)
            .attr("class", "rotateBaseArea")
            .attr("transform", "translate(" + RX_SIZE + "," + RY_SIZE + ")");

    context.rotateArea = context.rotateBaseArea
        .append('svg:g')
            .attr("width", SVG_MIN_SIZE)
            .attr("height", SVG_MIN_SIZE)
            .attr("class", "rotateArea");

    // Create Rotating operation Ring.
/*
    context.rotateAreadrag = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("dragstart", function(){ dragstarted(context); })
        .on("drag", function(){ dragged(context) ;})
        .on("dragend", function(){ dragended(context); });
*/
    var rotateAreaData = [];
    rotateAreaData.push({width:SVG_MIN_SIZE,height:SVG_MIN_SIZE});
    context.rotateOpeArea = context.rotateArea.selectAll("g.nodeArc")
        .data(rotateAreaData)
        .enter().append("svg:path")
            .attr("class", "arc rotating-operation-ring")
            .attr("d", d3.svg.arc().innerRadius(RING_INNER_RADIUS).outerRadius(RING_OUTER_RADIUS).startAngle(0).endAngle(2 * Math.PI))
//            .call(context.rotateAreadrag);
        .on("mousedown", function(d) { mousedown(context); });

    if (context.isP2PFlag) {
        // Create Device arc.
        context.nodeArc = d3.svg.arc()
            .innerRadius(NODE_ARC_INNER_RADIUS)
            .outerRadius(NODE_ARC_OUTER_RADIUS)
            .startAngle(function(d) { return d.startNodeArcAngle; })
            .endAngle(function(d) { return d.endNodeArcAngle });
        context.rotateArea.selectAll("g.nodeArc")
            .data(context.nodes)
            .enter().append("svg:path")
                .attr("d", context.nodeArc)
                .attr("class", function(d) { return "nodeArc node-" + d.deviceName + " " + d.deviceType; })
                .on("mouseover", function(d) { return mouseover(d, context); })
                .on("mouseout", function(d) { return mouseout(d, context); });
    }

    // Create Port.
    context.nodes.some(function(d){
        var portData = undefined;
        var portOuterRadius = 0;
        if (context.isP2PFlag) {
            portData = d.ports;
            portOuterRadius = NODE_ARC_INNER_RADIUS + (NODE_ARC_WIDTH * PORT_ARC_WIDTH_RATE);
        } else {
            portData = d.dummyPort;
            portOuterRadius = NODE_ARC_OUTER_RADIUS;
        }

        var portArc = d3.svg.arc()
            .innerRadius(NODE_ARC_INNER_RADIUS)
            .outerRadius(portOuterRadius)
            .startAngle(function(p) { return p.startPortArcAngle; })
            .endAngle(function(p) { return p.endPortArcAngle });

        context.rotateArea.selectAll("g.portArc")
            .data(portData)
            .enter().append("svg:path")
                .attr("d", portArc)
                .attr("class", function(p) { return "portArc node-" + p.parentNode.deviceName + " port-" + p.internalPortName + " " + p.parentNode.deviceType; })
                .on("mouseover", function(p) { portMouseover(p, context); })
                .on("mouseout", function(p) {  portMouseout(p, context); })
                .on("mousedown", function(p, i) { portClick(context, p, i); });
        context.rotateArea.selectAll("g.portText")
            .data(portData)
            .enter().append("svg:g")
                .attr("transform", function(p) { return "rotate(" + (p.x - 90) + ")translate(" + (NODE_ARC_INNER_RADIUS + (NODE_ARC_WIDTH * PORT_ARC_WIDTH_RATE / 2) - (NODE_NAME_FONT_SIZE / 2)) + ")"; })
                    .append("svg:text")
                    .attr("class", function(p) { return "portText node-" + p.parentNode.deviceName + " port-" + p.internalPortName; })
                    .attr("transform", "rotate(90)")
                    .attr("font-size", PORT_NAME_FONT_SIZE + "px")
                    .attr("text-anchor", "middle")
                    .text(function(p) {
                        var portText = "";
                        if (context.isP2PFlag) {
                            if (p.parentNode.deviceType != "Server") {
                                portText = p.portNumber.toString();
                            }
                        }
                        return portText;
                    });
    });

    // Create Device.
    context.rotateArea.selectAll("g.node")
        .data(context.nodes)
        .enter().append("svg:g")
            .attr("class", function(d) { return "node node-" + d.deviceName; })
            .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + NODE_NAME_Y_SIZE) + ")"; })
            .append("svg:text")
                .attr("dx", function(d) { return d.x < (CLUSTER_X_SIZE / 2) ? 25 : -25; })
                .attr("dy", ".31em")
                .attr("text-anchor", function(d) { return d.x < (CLUSTER_X_SIZE / 2) ? "start" : "end"; })
                .attr("transform", function(d) { return d.x < (CLUSTER_X_SIZE / 2) ? null : "rotate(180)"; })
                .attr("font-size", NODE_NAME_FONT_SIZE + "px")
                .text(function(d) { return d.deviceName; })
                .on("mouseover", function(d) { return mouseover(d, context); })
                .on("mouseout", function(d) { return mouseout(d, context); });

    // Create PatchLink line.
    context.bundle = d3.layout.bundle();
    context.line = d3.svg.line.radial()
            .interpolate("bundle")
            .tension(DEFAULT_LINE_TENSION)
            .radius(function(d) {return (0 < d.y) ? NODE_ARC_INNER_RADIUS + ((NODE_ARC_WIDTH * PORT_ARC_WIDTH_RATE) / 4) : d.y;})
            .angle(function(l, i) {return l.x / (CLUSTER_X_SIZE / 2) * Math.PI;});
    patchLinkDraw(context);

    // Select search text.
    context.searchText = d3.select(".search_text");
    context.searchText.on("change", function(){ searchTextChange(context, this); })
        .on("click", function(){ searchTextChange(context, this); });

    // Select Tension bar.
    d3.select("input[type=range]").on("change", function() {
        context.line.tension(this.value / 100);
        d3.selectAll(".link").attr("d", function(d, i) { return context.line(context.splines[i]); });
    });

    // Select button.
    context.undoButton = d3.select(".undo");
    context.undoButton.on("click", function(){ undoBtnClick(context); });
    context.undoButton.attr("disabled", "disabled");
    context.redoButton = d3.select(".redo");
    context.redoButton.on("click", function() { redoBtnClick(context); });
    context.redoButton.attr("disabled", "disabled");
    context.commitButton = d3.select(".commit");
    context.commitButton.on("click", function() { commitClick(context); });
    context.commitButton.attr("disabled", "disabled");
    context.cancelButton = d3.select(".cancel");
    context.cancelButton.on("click", function() { cancelClick(context); });
    context.cancelButton.attr("disabled", "disabled");

    ofplog.log(LOG_DEBUG, "ofPatchGuiMainExec() - end");
}

// Function REST Request.
function restRequest(type, url, contentType, data, callBackFunc) {
    ofplog.log(LOG_DEBUG, "restRequest() - start : type = " + type + ", url = " + url + ", contentType = " + contentType + ", data = " + data);
    var restData;
    // Create REST Data.
    if (type == "POST" || type == "PUT") {
        restData = {"type" : type,
                    "url" : url,
                    "contentType" : contentType,
                    "data" : data,
                    "success" : success,
                    "error" : error,
                    "complete" : complete};
    } else {
        restData = {"type" : type,
                    "url" : url,
                    "success" : success,
                    "error" : error,
                    "complete" : complete};
    }

    $(".progress").fadeIn();

    // Execute REST Request.
    jQuery(document).ready(function() {
        $.ajax(restData);
    });

    function success(data, xhr, textStatus) {
        ofplog.log(LOG_DEBUG, "restRequest() - success : data = " + data + ", xhr = " + xhr + ", textStatus = " + textStatus);
        $(".progress").fadeOut();
        if (typeof callBackFunc !== "undefined") {
            if (typeof callBackFunc.success !== "undefined") {
                callBackFunc.success(data, xhr, textStatus);
            }
        }
    }

    function error(xhr) {
        ofplog.log(LOG_ERROR, "restRequest() - error : xhr = " + xhr);
        $(".progress").fadeOut();
        alert("error: " + xhr);
        if (typeof callBackFunc !== "undefined") {
            if (typeof callBackFunc.error !== "undefined") {
                callBackFunc.error(xhr);
            }
        }
    }

    function complete(data) {
        ofplog.log(LOG_DEBUG, "restRequest() - complete : data = " + data);
        if (typeof callBackFunc !== "undefined") {
            if (typeof callBackFunc.complete !== "undefined") {
                callBackFunc.complete(data);
            }
        }

    }

    ofplog.log(LOG_DEBUG, "restRequest() - end");
}

//Get Device List from OFPM.
function getDeviceList(successFunc, errorFunc) {
    var funcName = "getDeviceList()";
    ofplog.log(LOG_DEBUG, funcName  + " - start : ");

    restRequest("GET",
                OFPM_DEVICE_MNG_URL,
                "",
                "",
                {success : success, error : error});

    function success(data, xhr, textStatus) {
        var status = data.status;
        var result = data.result;
        var resultStr = JSON.stringify(result);
        ofplog.log(LOG_DEBUG, funcName  + " - success : status = " + status + ", result = " + resultStr + ", textStatus = " + textStatus);
        if (typeof successFunc !== "undefined") {
            successFunc(result);
        }
    }

    function error(xhr) {
        ofplog.log(LOG_ERROR, funcName  + " - error : xhr = " + xhr);
        if (typeof errorFunc !== "undefined") {
            errorFunc(xhr);
        }
    }

    function complete(data) {
        ofplog.log(LOG_DEBUG, funcName  + " - complete : data = " + data);
    }

    ofplog.log(LOG_DEBUG, funcName  + " - end");
}

// Get topology from OFPM.
function getTopology(deviceNames, successFunc, errorFunc) {
    var funcName = "getTopology()";
    ofplog.log(LOG_DEBUG, funcName  + " - start : deviceNames = " + deviceNames);

    restRequest("GET",
                OFPM_LOGICAL_TOPOLOGY_URL + "?" +
                OFPM_PARAM_KEY_DEVICENAME + deviceNames,
                "",
                "",
                {success : success, error : error});

    function success(data, xhr, textStatus) {
        var status = data.status;
        var result = data.result;
        var resultStr = JSON.stringify(result);
        ofplog.log(LOG_DEBUG, funcName  + " - success : status = " + status + ", result = " + resultStr + ", textStatus = " + textStatus);
        if (typeof successFunc !== "undefined") {
            successFunc(result);
        }
    }

    function error(xhr) {
        ofplog.log(LOG_ERROR, funcName  + " - error : xhr = " + xhr);
        if (typeof errorFunc !== "undefined") {
            errorFunc(xhr);
        }
    }

    function complete(data) {
        ofplog.log(LOG_DEBUG, funcName  + " - complete : data = " + data);
    }

    ofplog.log(LOG_DEBUG, funcName  + " - end");
}

// OF-Patchマネージャへのコネクト情報通知関数
function updateTopology(context, successFunc, errorFunc) {
    var funcName = "updateTopology()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    // 結線データ生成
    var data;
    var tmpLinks = [];
    context.links.some(function(l, i){
        if (context.isP2PFlag) {
            tmpLinks.push({link:[{deviceName:context.links[i].source.parentNode.deviceName,portName:context.links[i].source.portName,portNumber:context.links[i].source.portNumber},
                                 {deviceName:context.links[i].target.parentNode.deviceName,portName:context.links[i].target.portName,portNumber:context.links[i].target.portNumber}]});
        } else {
            tmpLinks.push({link:[{deviceName:context.links[i].source.parentNode.deviceName},
                                 {deviceName:context.links[i].target.parentNode.deviceName}]});
        }
    });

    data = JSON.stringify({nodes:context.orgNodes, links:tmpLinks});

    restRequest("PUT",
                OFPM_LOGICAL_TOPOLOGY_URL,
                "application/json",
                data,
                {success : success, error : error});

    function success(data, xhr, textStatus) {
        var status = data.status;
        var result = data.result;
        var resultStr = JSON.stringify(result);
        ofplog.log(LOG_DEBUG, funcName + " - success : status = " + status + ", result = " + resultStr + ", textStatus = " + textStatus);
        if (status == HTTP_CODE_SUCCESS || status == HTTP_CODE_CREATED) {
            alert("Success");
        } else {
            alert("Error : " + status);
        }
        if (typeof successFunc !== "undefined") {
            successFunc(status, result);
        }

        var deviceNames = [];
        context.nodes.some(function(d){deviceNames.push(d.deviceName)});
        getTopology(deviceNames, function(data){
                                                    context.links.splice(0, context.links.length);
                                                    context.patchLinks = context.rotateArea.selectAll("path.link").data(context.links);
                                                    context.patchLinks.exit().remove();
                                                    convertLinks2InternalLinks(context, data.links)
                                                    patchLinkDraw(context);
                                                });


    }

    function error(xhr) {
        ofplog.log(LOG_ERROR, funcName + " - error : xhr = " + xhr);
        alert("Error");
        if (typeof errorFunc !== "undefined") {
            errorFunc(xhr);
        }
    }

    function complete(data) {
        ofplog.log(LOG_DEBUG, funcName + " - complete : data = " + data);
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function dataSort(data,key,order){
    // DESC
    var sortA = -1;
    var sortB = 1;

    if(order === 'ASC'){
        // ASC
        sortA = 1;
        sortB = -1;
    }

    data.sort(function(a, b){
                var numA = a[key];
                var numB = b[key];
                if (numA > numB) return sortA;
                if (numA < numB) return sortB;
                return 0;});
}

function calcArcWidthForP2P(context) {
    var allPortNum = getAllDeviceAllPortNum(context);
    var nodeArcMargin = (CLUSTER_X_SIZE / allPortNum) * PORT_ARC_MARGIN_RATE;
    var portArcWidth =  CLUSTER_X_SIZE / allPortNum;
    var sumClusterX = 0;
    context.nodes.some(function(d){
        var nodeArcWidth = portArcWidth * d.ports.length;
        d.x = sumClusterX + (nodeArcWidth / 2);
        sumClusterX += nodeArcWidth;
        d.nodeArcWidth = nodeArcWidth - nodeArcMargin;
        d.startNodeArcX = d.x - (d.nodeArcWidth / 2);
        d.endNodeArcX = d.x + (d.nodeArcWidth / 2);
        d.startNodeArcAngle = d.startNodeArcX * Math.PI / (CLUSTER_X_SIZE / 2);
        d.endNodeArcAngle = d.endNodeArcX * Math.PI / (CLUSTER_X_SIZE / 2);
        d.ports.some(function(p, i){
            p.portArcWidth = d.nodeArcWidth / d.ports.length;
            p.x = p.parentNode.startNodeArcX + (p.portArcWidth * (i + 1)) - (p.portArcWidth / 2);
            p.y = p.parentNode.y - 20;
            p.startPortArcX = p.x - (p.portArcWidth / 2);
            p.endPortArcX = p.x + (p.portArcWidth / 2);
            p.startPortArcAngle = p.startPortArcX * Math.PI / (CLUSTER_X_SIZE / 2);
            p.endPortArcAngle = p.endPortArcX * Math.PI / (CLUSTER_X_SIZE / 2);
            p.parent = p.parentNode.parent;
        });
    });
}

function calcArcWidthForD2D(context) {
    var allPortNum = context.nodes.length;
    var nodeArcMargin = (CLUSTER_X_SIZE / allPortNum) * PORT_ARC_MARGIN_RATE;
    var nodeArcWidth = CLUSTER_X_SIZE / allPortNum;
    var portArcWidth =  nodeArcWidth;
    var sumClusterX = 0;
    context.nodes.some(function(d){
        d.x = sumClusterX + (nodeArcWidth / 2);
        sumClusterX += nodeArcWidth;
        d.nodeArcWidth = nodeArcWidth - nodeArcMargin;
        d.startNodeArcX = d.x;
        d.endNodeArcX = d.x + d.nodeArcWidth;
        d.startNodeArcAngle = d.startNodeArcX * Math.PI / (CLUSTER_X_SIZE / 2);
        d.endNodeArcAngle = d.endNodeArcX * Math.PI / (CLUSTER_X_SIZE / 2);

        d.dummyPort = [];
        d.dummyPort.push({portName:""});
        var p = d.dummyPort[0];
        p.parentNode = d;
        p.portArcWidth = d.nodeArcWidth;
        p.x = p.parentNode.startNodeArcX;
        p.y = p.parentNode.y - 20;
        p.startPortArcX = p.x - (p.portArcWidth / 2);
        p.endPortArcX = p.x + (p.portArcWidth / 2);
        p.startPortArcAngle = p.startPortArcX * Math.PI / (CLUSTER_X_SIZE / 2);
        p.endPortArcAngle = p.endPortArcX * Math.PI / (CLUSTER_X_SIZE / 2);
        p.parent = p.parentNode.parent;

        p.internalPortName = "port1";
    });
}

function convertNodes2InternalNodes(context, nodes) {
    ofplog.log(LOG_DEBUG, "convertNodes2InternalNodes() - start");

    $.extend(true, context.orgNodes, nodes);

    nodes.some(function(d, i){
        if (d.deviceType === "ExSwitch") {
            d.deviceType = "Switch"
        }

        if (d.deviceType === "Server") {
            dataSort(d.ports, "portName", "ASC");
        } else {
            dataSort(d.ports, "portNumber", "ASC");
        }
        d.ports.some(function(p, i){
            p.parentNode = d;
            p.internalPortName = "port" + i;
        });
    });

    ofplog.log(LOG_DEBUG, "convertNodes2InternalNodes() : PhygicalTopology data");

    var tmpNodes = context.cluster.nodes(packages.root(nodes));
    context.nodes = tmpNodes.filter(function(d) { return d.deviceName; });

    if (context.isP2PFlag) {
        calcArcWidthForP2P(context);
    } else {
        calcArcWidthForD2D(context);
    }

    ofplog.log(LOG_DEBUG, "convertNodes2InternalNodes() - end");
}

function convertLinks2InternalLinks(context, links) {
    ofplog.log(LOG_DEBUG, "convertLinks2InternalLinks() - start");

    links.some(function(l, i){
        var sourceDeviceName = l.link[0].deviceName;
        var sourceDevicePortNum = l.link[0].portNumber;
        var sourceDevicePortName = l.link[0].portName;
        var targetDeviceName = l.link[1].deviceName;
        var targetDevicePortNum = l.link[1].portNumber;
        var targetDevicePortName = l.link[1].portName;
        ofplog.log(LOG_DEBUG, "convertLinks2InternalLinks() : PhygicalTopology data : sourceDeviceName = " + sourceDeviceName + ", targetDeviceName" + targetDeviceName);

        var source = searchGetData(context.nodes, "deviceName", sourceDeviceName);
        var sourcePort = undefined;
        if (typeof source !== "undefined") {
            sourcePort = searchGetData(source.ports, "portName", sourceDevicePortName);
        }
        var target = searchGetData(context.nodes, "deviceName", targetDeviceName);
        var targetPort = undefined;
        if (typeof target !== "undefined") {
            targetPort = searchGetData(target.ports, "portName", targetDevicePortName);
        }

        if (typeof source !== "undefined" &&
            typeof sourcePort !== "undefined" &&
            typeof target !== "undefined" &&
            typeof targetPort !== "undefined") {

            // Add data to internal Links data.
            if (context.isP2PFlag) {
                context.links.push({source:sourcePort,target:targetPort});
            } else {
                context.links.push({source:source.dummyPort[0],target:target.dummyPort[0]});
            }
        } else {
            var sourceInternalPortName;
            if (typeof sourcePort !== "undefined") {
                sourceInternalPortName = sourcePort.internalPortName;
            }
            var targetInternalPortName;
            if (typeof targetPort !== "undefined") {
                targetInternalPortName = targetPort.internalPortName;
            }

            context.usedLinks.push({source:sourcePort,sourceDeviceName:sourceDeviceName,sourceDevicePortName:sourceInternalPortName,target:targetPort,targetDeviceName:targetDeviceName,targetDevicePortName:targetInternalPortName});
        }
    });

    ofplog.log(LOG_DEBUG, "convertLinks2InternalLinks() - end");
}

function patchLinkDraw(context) {
    var funcName = "patchLinkDraw()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    context.splines = context.bundle(context.links);
    context.patchLinks = context.rotateArea.selectAll("path.link")
            .data(context.links);

    context.patchLinks.enter().append("svg:path")
            .attr("class", function(l) { return "link source-" + l.source.parentNode.deviceName + " sourcePortNum-" + l.source.internalPortName + " target-" + l.target.parentNode.deviceName + " targetPortNum-" + l.target.internalPortName; })
            .attr("d", function(d, i) { return context.line(context.splines[i]); })
            .on("mouseover", function(l) { linkMouseover(l, context); })
            .on("mouseout", function(l) { linkMouseout(l, context); })
            .on("mousedown", function(l, i) { patchLinkClick(context, l, i); });

    context.patchLinks.exit().remove();

    // Clear Port used.
    context.nodes.some(function(node){
        node.ports.some(function(port) {
            d3.select(".portArc.node-" + port.parentNode.deviceName + ".port-" + port.internalPortName).classed("used", null);
            port.used = false;
        });
    });

    if (context.isP2PFlag) {
        // Set Port used.
        context.links.some(function(link, i){
            d3.select(".portArc.node-" + link.source.parentNode.deviceName + ".port-" + link.source.internalPortName).classed("used", true);
            link.source.used = true;
            d3.select(".portArc.node-" + link.target.parentNode.deviceName + ".port-" + link.target.internalPortName).classed("used", true);
            link.target.used = true;
        });

        context.usedLinks.some(function(link, i){
            if (typeof link.sourceDeviceName !== "undefined" && typeof link.sourceDevicePortName !== "undefined") {
                d3.select(".portArc.node-" + link.sourceDeviceName + ".port-" + link.sourceDevicePortName).classed("used", true);
                if (typeof link.source !== "undefined") {
                    link.source.used = true;
                }
            }
            if (typeof link.targetDeviceName !== "undefined" && typeof link.targetDevicePortName !== "undefined") {
                d3.select(".portArc.node-" + link.targetDeviceName + ".port-" + link.targetDevicePortName).classed("used", true);
                if (typeof link.target !== "undefined") {
                    link.target.used = true;
                }
            }
        });
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function patchLinkClick(context, link, i) {
    var funcName = "patchLinkClick()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    d3.event.stopPropagation();

    if(context.portClickFlag == false) {
        if(window.confirm(DISCONNECT_CONFIRMATION_MSG)) {
            // Record operetion.
            recordOperation(context, "disconnect", link.source, link.target);

            disconnectPatchLink(context, link.source, link.target);

        } else {
            ofplog.log(LOG_DEBUG, funcName + " : " + DISCONNECT_CANCEL_MSG);
        }
    } else {
        window.alert(ERR_ALREADY_PORT_CLICKED_MSG);
        ofplog.log(LOG_DEBUG, funcName + " : " + ERR_ALREADY_PORT_CLICKED_MSG);
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function patchLinkDelete(context, link, i) {
    var funcName = "patchLinkDelete()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    ofplog.log(LOG_INFO, funcName + " : Disconnect : source=" + link.source.parentNode.deviceName + ",sourcePortNum=" + link.source.internalPortName + ": target=" + link.target.parentNode.deviceName + ", targetPortNum=" + link.target.internalPortName);
    d3.select(".link.source-" + link.source.parentNode.deviceName + ".link.sourcePortNum-" + link.source.internalPortName + ".link.target-" + link.target.parentNode.deviceName + ".link.targetPortNum-" + link.target.internalPortName)
        .remove();

    ofplog.log(LOG_DEBUG, funcName + " : links.splice(" + i + ",1)");
    context.links.splice(i,1);

    patchLinkDraw(context);

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function portClick(context, port, i) {
    var funcName = "portClick()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    d3.event.stopPropagation();

    if (!port.used) {
        if(context.portClickFlag == false) {
            ofplog.log(LOG_DEBUG, funcName + " : source deviceName = " + port.parentNode.deviceName + ", source portName = " + port.portName);
            context.sourcePort = port;
            d3.select(".portArc.node-" + context.sourcePort.parentNode.deviceName + ".port-" + context.sourcePort.internalPortName).classed("selected", true);

            context.cancelButton.attr("disabled", null);
            context.portClickFlag = true;
        } else {
            if(context.sourcePort != port) {
                var confirmMsg = "";
                if (context.isP2PFlag) {
                    confirmMsg = CONNECT_CONFIRMATION_MSG + "\n\n" +
                                    context.sourcePort.parentNode.deviceName + "[" + context.sourcePort.portName + "]" +
                                    " <---> " + port.parentNode.deviceName + "[" + port.portName + "]";
                } else {
                    confirmMsg = CONNECT_CONFIRMATION_MSG + "\n\n" +
                                    context.sourcePort.parentNode.deviceName + " <---> " + port.parentNode.deviceName;
                }
                if(window.confirm(confirmMsg)) {
                    ofplog.log(LOG_DEBUG, funcName + " : target deviceName = " + port.parentNode.deviceName + ", target portName = " + port.portName);
                    // Connect Patch link.
                    connectPatchLink(context, context.sourcePort, port);

                    // Record operetion.
                    recordOperation(context, "connect", context.sourcePort, port);

                    d3.select(".portArc.node-" + context.sourcePort.parentNode.deviceName + ".port-" + context.sourcePort.internalPortName).classed("selected", false);

                    context.cancelButton.attr("disabled", "disabled");
                    context.portClickFlag = false;
                } else {
                    ofplog.log(LOG_DEBUG, funcName + " : " + CONNECT_CANCEL_MSG);
                    cancelClick(context);
                }
            } else {
                window.alert(CONNECT_ERROR_MSG);
                ofplog.log(LOG_DEBUG, funcName + " : " + CONNECT_ERROR_MSG);
            }
        }
    } else {
        window.alert(PORT_ALREADY_USED_ERROR_MSG);
        ofplog.log(LOG_DEBUG, funcName + " : " + PORT_ALREADY_USED_ERROR_MSG);
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function connectPatchLink(context, sourcePort, targetPort) {
    var funcName = "connectPatchLink()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

//    ofplog.log(LOG_DEBUG, funcName + " : source deviceName = " + sourcePort.parentNode.deviceName + ", source portNumber = " + sourcePort.portNumber + " : target deviceName = " + targetPort.parentNode.deviceName + ", target portNumber = " + targetPort.portNumber);
    ofplog.log(LOG_DEBUG, funcName + " : source deviceName = " + sourcePort.parentNode.deviceName + ", source portName = " + sourcePort.portName + " : target deviceName = " + targetPort.parentNode.deviceName + ", target portName = " + targetPort.portName);
    // Add patch link.
    var link = {source:sourcePort,target:targetPort};
    context.links.push(link);
    patchLinkDraw(context);

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function disconnectPatchLink(context, sourcePort, targetPort) {
    var funcName = "disconnectPatchLink()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    ofplog.log(LOG_DEBUG, funcName + " : source deviceName = " + sourcePort.parentNode.deviceName + ", source portName = " + sourcePort.portName + " : target deviceName = " + targetPort.parentNode.deviceName + ", target portName = " + targetPort.portName);
    context.links.some(function(link, i) {
        if((link.source.parentNode.deviceName == sourcePort.parentNode.deviceName) && (link.source.portName == sourcePort.portName) &&
           (link.target.parentNode.deviceName == targetPort.parentNode.deviceName) && (link.target.portName == targetPort.portName)) {
            // Delete Patch link.
            patchLinkDelete(context, link, i);
        }
    });

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function recordOperation(context, operation, sourcePort, targetPort) {
    var funcName = "recordOperation()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    var beforeOpeLength = context.operations.length;
    // delete after current index data.
    context.operations.splice(context.currentOpeIndex + 1, beforeOpeLength - 1);

    context.operations.push({operation:operation,source:sourcePort,target:targetPort});
    context.currentOpeIndex = context.operations.length - 1;
    context.maxOpeIndex = context.currentOpeIndex;
    ofplog.log(LOG_DEBUG, funcName + " : operations operation = " + operation +", curOpeIndex = " + context.currentOpeIndex + ", maxOpeIndex = " + context.maxOpeIndex);


    context.undoButton.attr("disabled", null);
    context.commitButton.attr("disabled", null);
    context.redoButton.attr("disabled", "disabled");

    context.notificationArea
        .html(HAS_CHANGED_MSG)
        .transition()
            .duration(500)
            .style("opacity", 1);

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function clearOperation(context) {
    var funcName = "clearOperation()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    var opeLength = context.operations.length;
    // delete all data.
    context.operations.splice(0, opeLength);

    context.currentOpeIndex = - 1;
    context.maxOpeIndex = -1;

    context.undoButton.attr("disabled", "disabled");
    context.commitButton.attr("disabled", "disabled");
    context.redoButton.attr("disabled", "disabled");

    context.notificationArea
        .html("")
        .transition()
            .duration(500)
            .style("opacity", 0);

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function getAllDeviceAllPortNum(context) {
    var sum = 0;

    context.nodes.some(function(d){
        sum += d.ports.length;
    });

    return sum;
}

function searchTextChange(context, searchText) {
    var funcName = "searchTextChange()";
    var searchText = searchText.value;
    ofplog.log(LOG_DEBUG, funcName + " - start");

    context.nodes.some(function(node){
        d3.select(".node.node-" + node.deviceName).classed("highlight", false);
        if (node.deviceName.search(searchText) == 0 &&
            searchText != "") {
            d3.select(".node.node-" + node.deviceName).classed("highlight", true);
        }
    });

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function undoBtnClick(context) {
    var funcName = "undoBtnClick()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    if (-1 < context.currentOpeIndex) {

        var operation = context.operations[context.currentOpeIndex];

        if(operation.operation == "connect") {
            disconnectPatchLink(context, operation.source, operation.target);
        } else {
            connectPatchLink(context, operation.source, operation.target);
        }

        context.currentOpeIndex--;
        ofplog.log(LOG_DEBUG, funcName + " : curOpeIndex = " + context.currentOpeIndex + ", maxOpeIndex = " + context.maxOpeIndex);

        if(context.currentOpeIndex < 0) {
            context.undoButton.attr("disabled", "disabled");
            context.commitButton.attr("disabled", "disabled");

            context.notificationArea
                .html("")
                .transition()
                    .duration(500)
                    .style("opacity", 0);
        }
        context.redoButton.attr("disabled", null);

    } else {
        ofplog.log(LOG_ERROR, funcName + " : operations Out of Index : currentOpeIndex = " + context.currentOpeIndex);
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function redoBtnClick(context) {
    var funcName = "redoBtnClick()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    if (context.currentOpeIndex < context.maxOpeIndex) {
        context.currentOpeIndex++;
        ofplog.log(LOG_DEBUG, funcName + " : curOpeIndex = " + context.currentOpeIndex + ", maxOpeIndex = " + context.maxOpeIndex);

        var operation = context.operations[context.currentOpeIndex];

        if(operation.operation == "connect") {
            connectPatchLink(context, operation.source, operation.target);
        } else {
            disconnectPatchLink(context, operation.source, operation.target);
        }

        if(context.maxOpeIndex <= context.currentOpeIndex) {
            context.redoButton.attr("disabled", "disabled");
        }
        context.commitButton.attr("disabled", null);
        context.undoButton.attr("disabled", null);

        context.notificationArea
            .html(HAS_CHANGED_MSG)
            .transition()
                .duration(500)
                .style("opacity", 1);

    } else {
        ofplog.log(LOG_ERROR, funcName + " : operations Out of Index : currentOpeIndex = " + context.currentOpeIndex + ", maxOpeIndex = " + context.maxOpeIndex);
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function commitClick(context) {
    var funcName = "commitClick()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    if(context.portClickFlag == false) {

        updateTopology(context)

        clearOperation(context)

    } else {
        ofplog.log(LOG_ERROR, funcName + " : context.portClickFlag == true");
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

function cancelClick(context) {
    var funcName = "cancelClick()";
    ofplog.log(LOG_DEBUG, funcName + " - start");

    if(context.portClickFlag == true) {
        d3.select(".portArc.node-" + context.sourcePort.parentNode.deviceName + ".port-" + context.sourcePort.internalPortName).classed("selected", null);

        context.cancelButton.attr("disabled", "disabled");

        context.sourcePort = undefined;
        context.portClickFlag = false;
    } else {
        ofplog.log(LOG_ERROR, funcName + " : context.portClickFlag == false");
    }

    ofplog.log(LOG_DEBUG, funcName + " - end");
}

(function() {
    packages = {

        // Lazily construct the package hierarchy from class names.
        root: function(classes) {
            var map = {};

            function find(name, data) {
                var node = map[name], i;
                if (!node) {
                    node = map[name] = data || {name: name, children: []};
                    if (name.length) {
                        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
                        node.parent.children.push(node);
                        node.deviceName = name.substring(i + 1);
                    }
                }
                return node;
            }

            classes.forEach(function(d) {
                find(d.deviceName, d);
            });

            return map[""];
        },

    };
})();

function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

function mouse(context) {
    var scaleRX = RX_SIZE * context.zoomArea.scale;
    var scaleRY = RY_SIZE * context.zoomArea.scale;
    var offsetX = context.zoomArea.translate[0] + scaleRX;
    var offsetY = context.zoomArea.translate[1] + scaleRY;

    return [d3.event.x - offsetX, d3.event.y - offsetY];
}

function mousedown(context) {
    context.m0 = mouse(context);
    d3.event.preventDefault();
    d3.event.stopPropagation();
}

function mousemove(context) {
    if (context.m0) {
        var m1 = mouse(context),
            dm = Math.atan2(cross(context.m0, m1), dot(context.m0, m1)) * 180 / Math.PI;
        context.rotateArea.style("-webkit-transform", "translateY(" + (RY_SIZE - RX_SIZE) + "px)rotateZ(" + (context.rotate + dm) + "deg)translateY(" + (RX_SIZE - RY_SIZE) + "px)");
    }
}

function mouseup(context) {
    if (context.m0) {
        var m1 = mouse(context),
            dm = Math.atan2(cross(context.m0, m1), dot(context.m0, m1)) * 180 / Math.PI;

        context.rotate += dm;
        if (context.rotate > 360) {
            context.rotate -= 360;
        } else if (context.rotate < 0) {
            context.rotate += 360;
        }
        context.m0 = null;
        context.rotateArea//.style("-webkit-transform", "translateY(" + (RY_SIZE - RX_SIZE) + "px)rotateZ(" + (context.rotate + dm) + "deg)translateY(" + (RX_SIZE - RY_SIZE) + "px)")//.attr("transform", "translate(" + RX_SIZE + "," + RY_SIZE + ")rotate(" + context.rotate + ")")
            .selectAll("g.node text")
                .attr("dx", function(d) { return (d.x + context.rotate) % 360 < 180 ? 25 : -25; })
                .attr("text-anchor", function(d) { return (d.x + context.rotate) % 360 < 180 ? "start" : "end"; })
                .attr("transform", function(d) { return (d.x + context.rotate) % 360 < 180 ? null : "rotate(180)"; });
    }
}

/*****************************************************/
function dragstarted(context) {
    d3.event.sourceEvent.stopPropagation();
    mousedown(context);
}

function dragged(context) {
    mousemove(context);
}

function dragended(context) {
    mouseup(context);
}
/*****************************************************/

function mouseover(d, context) {
    d3.selectAll("g.node").classed("highlight", false);
    d3.select(".node.node-" + d.deviceName).classed("highlight", true);
    d3.select(".nodeArc.node-" + d.deviceName).classed("highlight", true);
    d3.selectAll(".portArc.node-" + d.deviceName).classed("highlight", true);

    context.rotateArea.selectAll(".link.target-" + d.deviceName)
        .classed("target", true)
        .each(updateNodes("source", true, context));

    context.rotateArea.selectAll(".link.source-" + d.deviceName)
        .classed("source", true)
        .each(updateNodes("target", true, context));

    context.popupDiv.transition()
        .duration(200)
        .style("opacity", .9);
    context.popupDiv.html(
        "<div align=\"center\"><img src=\"img/" + d.deviceType +".png\"/></div>" + "<br/>" +
        "deviceName : " + d.deviceName + "<br/>" +
        "deviceType : " + d.deviceType + "<br/>" +
        "portNum    : " + d.ports.length)
            .style("left", (d3.event.pageX + 30) + "px")
            .style("top", (d3.event.pageY) + "px");
}

function mouseout(d, context) {
    d3.select(".node.node-" + d.deviceName).classed("highlight", false);
    d3.select(".nodeArc.node-" + d.deviceName).classed("highlight", false);
    d3.selectAll(".portArc.node-" + d.deviceName).classed("highlight", false);

    context.rotateArea.selectAll("path.link.source-" + d.deviceName)
        .classed("source", false)
        .each(updateNodes("target", false, context));

    context.rotateArea.selectAll("path.link.target-" + d.deviceName)
        .classed("target", false)
        .each(updateNodes("source", false, context));

    context.popupDiv.transition()
        .duration(500)
        .style("opacity", 0);
}

function portMouseover(p, context) {
    d3.select(".portArc.node-" + p.parentNode.deviceName + ".port-" + p.internalPortName).classed("highlight", true);

    context.popupDiv.transition()
        .duration(200)
        .style("opacity", .9);

    if (context.isP2PFlag) {
        context.popupDiv.html(
            "deviceName : " + p.parentNode.deviceName + "<br/>" +
            "portName   : " + p.portName + "<br/>" +
            "portNumber : " + p.portNumber + "<br/>" +
            ". OF-Patch Port Link<br/>" +
            ".   deficeName:" + p.ofpPortLink.deviceName + "<br/>" +
            ".     portName:" + p.ofpPortLink.portName + "<br/>" +
            ".     portNumber:" + p.ofpPortLink.portNumber + "<br/>")
                .style("left", (d3.event.pageX + 30) + "px")
                .style("top", (d3.event.pageY) + "px");
    } else {
        var d = p.parentNode;
        context.popupDiv.html(
            "<div align=\"center\"><img src=\"img/" + d.deviceType +".png\"/></div>" + "<br/>" +
            "deviceName : " + d.deviceName + "<br/>" +
            "deviceType : " + d.deviceType + "<br/>" +
            "portNum    : " + d.ports.length)
                .style("left", (d3.event.pageX + 30) + "px")
                .style("top", (d3.event.pageY) + "px");
    }
}

function portMouseout(p, context) {
    d3.select(".portArc.node-" + p.parentNode.deviceName + ".port-" + p.internalPortName).classed("highlight", false);

    context.popupDiv.transition()
        .duration(500)
        .style("opacity", 0);
}

function linkMouseover(l, context) {
    d3.select(".link.source-" + l.source.parentNode.deviceName + ".link.sourcePortNum-" + l.source.internalPortName + ".link.target-" + l.target.parentNode.deviceName + ".link.targetPortNum-" + l.target.internalPortName).classed("highlight", true);

    context.popupDiv.transition()
        .duration(200)
        .style("opacity", .9);
    context.popupDiv.html(l.source.parentNode.deviceName + "[" + l.source.portName + "] <---> " + l.target.parentNode.deviceName + "[" + l.target.portName + "]")
            .style("left", (d3.event.pageX + 30) + "px")
            .style("top", (d3.event.pageY) + "px");
}

function linkMouseout(l, context) {
    d3.select(".link.source-" + l.source.parentNode.deviceName + ".link.sourcePortNum-" + l.source.internalPortName + ".link.target-" + l.target.parentNode.deviceName + ".link.targetPortNum-" + l.target.internalPortName).classed("highlight", false);

    context.popupDiv.transition()
        .duration(500)
        .style("opacity", 0);
}


function updateNodes(name, value, context) {
    return function(d) {
        context.rotateArea.select(".node.node-" + d[name].parentNode.deviceName).classed(name, value);
    };
}

// JSONデータ内に指定のデータがあるか検索し、インデックスを返却する
function getJsonDataIndex(data, key, value) {
    var ret = -1;
    var i;
    switch(key) {
        case "deviceName":
            for(i=0; i<data.length; i++) {
                if(data[i].deviceName == value) {
                    ret = i;
                    break;
                }
            }
            break;
        default:
            break;
    }
    return ret;
}

// 指定のデータがあるか検索し、Dataを返却する
function searchGetData(data, key, value) {
    var ret = undefined;
    var i;

    if(typeof data === "undefined") {
        return ret;
    }
    if(typeof data.length === "undefined") {
        return ret;
    }

    switch(key) {
        case "deviceName":
            for(i=0; i<data.length; i++) {
                if(data[i].deviceName == value) {
                    ret = data[i];
                    break;
                }
            }
            break;
        case "portName":
            for(i=0; i<data.length; i++) {
                if(data[i].portName == value) {
                    ret = data[i];
                    break;
                }
            }
            break;
        case "portNumber":
            for(i=0; i<data.length; i++) {
                if(data[i].portNumber == value) {
                    ret = data[i];
                    break;
                }
            }
            break;
        default:
            break;
    }
    return ret;
}

function zoomed(context) {
    d3.event.sourceEvent.stopPropagation();
    context.zoomArea.translate = d3.event.translate;
    context.zoomArea.scale = d3.event.scale;
    context.zoomArea.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function arrayToCsv(array) {
	  var csv="";
	  for(var i=0; i < array.length; i++) {
	    csv += array[i] + ",";
	  }
	  csv = csv.slice(0,-1);
	  return csv;
}

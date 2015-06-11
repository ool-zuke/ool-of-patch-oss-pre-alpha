package ool.com.ofpm.client;

import ool.com.ofpm.exception.OFCClientException;
import ool.com.ofpm.json.common.BaseResponse;

public interface OFCClient {
	public BaseResponse setFlows(String dpid, Integer inPort, String srcMac, String dstMac, Integer outPort, String modSrcMac, String modDstMac, Boolean packetIn, Boolean drop) throws OFCClientException;

	public BaseResponse deleteFlows(String dpid, Integer inPort, String srcMac, String dstMac, Integer outPort, String modSrcMac, String modDstMac, Boolean packetIn, Boolean drop) throws OFCClientException;

	public String getIp();
}

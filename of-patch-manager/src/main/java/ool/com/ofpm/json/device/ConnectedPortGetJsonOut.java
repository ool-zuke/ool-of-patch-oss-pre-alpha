package ool.com.ofpm.json.device;

import java.lang.reflect.Type;

import ool.com.commons.json.GenericsRestResultResponse;
import ool.com.ofpm.json.common.GraphDevicePort;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

public class ConnectedPortGetJsonOut extends GenericsRestResultResponse<GenericsLink<GraphDevicePort>> {
	public static ConnectedPortGetJsonOut fromJson(String json) {
		Gson gson = new Gson();
		Type type = new TypeToken<ConnectedPortGetJsonOut>(){}.getType();
		return gson.fromJson(json, type);
	}
	public String toJson() {
		Gson gson = new Gson();
		Type type = new TypeToken<ConnectedPortGetJsonOut>(){}.getType();
		return gson.toJson(this, type);
	}
	@Override
	public String toString() {
		return this.toJson();
	}
}

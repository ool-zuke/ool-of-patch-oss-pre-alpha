package ool.com.ofpm.json.device;

public enum DeviceType {
	SWITCH("Switch"),
	SERVER("Server");
	private final String param;
	private DeviceType(final String param) {
		this.param = param;
	}
	@Override
	public String toString() {
		return this.param;
	}
}

package ool.com.ofpm.validate.device;

import static ool.com.constants.ErrorMessage.*;
import ool.com.ofpm.exception.ValidateException;
import ool.com.ofpm.json.device.PortInfoUpdateJsonIn;
import ool.com.ofpm.validate.common.BaseValidate;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

public class PortInfoUpdateJsonInValidate extends BaseValidate {
	private static Logger logger = Logger.getLogger(PortInfoUpdateJsonInValidate.class);

	/**
	 * @param updatePortInfo
	 * @throws ValidateException
	 */
	public void checkValidation(String deviceName, String portName, PortInfoUpdateJsonIn updatePortInfo) throws ValidateException {
		String fname = "checkValidateion";
		if (logger.isDebugEnabled()) {
			logger.debug(String.format("%s(updatePortInfo=%s) - start", fname, updatePortInfo));
		}

		if (StringUtils.isBlank(deviceName)) {
			throw new ValidateException(String.format(IS_BLANK, "deviceName"));
		}
		if (StringUtils.isBlank(portName)) {
			throw new ValidateException(String.format(IS_BLANK, "portName"));
		}

		if (BaseValidate.checkNull(updatePortInfo)) {
			throw new ValidateException(String.format(IS_BLANK, "parameter"));
		}

		if (logger.isDebugEnabled()) {
			logger.debug(String.format("%s() - end", fname));
		}
	}
}

package ool.com.ofpm.validate.topology.logical;

import static ool.com.constants.ErrorMessage.*;
import static ool.com.constants.OfpmDefinition.*;

import java.util.List;

import ool.com.ofpm.exception.ValidateException;
import ool.com.ofpm.json.device.PortData;
import ool.com.ofpm.json.topology.logical.LogicalLink;
import ool.com.ofpm.validate.common.BaseValidate;

import org.apache.log4j.Logger;

public class LogicalLinkValidate extends BaseValidate {
	private static Logger logger = Logger.getLogger(LogicalLinkValidate.class);

	public static void checkValidation(LogicalLink param) throws ValidateException {
		String fname = "checkValidation";
		if (logger.isDebugEnabled()) {
			logger.debug(String.format("%s(LogicalLink=%s) - start", fname, param));
		}

		if (BaseValidate.checkNull(param)) {
			throw new ValidateException(String.format(IS_BLANK, "link"));
		}
		List<PortData> link = param.getLink();
		if (BaseValidate.checkNull(link)) {
			throw new ValidateException(String.format(IS_BLANK,  "link"));
		}
		if (link.size() != COLLECT_NUMBER_OF_DEVICE_NAMES_IN_LINK) {
			throw new ValidateException(String.format(INVALID_PARAMETER, "Number of deviceName:LogicalLink"));
		}

		if (logger.isDebugEnabled()) {
    		logger.debug(String.format("checkValidation(ret=%s) - end "));
    	}
	}
}

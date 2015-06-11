package ool.com.orientdb.drivers;

/*
 * This class file based com.orientechnologies.orient.jdbc.OrientJdbcDriver.
 * We customized for customized-connection and customized-prepared-statement.
 */

import java.sql.Connection;
import java.sql.Driver;
import java.sql.SQLException;
import java.util.Properties;

import com.orientechnologies.common.log.OLogManager;
import com.orientechnologies.orient.core.config.OGlobalConfiguration;

//public class OrientJdbcDriver implements java.sql.Driver {
public class OrientJdbcDriver extends com.orientechnologies.orient.jdbc.OrientJdbcDriver {
	private static Boolean initialized = false;
	public OrientJdbcDriver() {
		synchronized (initialized) {
			if (initialized) {
				return ;
			}
			initialized = true;
			try {
				Driver oldDriver = java.sql.DriverManager.getDriver("jdbc:orient:");
				java.sql.DriverManager.deregisterDriver(oldDriver);
				java.sql.DriverManager.registerDriver(new OrientJdbcDriver());
			} catch (SQLException e) {
				OLogManager.instance().error(null, "Error Could not registering the JDBC Driver ");
			}
			OGlobalConfiguration.TX_COMMIT_SYNCH.setValue(true);
		}
	}

	@Override
	public Connection connect(String url, Properties info) throws SQLException {
		return new OrientJdbcConnection(url, info);
	}

//	@Override
//	public boolean acceptsURL(String url) throws SQLException {
//		return url.startsWith("jdbc:orient:");
//	}
//
//	@Override
//	public DriverPropertyInfo[] getPropertyInfo(String url, Properties info) throws SQLException {
//		return new DriverPropertyInfo[]{};
//	}
//
//	@Override
//	public int getMajorVersion() {
//		return 1;
//	}
//
//	@Override
//	public int getMinorVersion() {
//		return 0;
//	}
//
//	@Override
//	public boolean jdbcCompliant() {
//		return false;
//	}
//
//	@Override
//	public Logger getParentLogger() throws SQLFeatureNotSupportedException {
//		return null;
//	}
}

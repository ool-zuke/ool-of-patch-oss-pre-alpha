package ool.com.orientdb.drivers;

import java.lang.reflect.Field;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Properties;

import com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx;
import com.orientechnologies.orient.core.tx.OTransaction.TXTYPE;

/**
 *
 * @author user
 *
 */
public class OrientJdbcConnection extends com.orientechnologies.orient.jdbc.OrientJdbcConnection {

	private ODatabaseDocumentTx database;

	public OrientJdbcConnection(String iUrl, Properties iInfo) {
		super(iUrl, iInfo);
		Field field;
		try {
			field = com.orientechnologies.orient.jdbc.OrientJdbcConnection.class.getDeclaredField("database");
			field.setAccessible(true);
			database = (ODatabaseDocumentTx)field.get(this);
		} catch (Exception e) {
		}
	}

	@Override
	public PreparedStatement prepareStatement(String sql) throws SQLException {
		return new OrientJdbcPreparedStatement(this, sql);
	}

	@Override
	public void setAutoCommit(boolean autoCommit) throws SQLException {
		super.setAutoCommit(autoCommit);
		if (!autoCommit) {
			database.begin(TXTYPE.OPTIMISTIC);
		} else {
			database.begin(TXTYPE.NOTX);
		}
	}

	@Override
	public void commit() {
		database.commit(true);
	}

	@Override
	public void rollback() {
		database.rollback(true);
	}
}

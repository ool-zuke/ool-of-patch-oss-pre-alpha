/**
 * @author OOL 1131080355959
 * @date 2014/02/13
 * @TODO
 */
package ool.com.orientdb.client;

import java.sql.SQLException;
import java.util.List;

import ool.com.ofpm.utils.Config;
import ool.com.ofpm.utils.ConfigImpl;

import com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx;
import com.orientechnologies.orient.core.record.impl.ODocument;
import com.orientechnologies.orient.core.sql.query.OSQLSynchQuery;

/**
 * @author 1131080355959
 *
 */
public class ConnectionUtilsImpl implements ConnectionUtils {

    /**
     * 設定ファイル
     */
    private Config config;

    /**
     * デフォルトのコンストラクタ.
     */
    public ConnectionUtilsImpl() {
        this.config = new ConfigImpl();
    }

    /**
     * パラメータ付きコンストラクタ.
     *
     * @param config
     */
    public ConnectionUtilsImpl(Config config) {
        this.config = config;
    }

	/* (non-Javadoc)
	 * @see ool.com.orientdb.client.ConnectionUtils#getConnection()
	 */
	@Override
	public ODatabaseDocumentTx getDatabase() throws SQLException {
		return ConnectionManager.getInstance(config).getDatabase();
	}

	/* (non-Javadoc)
	 * @see ool.com.orientdb.client.ConnectionUtils#close(com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx)
	 */
	@Override
	public void close(ODatabaseDocumentTx database) throws SQLException {
		ConnectionManager.getInstance(config).close(database);
	}

	/* (non-Javadoc)
	 * @see ool.com.orientdb.client.ConnectionUtils#query(com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx, java.lang.String)
	 */
	@Override
	synchronized public List<ODocument> query(ODatabaseDocumentTx database, String query) {
		return database.query(new OSQLSynchQuery<ODocument>(query));
	}

	/* (non-Javadoc)
	 * @see ool.com.orientdb.client.ConnectionUtils#commit(com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx)
	 */
	@Override
	public void commit(ODatabaseDocumentTx database) {
		// not implemented
	}

	/* (non-Javadoc)
	 * @see ool.com.orientdb.client.ConnectionUtils#rollback(com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx)
	 */
	@Override
	public void rollback(ODatabaseDocumentTx database) {
		// not implemented
	}

	/* (non-Javadoc)
	 * @see ool.com.orientdb.client.ConnectionUtils#update(com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx, java.lang.String, java.lang.Object[])
	 */
	@Override
	public int update(ODatabaseDocumentTx database, String sql, Object[] params) {
		return 0;
	}

	/* (non-Javadoc)
	 * @see ool.com.orientdb.client.ConnectionUtils#update(com.orientechnologies.orient.core.db.document.ODatabaseDocumentTx, java.lang.String)
	 */
	@Override
	public int update(ODatabaseDocumentTx database, String sql) {
		return 0;
	}

}

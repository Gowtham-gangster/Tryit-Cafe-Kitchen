package com.tryitcafe;

import com.tryitcafe.config.DatabaseConfigNormalizer;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.output.MigrateResult;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.mock.env.MockEnvironment;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Supabase PostgreSQL Flyway & Schema Validation Tests")
public class SupabaseFlywayMigrationAndSchemaValidationTest {

    @Test
    @DisplayName("Verify clean Flyway migration executes and creates all required production tables")
    void testFlywayMigrationOnFreshDatabase() throws Exception {
        // Setup fresh in-memory database with PostgreSQL compatibility
        JdbcDataSource dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:supabase_migration_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
        dataSource.setUser("sa");
        dataSource.setPassword("");

        // Run Flyway against clean database
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();

        MigrateResult result = flyway.migrate();
        assertTrue(result.success, "Flyway migration must succeed on fresh database");
        assertTrue(result.migrationsExecuted > 0, "At least one migration (V1) must be executed");

        // Inspect metadata to verify all 11 required tables exist
        Set<String> expectedTables = Set.of(
                "users",
                "categories",
                "menu_items",
                "offers",
                "gallery_items",
                "reviews",
                "business_settings",
                "business_hours",
                "carts",
                "cart_items",
                "customer_locations"
        );

        Set<String> actualTables = new HashSet<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            try (ResultSet rs = metaData.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    actualTables.add(rs.getString("TABLE_NAME").toLowerCase());
                }
            }
        }

        for (String expectedTable : expectedTables) {
            assertTrue(actualTables.contains(expectedTable),
                    "Database must contain table: " + expectedTable + ". Actual tables: " + actualTables);
        }
    }

    @Test
    @DisplayName("Verify required production indexes exist after Flyway migration")
    void testRequiredIndexesExist() throws Exception {
        JdbcDataSource dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:supabase_indexes_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
        dataSource.setUser("sa");
        dataSource.setPassword("");

        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load();
        flyway.migrate();

        Set<String> actualIndexes = new HashSet<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            try (ResultSet rs = metaData.getIndexInfo(null, null, "MENU_ITEMS", false, false)) {
                while (rs.next()) {
                    String indexName = rs.getString("INDEX_NAME");
                    if (indexName != null) actualIndexes.add(indexName.toLowerCase());
                }
            }
            try (ResultSet rs = metaData.getIndexInfo(null, null, "USERS", false, false)) {
                while (rs.next()) {
                    String indexName = rs.getString("INDEX_NAME");
                    if (indexName != null) actualIndexes.add(indexName.toLowerCase());
                }
            }
            try (ResultSet rs = metaData.getIndexInfo(null, null, "CUSTOMER_LOCATIONS", false, false)) {
                while (rs.next()) {
                    String indexName = rs.getString("INDEX_NAME");
                    if (indexName != null) actualIndexes.add(indexName.toLowerCase());
                }
            }
        }

        // Verify key performance indexes exist
        assertTrue(actualIndexes.contains("idx_menu_item_slug") || actualIndexes.stream().anyMatch(i -> i.contains("slug")));
        assertTrue(actualIndexes.contains("idx_user_phone") || actualIndexes.stream().anyMatch(i -> i.contains("phone")));
        assertTrue(actualIndexes.contains("idx_customer_location_customer_id") || actualIndexes.stream().anyMatch(i -> i.contains("customer_id")));
    }

    @Test
    @DisplayName("Verify DatabaseConfigNormalizer correctly converts Supabase URI and enforces SSL")
    void testDatabaseConfigNormalizer() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        DatabaseConfigNormalizer normalizer = new DatabaseConfigNormalizer(env);

        // 1. Test standard Supabase URI format: postgresql://user:pass@host:port/db
        DataSourceProperties props1 = new DataSourceProperties();
        props1.setUrl("postgresql://postgres.myproject:secretpass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres");
        normalizer.normalizeDataSourceProperties(props1);

        assertEquals("jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require", props1.getUrl());
        assertEquals("postgres.myproject", props1.getUsername());
        assertEquals("secretpass", props1.getPassword());
        assertEquals("org.postgresql.Driver", props1.getDriverClassName());

        // 2. Test JDBC URL without sslmode in prod (must append sslmode=require)
        DataSourceProperties props2 = new DataSourceProperties();
        props2.setUrl("jdbc:postgresql://db.myproject.supabase.co:5432/postgres");
        props2.setUsername("postgres");
        props2.setPassword("secret");
        normalizer.normalizeDataSourceProperties(props2);

        assertEquals("jdbc:postgresql://db.myproject.supabase.co:5432/postgres?sslmode=require", props2.getUrl());

        // 3. Test H2 URL (must remain completely untouched)
        DataSourceProperties props3 = new DataSourceProperties();
        props3.setUrl("jdbc:h2:mem:dev_db;MODE=PostgreSQL");
        props3.setUsername("sa");
        normalizer.normalizeDataSourceProperties(props3);

        assertEquals("jdbc:h2:mem:dev_db;MODE=PostgreSQL", props3.getUrl());
    }
}

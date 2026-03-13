-- Career Navigator: submissions table for lead & feedback capture
-- This table is auto-created by the app on first request,
-- but you can run this script manually for pre-provisioning.

CREATE TABLE IF NOT EXISTS submissions (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    full_name   VARCHAR(255) NULL,
    email       VARCHAR(255) NULL,
    target_role VARCHAR(255) NULL,
    rating      TINYINT UNSIGNED NULL,
    comment     TEXT         NULL,
    session_id  VARCHAR(100) NULL,
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

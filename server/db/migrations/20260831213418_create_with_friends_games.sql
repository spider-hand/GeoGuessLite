-- migrate:up
CREATE TABLE with_friends_games (
    id CHARACTER VARYING(64) PRIMARY KEY,
    room_key CHARACTER(6) NOT NULL UNIQUE,
    host_user_id CHARACTER VARYING(64),
    result JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT with_friends_games_host_user_id_fkey FOREIGN KEY (host_user_id)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT with_friends_games_room_key_check CHECK (room_key ~ '^[0-9]{6}$'),
    CONSTRAINT with_friends_games_result_check CHECK (
        result IS NULL OR JSONB_TYPEOF(result) = 'object'
    )
);

CREATE INDEX idx_with_friends_games_expiration
    ON with_friends_games (COALESCE(completed_at, created_at));

-- migrate:down
DROP TABLE with_friends_games;

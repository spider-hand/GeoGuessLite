-- migrate:up
CREATE TABLE single_player_games (
    id CHARACTER VARYING(64) PRIMARY KEY,
    user_id CHARACTER VARYING(128) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE single_player_game_rounds (
    game_id CHARACTER VARYING(64) NOT NULL,
    round_number INTEGER NOT NULL,
    image_id TEXT NOT NULL,
    target_latitude DOUBLE PRECISION NOT NULL,
    target_longitude DOUBLE PRECISION NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    guess_latitude DOUBLE PRECISION,
    guess_longitude DOUBLE PRECISION,
    distance_km DOUBLE PRECISION,
    score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (game_id, round_number),
    CONSTRAINT single_player_game_rounds_game_id_fkey FOREIGN KEY (game_id)
        REFERENCES single_player_games (id) ON DELETE CASCADE,
    CONSTRAINT single_player_game_rounds_round_number_check CHECK (
        round_number BETWEEN 1 AND 5
    ),
    CONSTRAINT single_player_game_rounds_target_latitude_check CHECK (
        target_latitude BETWEEN -90 AND 90
    ),
    CONSTRAINT single_player_game_rounds_target_longitude_check CHECK (
        target_longitude BETWEEN -180 AND 180
    ),
    CONSTRAINT single_player_game_rounds_score_check CHECK (
        score BETWEEN 0 AND 5000
    )
);

CREATE INDEX idx_single_player_games_user_completed
    ON single_player_games (user_id, completed_at DESC);
CREATE INDEX idx_single_player_games_created_at
    ON single_player_games (created_at);

-- migrate:down
DROP TABLE single_player_game_rounds;
DROP TABLE single_player_games;

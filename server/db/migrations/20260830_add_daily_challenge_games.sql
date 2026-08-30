-- migrate:up
DELETE FROM daily_challenges;
DROP TABLE daily_scores;

ALTER TABLE daily_challenge_rounds
    RENAME COLUMN round TO round_number;
ALTER TABLE daily_challenge_rounds
    ADD COLUMN target_latitude DOUBLE PRECISION NOT NULL,
    ADD COLUMN target_longitude DOUBLE PRECISION NOT NULL,
    ADD CONSTRAINT daily_challenge_rounds_round_number_check CHECK (
        round_number BETWEEN 1 AND 5
    ),
    ADD CONSTRAINT daily_challenge_rounds_target_latitude_check CHECK (
        target_latitude BETWEEN -90 AND 90
    ),
    ADD CONSTRAINT daily_challenge_rounds_target_longitude_check CHECK (
        target_longitude BETWEEN -180 AND 180
    );

ALTER TABLE single_player_games
    ADD COLUMN game_mode TEXT NOT NULL DEFAULT 'single_player',
    ADD COLUMN daily_challenge_id CHARACTER VARYING(64)
        REFERENCES daily_challenges (id) ON DELETE CASCADE,
    ADD CONSTRAINT single_player_games_game_mode_check CHECK (
        game_mode IN ('single_player', 'daily_challenge')
    ),
    ADD CONSTRAINT single_player_games_daily_challenge_check CHECK (
        (game_mode = 'single_player' AND daily_challenge_id IS NULL)
        OR (game_mode = 'daily_challenge' AND daily_challenge_id IS NOT NULL)
    );

CREATE UNIQUE INDEX idx_single_player_games_user_daily_challenge
    ON single_player_games (user_id, daily_challenge_id)
    WHERE daily_challenge_id IS NOT NULL;

-- migrate:down
DROP INDEX idx_single_player_games_user_daily_challenge;

ALTER TABLE single_player_games
    DROP CONSTRAINT single_player_games_daily_challenge_id_fkey,
    DROP CONSTRAINT single_player_games_daily_challenge_check,
    DROP CONSTRAINT single_player_games_game_mode_check,
    DROP COLUMN daily_challenge_id,
    DROP COLUMN game_mode;

ALTER TABLE daily_challenge_rounds
    DROP CONSTRAINT daily_challenge_rounds_target_longitude_check,
    DROP CONSTRAINT daily_challenge_rounds_target_latitude_check,
    DROP CONSTRAINT daily_challenge_rounds_round_number_check,
    DROP COLUMN target_longitude,
    DROP COLUMN target_latitude;
ALTER TABLE daily_challenge_rounds
    RENAME COLUMN round_number TO round;

CREATE TABLE daily_scores (
    id CHARACTER VARYING(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id CHARACTER VARYING(64) NOT NULL,
    date DATE NOT NULL,
    score INTEGER NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    time_taken INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT daily_scores_user_id_date_key UNIQUE (user_id, date),
    CONSTRAINT daily_scores_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_daily_scores_date ON daily_scores (date);
CREATE INDEX idx_daily_scores_score_date ON daily_scores (score DESC, date);
CREATE INDEX idx_daily_scores_user_id ON daily_scores (user_id);

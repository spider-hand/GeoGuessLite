-- migrate:up
CREATE TABLE IF NOT EXISTS users (
    id CHARACTER VARYING(64) PRIMARY KEY,
    name CHARACTER VARYING(50) NOT NULL,
    avatar_emoji CHARACTER VARYING(8) NOT NULL,
    avatar_bg CHARACTER VARYING(16) NOT NULL,
    games_played INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    average_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distance_unit TEXT NOT NULL DEFAULT 'km',
    CONSTRAINT users_distance_unit_check CHECK (
        distance_unit IN ('km', 'mile')
    )
);

CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    is_pano BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_challenges (
    id CHARACTER VARYING(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_challenge_rounds (
    id CHARACTER VARYING(64) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    daily_challenge_id CHARACTER VARYING(64) NOT NULL,
    round INTEGER NOT NULL,
    image_id CHARACTER VARYING(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT daily_challenge_rounds_daily_challenge_id_round_key UNIQUE (
        daily_challenge_id,
        round
    ),
    CONSTRAINT daily_challenge_rounds_daily_challenge_id_fkey FOREIGN KEY (
        daily_challenge_id
    ) REFERENCES daily_challenges (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_scores (
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

CREATE INDEX IF NOT EXISTS idx_daily_challenge_rounds_daily_challenge_id
    ON daily_challenge_rounds (daily_challenge_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenge_rounds_round
    ON daily_challenge_rounds (round);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date
    ON daily_challenges (date);
CREATE INDEX IF NOT EXISTS idx_daily_scores_date
    ON daily_scores (date);
CREATE INDEX IF NOT EXISTS idx_daily_scores_score_date
    ON daily_scores (score DESC, date);
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_id
    ON daily_scores (user_id);

-- migrate:down
DROP TABLE daily_scores;
DROP TABLE daily_challenge_rounds;
DROP TABLE daily_challenges;
DROP TABLE images;
DROP TABLE users;

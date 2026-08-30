\restrict dbmate

-- Dumped from database version 17.11 (32e7196)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: daily_challenge_rounds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_challenge_rounds (
    id character varying(64) DEFAULT (gen_random_uuid())::text NOT NULL,
    daily_challenge_id character varying(64) NOT NULL,
    round_number integer NOT NULL,
    image_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    target_latitude double precision NOT NULL,
    target_longitude double precision NOT NULL,
    CONSTRAINT daily_challenge_rounds_round_number_check CHECK (((round_number >= 1) AND (round_number <= 5))),
    CONSTRAINT daily_challenge_rounds_target_latitude_check CHECK (((target_latitude >= ('-90'::integer)::double precision) AND (target_latitude <= (90)::double precision))),
    CONSTRAINT daily_challenge_rounds_target_longitude_check CHECK (((target_longitude >= ('-180'::integer)::double precision) AND (target_longitude <= (180)::double precision)))
);


--
-- Name: daily_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_challenges (
    id character varying(64) DEFAULT (gen_random_uuid())::text NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.images (
    id text NOT NULL,
    is_pano boolean NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: single_player_game_rounds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.single_player_game_rounds (
    game_id character varying(64) NOT NULL,
    round_number integer NOT NULL,
    image_id text NOT NULL,
    target_latitude double precision NOT NULL,
    target_longitude double precision NOT NULL,
    started_at timestamp with time zone,
    guess_latitude double precision,
    guess_longitude double precision,
    distance_km double precision,
    score integer,
    completed_at timestamp with time zone,
    CONSTRAINT single_player_game_rounds_round_number_check CHECK (((round_number >= 1) AND (round_number <= 5))),
    CONSTRAINT single_player_game_rounds_score_check CHECK (((score >= 0) AND (score <= 5000))),
    CONSTRAINT single_player_game_rounds_target_latitude_check CHECK (((target_latitude >= ('-90'::integer)::double precision) AND (target_latitude <= (90)::double precision))),
    CONSTRAINT single_player_game_rounds_target_longitude_check CHECK (((target_longitude >= ('-180'::integer)::double precision) AND (target_longitude <= (180)::double precision)))
);


--
-- Name: single_player_games; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.single_player_games (
    id character varying(64) NOT NULL,
    user_id character varying(128) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    game_mode text DEFAULT 'single_player'::text NOT NULL,
    daily_challenge_id character varying(64),
    CONSTRAINT single_player_games_daily_challenge_check CHECK ((((game_mode = 'single_player'::text) AND (daily_challenge_id IS NULL)) OR ((game_mode = 'daily_challenge'::text) AND (daily_challenge_id IS NOT NULL)))),
    CONSTRAINT single_player_games_game_mode_check CHECK ((game_mode = ANY (ARRAY['single_player'::text, 'daily_challenge'::text])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying(64) NOT NULL,
    display_name character varying(50) NOT NULL,
    games_played integer DEFAULT 0 NOT NULL,
    best_score integer DEFAULT 0 NOT NULL,
    average_score double precision DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    distance_unit text DEFAULT 'km'::text NOT NULL,
    country text,
    CONSTRAINT users_distance_unit_check CHECK ((distance_unit = ANY (ARRAY['km'::text, 'mile'::text])))
);


--
-- Name: daily_challenge_rounds daily_challenge_rounds_daily_challenge_id_round_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenge_rounds
    ADD CONSTRAINT daily_challenge_rounds_daily_challenge_id_round_key UNIQUE (daily_challenge_id, round_number);


--
-- Name: daily_challenge_rounds daily_challenge_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenge_rounds
    ADD CONSTRAINT daily_challenge_rounds_pkey PRIMARY KEY (id);


--
-- Name: daily_challenges daily_challenges_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_date_key UNIQUE (date);


--
-- Name: daily_challenges daily_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_pkey PRIMARY KEY (id);


--
-- Name: images images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: single_player_game_rounds single_player_game_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.single_player_game_rounds
    ADD CONSTRAINT single_player_game_rounds_pkey PRIMARY KEY (game_id, round_number);


--
-- Name: single_player_games single_player_games_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.single_player_games
    ADD CONSTRAINT single_player_games_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_daily_challenge_rounds_daily_challenge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_challenge_rounds_daily_challenge_id ON public.daily_challenge_rounds USING btree (daily_challenge_id);


--
-- Name: idx_daily_challenge_rounds_round; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_challenge_rounds_round ON public.daily_challenge_rounds USING btree (round_number);


--
-- Name: idx_daily_challenges_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_challenges_date ON public.daily_challenges USING btree (date);


--
-- Name: idx_single_player_games_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_single_player_games_created_at ON public.single_player_games USING btree (created_at);


--
-- Name: idx_single_player_games_user_completed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_single_player_games_user_completed ON public.single_player_games USING btree (user_id, completed_at DESC);


--
-- Name: idx_single_player_games_user_daily_challenge; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_single_player_games_user_daily_challenge ON public.single_player_games USING btree (user_id, daily_challenge_id) WHERE (daily_challenge_id IS NOT NULL);


--
-- Name: daily_challenge_rounds daily_challenge_rounds_daily_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenge_rounds
    ADD CONSTRAINT daily_challenge_rounds_daily_challenge_id_fkey FOREIGN KEY (daily_challenge_id) REFERENCES public.daily_challenges(id) ON DELETE CASCADE;


--
-- Name: single_player_game_rounds single_player_game_rounds_game_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.single_player_game_rounds
    ADD CONSTRAINT single_player_game_rounds_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.single_player_games(id) ON DELETE CASCADE;


--
-- Name: single_player_games single_player_games_daily_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.single_player_games
    ADD CONSTRAINT single_player_games_daily_challenge_id_fkey FOREIGN KEY (daily_challenge_id) REFERENCES public.daily_challenges(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260822173227'),
    ('20260822234712'),
    ('20260823'),
    ('20260830');

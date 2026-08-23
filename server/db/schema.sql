\restrict dbmate

-- Dumped from database version 17.11 (df1f1a3)
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
    round integer NOT NULL,
    image_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
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
-- Name: daily_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_scores (
    id character varying(64) DEFAULT (gen_random_uuid())::text NOT NULL,
    user_id character varying(64) NOT NULL,
    date date NOT NULL,
    score integer NOT NULL,
    distance double precision NOT NULL,
    time_taken integer NOT NULL,
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
    ADD CONSTRAINT daily_challenge_rounds_daily_challenge_id_round_key UNIQUE (daily_challenge_id, round);


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
-- Name: daily_scores daily_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_scores
    ADD CONSTRAINT daily_scores_pkey PRIMARY KEY (id);


--
-- Name: daily_scores daily_scores_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_scores
    ADD CONSTRAINT daily_scores_user_id_date_key UNIQUE (user_id, date);


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

CREATE INDEX idx_daily_challenge_rounds_round ON public.daily_challenge_rounds USING btree (round);


--
-- Name: idx_daily_challenges_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_challenges_date ON public.daily_challenges USING btree (date);


--
-- Name: idx_daily_scores_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_scores_date ON public.daily_scores USING btree (date);


--
-- Name: idx_daily_scores_score_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_scores_score_date ON public.daily_scores USING btree (score DESC, date);


--
-- Name: idx_daily_scores_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_scores_user_id ON public.daily_scores USING btree (user_id);


--
-- Name: daily_challenge_rounds daily_challenge_rounds_daily_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_challenge_rounds
    ADD CONSTRAINT daily_challenge_rounds_daily_challenge_id_fkey FOREIGN KEY (daily_challenge_id) REFERENCES public.daily_challenges(id) ON DELETE CASCADE;


--
-- Name: daily_scores daily_scores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_scores
    ADD CONSTRAINT daily_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260822173227'),
    ('20260822234712');

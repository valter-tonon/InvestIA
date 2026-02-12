--
-- PostgreSQL database dump
--

\restrict 16QX4Rxvgn0ieyrziYokclX55K06WAAHvI0yaawGq7T4imx7NCr22tcUUO8PnCE

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AlertCondition; Type: TYPE; Schema: public; Owner: sardinha
--

CREATE TYPE public."AlertCondition" AS ENUM (
    'ABOVE',
    'BELOW',
    'EQUAL'
);


ALTER TYPE public."AlertCondition" OWNER TO sardinha;

--
-- Name: AssetType; Type: TYPE; Schema: public; Owner: sardinha
--

CREATE TYPE public."AssetType" AS ENUM (
    'STOCK',
    'FII',
    'ETF',
    'BDR',
    'CRYPTO'
);


ALTER TYPE public."AssetType" OWNER TO sardinha;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: sardinha
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO sardinha;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO sardinha;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.assets (
    id text NOT NULL,
    ticker text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    sector text,
    current_price numeric(12,2),
    dividend_yield numeric(5,4),
    price_to_earnings numeric(8,2),
    price_to_book numeric(8,2),
    roe numeric(5,4),
    net_margin numeric(5,4),
    debt_to_equity numeric(8,2),
    last_updated timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone,
    average_purchase_price numeric(12,2)
);


ALTER TABLE public.assets OWNER TO sardinha;

--
-- Name: dividends; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.dividends (
    id text NOT NULL,
    asset_id text NOT NULL,
    payment_date timestamp(3) without time zone NOT NULL,
    ex_date timestamp(3) without time zone NOT NULL,
    value numeric(10,4) NOT NULL,
    type text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dividends OWNER TO sardinha;

--
-- Name: economic_indicators; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.economic_indicators (
    id text NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    value double precision NOT NULL,
    last_updated timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.economic_indicators OWNER TO sardinha;

--
-- Name: philosophies; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.philosophies (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    file_path text NOT NULL,
    extracted_text text NOT NULL,
    rules text[],
    user_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    structured_rules jsonb
);


ALTER TABLE public.philosophies OWNER TO sardinha;

--
-- Name: price_alerts; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.price_alerts (
    id text NOT NULL,
    user_id text NOT NULL,
    asset_id text NOT NULL,
    target_price numeric(10,2) NOT NULL,
    condition public."AlertCondition" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    triggered_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_alerts OWNER TO sardinha;

--
-- Name: strategy_profiles; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.strategy_profiles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    rules jsonb NOT NULL,
    source_type text,
    source_ref text,
    is_active boolean DEFAULT true NOT NULL,
    user_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.strategy_profiles OWNER TO sardinha;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    password text NOT NULL,
    deleted_at timestamp(3) without time zone,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL
);


ALTER TABLE public.users OWNER TO sardinha;

--
-- Name: wallet_assets; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.wallet_assets (
    id text NOT NULL,
    wallet_id text NOT NULL,
    asset_id text NOT NULL,
    quantity numeric(18,8) NOT NULL,
    average_price numeric(12,2) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wallet_assets OWNER TO sardinha;

--
-- Name: wallets; Type: TABLE; Schema: public; Owner: sardinha
--

CREATE TABLE public.wallets (
    id text NOT NULL,
    name text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.wallets OWNER TO sardinha;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c5b31f01-6e9c-4de1-88dd-f536e3667161	e041e5d809b5303aec760617d1967088f8b4e19d1b5e3b12a8a7d5526444a155	2026-02-05 12:55:34.248632+00	20260129180100_init	\N	\N	2026-02-05 12:55:34.105199+00	1
683aa0d9-63b3-4ace-a4d3-b10cc2f8165c	0b6cfe2249f371bddeaa06ff8403797f12b7e63fb027e44e85e8ed74518bf7a8	2026-02-05 12:55:34.255433+00	20260129194709_add_user_password	\N	\N	2026-02-05 12:55:34.250464+00	1
51468081-33be-425a-b523-c205f0838b82	a14634a828ad81dabca6031ed594af97cf9828b9139c1bc7ddd7e2874635c9f9	2026-02-05 12:55:34.273596+00	20260129203103_add_philosophy_model	\N	\N	2026-02-05 12:55:34.257152+00	1
ddefd3c3-f46f-461c-8f58-cebf3f216da3	de069e69fb0c39489cb2f06634bbe86ee8d8d9c599e9c27cdf91f01f1c3a0862	2026-02-05 18:53:32.853386+00	20260130141545_add_structured_rules_to_philosophy	\N	\N	2026-02-05 18:53:32.830316+00	1
546a9be2-65eb-4623-bf98-20184b3cb53e	f1f6b5ee945532eabf6b2102a4a0ec70b467d17ffd1253f63416626e920c8f6f	2026-02-05 18:53:33.084049+00	20260203173419_add_soft_delete	\N	\N	2026-02-05 18:53:32.855861+00	1
116a258f-9545-433e-8f8e-ff826664c8eb	611cc02dd05d4ad5f0cc3c6e68ad4fb418e3a2437b4cfa0c8108ac793f678445	2026-02-05 18:53:33.141666+00	20260203174929_add_cascade_delete	\N	\N	2026-02-05 18:53:33.086288+00	1
63937e41-e740-4d46-a15d-42d5d74b3a15	5ed106212044738090df2fbad57153a7d8b4e987d22d40e7b3a7e47132cdb916	2026-02-05 18:53:33.171553+00	20260204124156_add_dividend_model	\N	\N	2026-02-05 18:53:33.14384+00	1
166ac39c-02a0-428b-bebd-d2217f156c0e	faa6b5f93055ee77fea1652c4430b3aaab834ef5452ec6b285e5e3e37a2e994b	2026-02-05 18:53:33.178351+00	20260204163146_add_average_purchase_price	\N	\N	2026-02-05 18:53:33.173771+00	1
07b211a4-95a6-4071-a68a-3d750cc01723	2574e2a394af2d6e7769745e762cf4a0caa12d8fa8d7e5df6585e436dc158705	2026-02-09 13:47:14.251512+00	20260209134451_add_user_role	\N	\N	2026-02-09 13:47:13.030158+00	1
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.assets (id, ticker, name, type, sector, current_price, dividend_yield, price_to_earnings, price_to_book, roe, net_margin, debt_to_equity, last_updated, created_at, updated_at, deleted_at, average_purchase_price) FROM stdin;
a373dfef-e2ba-4469-9dbd-55dee8f9b2cc	PETR4	PETR4	STOCK	\N	37.32	\N	\N	\N	\N	\N	\N	2026-02-10 12:42:03.788	2026-02-10 12:42:03.792	2026-02-10 12:42:03.792	\N	\N
d2fa2e2b-f935-4e5d-8380-d723a144953f	ITUB4	ITUB4	STOCK	\N	48.31	\N	\N	\N	\N	\N	\N	2026-02-10 12:42:04.055	2026-02-10 12:42:04.057	2026-02-10 12:42:04.057	\N	\N
f84b7bad-8d44-48ab-a9ca-d34a2672c38a	VALE3	VALE3	STOCK	\N	87.31	\N	\N	\N	\N	\N	\N	2026-02-10 12:42:04.09	2026-02-10 12:42:04.091	2026-02-10 12:42:04.091	\N	\N
c404d713-e72e-4d89-9ae0-14134270df7e	MGLU3	MGLU3	STOCK	\N	10.97	\N	\N	\N	\N	\N	\N	2026-02-10 12:42:06.837	2026-02-10 12:42:06.838	2026-02-10 12:42:06.838	\N	\N
\.


--
-- Data for Name: dividends; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.dividends (id, asset_id, payment_date, ex_date, value, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: economic_indicators; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.economic_indicators (id, key, name, value, last_updated, created_at, updated_at) FROM stdin;
5d36f6e3-99c9-430f-8f32-63bcbf576b37	SELIC	Taxa Selic	15	2026-02-10 06:00:07.026	2026-02-09 13:55:04.83	2026-02-10 06:00:07.027
49864abf-8f1b-431b-a14e-bfdde34b2d93	IPCA	IPCA (Acumulado 12m)	4.26	2026-02-10 06:00:03.833	2026-02-09 13:55:05.128	2026-02-10 06:00:03.836
5edf6d7e-aad9-48b7-8aee-46803a056d76	CDI	Taxa CDI	14.9	2026-02-10 06:00:02.146	2026-02-09 13:55:04.639	2026-02-10 06:00:02.176
\.


--
-- Data for Name: philosophies; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.philosophies (id, title, description, file_path, extracted_text, rules, user_id, created_at, updated_at, structured_rules) FROM stdin;
\.


--
-- Data for Name: price_alerts; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.price_alerts (id, user_id, asset_id, target_price, condition, is_active, triggered_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: strategy_profiles; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.strategy_profiles (id, name, description, rules, source_type, source_ref, is_active, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.users (id, email, name, created_at, updated_at, password, deleted_at, role) FROM stdin;
e2fee9e0-0c3d-4433-9783-0f1ce163a275	tononvalter@gmail.com	Valter Tonon	2026-02-09 13:50:03.136	2026-02-09 13:50:03.136	$2b$10$fFVFeb.Efl8jksZUq3p5jeEwhoLfv.jfhd1m85PoNSqtQ2gSamxRa	\N	USER
\.


--
-- Data for Name: wallet_assets; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.wallet_assets (id, wallet_id, asset_id, quantity, average_price, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wallets; Type: TABLE DATA; Schema: public; Owner: sardinha
--

COPY public.wallets (id, name, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: dividends dividends_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.dividends
    ADD CONSTRAINT dividends_pkey PRIMARY KEY (id);


--
-- Name: economic_indicators economic_indicators_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.economic_indicators
    ADD CONSTRAINT economic_indicators_pkey PRIMARY KEY (id);


--
-- Name: philosophies philosophies_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.philosophies
    ADD CONSTRAINT philosophies_pkey PRIMARY KEY (id);


--
-- Name: price_alerts price_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.price_alerts
    ADD CONSTRAINT price_alerts_pkey PRIMARY KEY (id);


--
-- Name: strategy_profiles strategy_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.strategy_profiles
    ADD CONSTRAINT strategy_profiles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallet_assets wallet_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.wallet_assets
    ADD CONSTRAINT wallet_assets_pkey PRIMARY KEY (id);


--
-- Name: wallets wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_pkey PRIMARY KEY (id);


--
-- Name: assets_sector_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX assets_sector_idx ON public.assets USING btree (sector);


--
-- Name: assets_ticker_key; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE UNIQUE INDEX assets_ticker_key ON public.assets USING btree (ticker);


--
-- Name: assets_type_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX assets_type_idx ON public.assets USING btree (type);


--
-- Name: dividends_asset_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX dividends_asset_id_idx ON public.dividends USING btree (asset_id);


--
-- Name: dividends_asset_id_payment_date_type_key; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE UNIQUE INDEX dividends_asset_id_payment_date_type_key ON public.dividends USING btree (asset_id, payment_date, type);


--
-- Name: dividends_payment_date_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX dividends_payment_date_idx ON public.dividends USING btree (payment_date);


--
-- Name: economic_indicators_key_key; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE UNIQUE INDEX economic_indicators_key_key ON public.economic_indicators USING btree (key);


--
-- Name: philosophies_user_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX philosophies_user_id_idx ON public.philosophies USING btree (user_id);


--
-- Name: price_alerts_asset_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX price_alerts_asset_id_idx ON public.price_alerts USING btree (asset_id);


--
-- Name: price_alerts_is_active_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX price_alerts_is_active_idx ON public.price_alerts USING btree (is_active);


--
-- Name: price_alerts_user_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX price_alerts_user_id_idx ON public.price_alerts USING btree (user_id);


--
-- Name: strategy_profiles_is_active_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX strategy_profiles_is_active_idx ON public.strategy_profiles USING btree (is_active);


--
-- Name: strategy_profiles_user_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX strategy_profiles_user_id_idx ON public.strategy_profiles USING btree (user_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: wallet_assets_asset_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX wallet_assets_asset_id_idx ON public.wallet_assets USING btree (asset_id);


--
-- Name: wallet_assets_wallet_id_asset_id_key; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE UNIQUE INDEX wallet_assets_wallet_id_asset_id_key ON public.wallet_assets USING btree (wallet_id, asset_id);


--
-- Name: wallet_assets_wallet_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX wallet_assets_wallet_id_idx ON public.wallet_assets USING btree (wallet_id);


--
-- Name: wallets_user_id_idx; Type: INDEX; Schema: public; Owner: sardinha
--

CREATE INDEX wallets_user_id_idx ON public.wallets USING btree (user_id);


--
-- Name: dividends dividends_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.dividends
    ADD CONSTRAINT dividends_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: philosophies philosophies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.philosophies
    ADD CONSTRAINT philosophies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_alerts price_alerts_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.price_alerts
    ADD CONSTRAINT price_alerts_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_alerts price_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.price_alerts
    ADD CONSTRAINT price_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: strategy_profiles strategy_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.strategy_profiles
    ADD CONSTRAINT strategy_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallet_assets wallet_assets_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.wallet_assets
    ADD CONSTRAINT wallet_assets_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallet_assets wallet_assets_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.wallet_assets
    ADD CONSTRAINT wallet_assets_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallets wallets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sardinha
--

ALTER TABLE ONLY public.wallets
    ADD CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 16QX4Rxvgn0ieyrziYokclX55K06WAAHvI0yaawGq7T4imx7NCr22tcUUO8PnCE


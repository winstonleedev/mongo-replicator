--
-- PostgreSQL database dump
--

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 10.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: exist_sensor(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.exist_sensor(in_mongo_id_sensor character varying, in_type character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    _id_sensor integer;
BEGIN
    SELECT id_sensor INTO _id_sensor FROM sensors WHERE sensors.mongo_id_sensor = in_mongo_id_sensor AND sensors.type = in_type;
    IF NOT FOUND THEN
        INSERT INTO sensors(mongo_id_sensor, "type") VALUES (in_mongo_id_sensor, in_type) RETURNING id_sensor into _id_sensor;
    END IF;
    RETURN _id_sensor;
END;
$$;


ALTER FUNCTION public.exist_sensor(in_mongo_id_sensor character varying, in_type character varying) OWNER TO postgres;

--
-- Name: inc(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.inc(val integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$	 DECLARE BEGIN	 RETURN val + 1;	END; 	$$;


ALTER FUNCTION public.inc(val integer) OWNER TO postgres;

--
-- Name: insert_value_number(character varying, timestamp without time zone, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_value_number(mongo_id_sensor character varying, in_time timestamp without time zone, in_value numeric) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    _id_sensor integer;
    _id_ts integer;
BEGIN
    _id_sensor = exist_sensor(mongo_id_sensor, 'number');
    INSERT INTO series_number(id_sensor, "time", "value") VALUES (_id_sensor, in_time, in_value) RETURNING id INTO _id_ts;
    RETURN _id_ts;
END;
$$;


ALTER FUNCTION public.insert_value_number(mongo_id_sensor character varying, in_time timestamp without time zone, in_value numeric) OWNER TO postgres;

--
-- Name: insert_value_string(character varying, timestamp without time zone, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_value_string(mongo_id_sensor character varying, in_time timestamp without time zone, in_value character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    _id_sensor integer;
    _id_ts integer;
BEGIN
    _id_sensor = exist_sensor(mongo_id_sensor, 'string');
    INSERT INTO series_string(id_sensor, "time", "value") VALUES (_id_sensor, in_time, in_value) RETURNING id INTO _id_ts;
    RETURN _id_ts;
END;
$$;


ALTER FUNCTION public.insert_value_string(mongo_id_sensor character varying, in_time timestamp without time zone, in_value character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: series_string; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.series_string (
    id integer NOT NULL,
    "time" timestamp without time zone NOT NULL,
    value character varying NOT NULL,
    id_sensor integer NOT NULL
);


ALTER TABLE public.series_string OWNER TO postgres;

--
-- Name: series_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.series_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.series_id_seq OWNER TO postgres;

--
-- Name: series_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.series_id_seq OWNED BY public.series_string.id;


--
-- Name: label_sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.label_sensor (
    mongo_id_label character varying(2044) NOT NULL,
    id_label_sensor integer DEFAULT nextval('public.series_id_seq'::regclass) NOT NULL,
    id_sensor integer NOT NULL
);


ALTER TABLE public.label_sensor OWNER TO postgres;

--
-- Name: sensors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensors (
    id_sensor integer DEFAULT nextval('public.series_id_seq'::regclass) NOT NULL,
    mongo_id_sensor character varying(2044) NOT NULL,
    type character varying(2044) NOT NULL
);


ALTER TABLE public.sensors OWNER TO postgres;

--
-- Name: series_number; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.series_number (
    id integer DEFAULT nextval('public.series_id_seq'::regclass) NOT NULL,
    "time" timestamp without time zone NOT NULL,
    value integer NOT NULL,
    id_sensor integer NOT NULL
);


ALTER TABLE public.series_number OWNER TO postgres;

--
-- Name: thing_sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.thing_sensor (
    mongo_id_thing character varying(2044) NOT NULL,
    id_thing_sensor integer DEFAULT nextval('public.series_id_seq'::regclass) NOT NULL,
    id_sensor integer NOT NULL
);


ALTER TABLE public.thing_sensor OWNER TO postgres;

--
-- Name: series_string id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_string ALTER COLUMN id SET DEFAULT nextval('public.series_id_seq'::regclass);


--
-- Data for Name: label_sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--


--
-- Name: series_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.series_id_seq', 28320, true);


--
-- Name: sensors sensors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT sensors_pkey PRIMARY KEY (id_sensor);


--
-- Name: series_number series-number_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_number
    ADD CONSTRAINT "series-number_pkey" PRIMARY KEY (id);


--
-- Name: series_string series_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_string
    ADD CONSTRAINT series_pkey PRIMARY KEY (id);


--
-- Name: thing_sensor thing-sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thing_sensor
    ADD CONSTRAINT "thing-sensor_pkey" PRIMARY KEY (id_thing_sensor);


--
-- Name: label_sensor unique_label_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label_sensor
    ADD CONSTRAINT unique_label_id PRIMARY KEY (id_label_sensor);


--
-- Name: sensors unique_sensors_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT unique_sensors_id UNIQUE (id_sensor);


--
-- Name: sensors unique_sensors_mongo_id_sensor; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensors
    ADD CONSTRAINT unique_sensors_mongo_id_sensor UNIQUE (mongo_id_sensor);


--
-- Name: label_sensor lnk_sensors_label-sensor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label_sensor
    ADD CONSTRAINT "lnk_sensors_label-sensor" FOREIGN KEY (id_sensor) REFERENCES public.sensors(id_sensor) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: series_number lnk_sensors_series-number; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_number
    ADD CONSTRAINT "lnk_sensors_series-number" FOREIGN KEY (id_sensor) REFERENCES public.sensors(id_sensor) MATCH FULL ON UPDATE CASCADE;


--
-- Name: series_string lnk_sensors_series-string; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.series_string
    ADD CONSTRAINT "lnk_sensors_series-string" FOREIGN KEY (id_sensor) REFERENCES public.sensors(id_sensor) MATCH FULL ON UPDATE CASCADE;


--
-- Name: thing_sensor lnk_sensors_thing-sensor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.thing_sensor
    ADD CONSTRAINT "lnk_sensors_thing-sensor" FOREIGN KEY (id_sensor) REFERENCES public.sensors(id_sensor) MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


CREATE OR REPLACE FUNCTION public."insert_value_string"(mongo_id_sensor character varying, in_time timestamp, in_value character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    _id_sensor integer;
    _id_ts integer;
BEGIN
    _id_sensor = exist_sensor(mongo_id_sensor, 'string');
    INSERT INTO series_string(id_sensor, "time", "value") VALUES (_id_sensor, in_time, in_value) RETURNING id INTO _id_ts;
    RETURN _id_ts;
END;
$function$;

CREATE OR REPLACE FUNCTION public."insert_value_number"(mongo_id_sensor character varying, in_time timestamp, in_value NUMERIC)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    _id_sensor integer;
    _id_ts integer;
BEGIN
    _id_sensor = exist_sensor(mongo_id_sensor, 'number');
    INSERT INTO series_number(id_sensor, "time", "value") VALUES (_id_sensor, in_time, in_value) RETURNING id INTO _id_ts;
    RETURN _id_ts;
END;
$function$;

CREATE OR REPLACE FUNCTION public."exist_sensor"(in_mongo_id_sensor character varying, in_type character varying)
 RETURNS integer
AS $function$
DECLARE
    _id_sensor integer;
BEGIN
    SELECT id_sensor INTO _id_sensor FROM sensors WHERE sensors.mongo_id_sensor = in_mongo_id_sensor AND sensors.type = in_type;
    IF NOT FOUND THEN
        INSERT INTO sensors(mongo_id_sensor, "type") VALUES (in_mongo_id_sensor, in_type) RETURNING id_sensor into _id_sensor;
    END IF;
    RETURN _id_sensor;
END;
$function$  LANGUAGE plpgsql;

--SELECT exist_sensor('test', 'number');
--SELECT insert_value_number('test'::VARCHAR, LOCALTIMESTAMP, 10.0);
SELECT insert_value_string('test3'::VARCHAR, LOCALTIMESTAMP, 'a string');
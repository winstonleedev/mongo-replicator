
CREATE OR REPLACE FUNCTION public."insertNumericValue"(inmongosensorid character varying, intime timestamp without time zone, invalue character varying, valuetype character varying)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    idSensor int;
    idInsert INT;
    tableName CHARACTER VARYING(15);
    insertStatement CHARACTER VARYING(200);
BEGIN
    SELECT sensors.idSensor INTO idSensor FROM sensors WHERE mongoIdSensor = inMongoSensorId;
    IF NOT FOUND THEN
      INSERT INTO "sensors" (mongoIdSensor, "type") VALUES (inMongoSensorId, valueType) RETURNING idSensor;
    END IF;
    tableName := ('series-' || valueType);
    insertStatement := 'INSERT INTO %I (idSensor, "time", "value") VALUES (idSensor, inTime, inValue) RETURNING id';
    EXECUTE format(insertStatement, tableName) INTO idInsert;
    RETURN idInsert;
END;
$function$
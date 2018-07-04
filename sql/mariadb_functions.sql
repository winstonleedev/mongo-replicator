CREATE OR REPLACE FUNCTION exist_sensor(in_mongo_id_sensor VARCHAR(200), in_is_number BIT)
RETURNS integer
BEGIN
    declare _id_sensor INTEGER;
    SELECT id_sensor INTO _id_sensor FROM sensors WHERE sensors.mongo_id_sensor = in_mongo_id_sensor AND sensors.is_number = in_is_number;
    IF (_id_sensor IS NULL) THEN
        INSERT INTO sensors(mongo_id_sensor, is_number) VALUES (in_mongo_id_sensor, in_is_number);
        SET _id_sensor = last_insert_id();
    END IF;
    RETURN _id_sensor;
END;

CREATE OR REPLACE FUNCTION insert_value_string(  `mongo_id_sensor` VarChar(200),  `in_time` Timestamp,  `in_value` VarChar(500) )
RETURNS Int
BEGIN
    declare _id_sensor INTEGER;
    SET _id_sensor = exist_sensor(mongo_id_sensor, 0);
    INSERT INTO series_string(id_sensor, `time`, `value`) VALUES (_id_sensor, in_time, in_value);
    RETURN last_insert_id();
END;

CREATE OR REPLACE FUNCTION insert_value_number(  `mongo_id_sensor` VarChar(200),  `in_time` Timestamp,  `in_value` VarChar(500) )
RETURNS Int
BEGIN
    declare _id_sensor INTEGER;
    SET _id_sensor = exist_sensor(mongo_id_sensor, 1);
    INSERT INTO series_number(id_sensor, `time`, `value`) VALUES (_id_sensor, in_time, in_value);
    RETURN last_insert_id();
END;

SELECT insert_value_string('test3', LOCALTIMESTAMP, 'a string');
SELECT insert_value_number('test4', LOCALTIMESTAMP, 999);

-- ALTER TABLE series_string MODIFY id int NOT NULL AUTO_INCREMENT;
-- ALTER TABLE series_number MODIFY id int NOT NULL AUTO_INCREMENT;

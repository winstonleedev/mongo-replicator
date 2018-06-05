#!/bin/bash
echo "Waiting for startup"
until ps -ax | grep mongo; do
  printf '.'
  sleep 1
done

echo ps -ax | grep mongo
echo "Started.."

sleep 10

echo SETUP.sh time now: `date +"%T" `
mongo --host mongo1:27017 <<EOF
   var cfg = {
        "_id": "rs",
        "version": 1,
        "members": [
            {
                "_id": 0,
                "host": "mongo1:27017",
                "priority": 2
            },
            {
                "_id": 1,
                "host": "mongo2:27017",
                "priority": 0
            },
            {
                "_id": 2,
                "host": "mongo3:27017",
                "priority": 0
            }
        ]
    };
    rs.initiate(cfg, { force: true });
    rs.reconfig(cfg, { force: true });
    db.getMongo().setReadPref('nearest');
EOF

tail -f /dev/null
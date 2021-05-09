```bash
rafael in bolsa on  feature/wallet [✘!?]
❯ docker-compose up postgre &
[1] 159036
rafael in bolsa on  feature/wallet [✘!?]
✦ ❯ Creating network "bolsa_bolsa-net" with driver "bridge"
Creating bolsa_postgre_1 ... done
Attaching to bolsa_postgre_1
postgre_1  |
postgre_1  | PostgreSQL Database directory appears to contain a database; Skipping initialization
postgre_1  |
postgre_1  | 2021-03-13 13:48:12.907 UTC [1] LOG:  starting PostgreSQL 13.2 (Debian 13.2-1.pgdg100+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 8.3.0-6) 8.3.0, 64-bit
postgre_1  | 2021-03-13 13:48:12.907 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
postgre_1  | 2021-03-13 13:48:12.907 UTC [1] LOG:  listening on IPv6 address "::", port 5432
postgre_1  | 2021-03-13 13:48:13.003 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
postgre_1  | 2021-03-13 13:48:13.091 UTC [30] LOG:  database system was shut down at 2021-03-13 13:47:24 UTC
postgre_1  | 2021-03-13 13:48:13.142 UTC [1] LOG:  database system is ready to accept connections

rafael in bolsa on  feature/wallet [✘!?]
✦ ❯ docker network ls
NETWORK ID          NAME                 DRIVER              SCOPE
ce519782ff7d        bolsa_bolsa-net      bridge              local
d126e80b5236        bolsa_rs_ws_env_nw   bridge              local
1513fb02c6fc        bridge               bridge              local
a68c578e5155        host                 host                local
1875f5b4b977        none                 null                local
rafael in bolsa on  feature/wallet [✘!?]
✦ ❯ docker inspect bolsa_bolsa-net
[
    {
        "Name": "bolsa_bolsa-net",
        "Id": "ce519782ff7de715fd2b0fdff0b741c644351189be8762569c9d09c760d7552d",
        "Created": "2021-03-13T10:48:09.143707256-03:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": null,
            "Config": [
                {
                    "Subnet": "172.25.0.0/16",
                    "Gateway": "172.25.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": true,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "2946e7b4dbfa8cb39dd585bcb79a4a001165b5d70d9d9bfc8a00cdf298235f52": {
                "Name": "bolsa_postgre_1",
                "EndpointID": "7388d0354e46ddedef6de664bd37d29822dcdd2faefe7c08a1450a8d4a450e01",
                "MacAddress": "02:42:ac:19:00:02",
                "IPv4Address": "172.25.0.2/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {
            "com.docker.compose.network": "bolsa-net",
            "com.docker.compose.project": "bolsa",
            "com.docker.compose.version": "1.27.4"
        }
    }
]
rafael in bolsa on  feature/wallet [✘!?]
✦ ❯ docker-compose run postgres bash
Creating bolsa_postgre_run ... done
root@5729f9d30410:/# psql -h bolsa_postgres_1 -U test -d test
Password for user test:
psql (13.2 (Debian 13.2-1.pgdg100+1))
Type "help" for help.

test=> select * from wallets;
 id | name | owner_id | created_on
----+------+----------+------------
(0 rows)

test=> select * from investors;
            id            |      name      |       created_on
--------------------------+----------------+------------------------
 1234567890acbdef12345678 | Rafael Arantes | 2021-03-13 10:45:05.06
(1 row)

test=> delete from investors;
DELETE 1
test=> select * from investors;
 id | name | created_on
----+------+------------
(0 rows)

test=> select * from positions;
 id | asset | wallet_id | created_on
----+-------+-----------+------------
(0 rows)

test=> select * from operations;
 id | date | quantity | value | position_id | created_on
----+------+----------+-------+-------------+------------
(0 rows)

test=> \q
root@5729f9d30410:/# exit
exit
rafael in bolsa on  feature/wallet [✘!?] took 3m 23s
✦ ❯ docker-compose down
Stopping bolsa_postgre_1 ...
postgre_1  | 2021-03-13 13:53:41.239 UTC [1] LOG:  received fast shutdown request
postgre_1  | 2021-03-13 13:53:41.293 UTC [1] LOG:  aborting any active transactions
postgre_1  | 2021-03-13 13:53:41.298 UTC [1] LOG:  background worker "logical replication launcher" (PID 36) exited with exit code 1
postgre_1  | 2021-03-13 13:53:41.298 UTC [31] LOG:  shutting down
Stopping bolsa_postgre_1 ... done
bolsa_postgre_1 exited with code 0
Removing bolsa_postgre_run_76e212930a96 ... done
Removing bolsa_postgre_1                ...
Removing bolsa_postgre_1                ... done
Removing network bolsa_bolsa-net
rafael in bolsa on  feature/wallet [✘!?] took 4s
❯
```

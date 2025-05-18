# nestjs-fundamentals

NestJS Fundamentals

To maintain PostgreSQL, follow this steps:

1. Install Podman Desktop
2. Go to Extensions > Compose Extension > Install
3. Run PowerShell commands in the current folder:

```PowerShell
podman machine start
podman compose up
```

Connect to PostgreSQL:

1. Install psql https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. Run command `psql -h localhost -p 5432 -U postgres -d postgres`

Show Table list `\dt`
Show Table details `\d coffee_flavors_flavor`
Show Table recordes `select * from coffee;`

# user-api
Queue Services API

## Get Started

- After clone the project
- Install dependency by running
```bash
npm install
```
- Run the app
```bash
npm run dev
```

## Running with docker
- make sure you already have `.env` file (can see the `.env.example` for some connection to docker services)

### Prerequisite
- Docker
- Docker compose
- Running docker-compose inside [user-api](https://github.com/BetterSocial/user-api) repository

### Whats in `docker-compose.yml`
- webhook (this repository running as webhook server)
- queue (this repository running as background service)
- connected to docker network `bettersocial-devnetwork`

### Commands
1. Start docker-compose
```bash
docker-compose up -d
```

2. getting into bash console
```bash
docker-compose run -it webhook bash
```

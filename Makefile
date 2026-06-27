.PHONY: \
	generate-env \
	setup-dev \
	docker-dev-up \
	docker-dev-down \
	docker-dev-stop \
	docker-dev-restart \
	docker-staging-up \
	docker-staging-down \
	docker-staging-stop \
	docker-staging-restart \
	docker-production-up \
	docker-production-down \
	docker-production-stop \
	docker-production-restart

generate-env:
	@test -f .env || cp .env.example .env

setup:
	pnpm install
	pnpm prisma generate

docker-dev-up:
	docker compose --env-file .env -f docker/docker.dev.yml up -d

docker-staging-up:
	docker compose --env-file .env -f docker/docker.staging.yml up -d

docker-production-up:
	docker compose --env-file .env -f docker/docker.production.yml up -d

docker-dev-down:
	docker compose --env-file .env -f docker/docker.dev.yml down -v

docker-staging-down:
	docker compose --env-file .env -f docker/docker.staging.yml down -v

docker-production-down:
	docker compose --env-file .env -f docker/docker.production.yml down -v

docker-dev-restart:
	docker compose --env-file .env -f docker/docker.dev.yml restart

docker-staging-restart:
	docker compose --env-file .env -f docker/docker.staging.yml restart

docker-production-restart:
	docker compose --env-file .env -f docker/docker.production.yml restart

docker-dev-stop:
	docker compose --env-file .env -f docker/docker.dev.yml stop

docker-staging-stop:
	docker compose --env-file .env -f docker/docker.staging.yml stop

docker-production-stop:
	docker compose --env-file .env -f docker/docker.production.yml stop

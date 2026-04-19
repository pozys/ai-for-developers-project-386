.PHONY: \
	install \
	serve \
	db-migrate db-fixtures \
	lint lint-backend lint-frontend \
	format format-backend format-frontend \
	test test-backend test-frontend test-e2e test-coverage \
	e2e e2e-ui e2e-report \
	dev build

# ─── Backend ────────────────────────────────────────────────────────────────

install:
	cd backend && composer install

serve:
	cd backend && composer serve

db-migrate:
	cd backend && composer db:migrate

db-fixtures:
	cd backend && composer db:fixtures

lint:
	$(MAKE) lint-backend
	$(MAKE) lint-frontend

lint-backend:
	cd backend && composer lint

lint-frontend:
	cd frontend && npm run lint:ci

format:
	$(MAKE) format-backend
	$(MAKE) format-frontend

format-backend:
	cd backend && composer cs:fix

format-frontend:
	cd frontend && npm run format

test:
	$(MAKE) test-backend

test-backend:
	cd backend && composer test

test-frontend:
	cd frontend && npm run test:unit

test-e2e:
	cd frontend && npm run test:e2e

test-coverage:
	cd backend && composer coverage

# ─── Frontend ───────────────────────────────────────────────────────────────

dev:
	cd frontend && npm run dev

build:
	cd frontend && npm run build

e2e:
	$(MAKE) test-e2e

e2e-ui:
	cd frontend && npx playwright test --ui

e2e-report:
	cd frontend && npx playwright show-report

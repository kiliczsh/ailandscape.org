.PHONY: dev build format lint fix validate

dev:
	npm run dev

build:
	npm run build

format:
	npm run format

lint:
	npm run lint

fix:
	npx biome check --write

validate:
	npx tsx scripts/validate.ts

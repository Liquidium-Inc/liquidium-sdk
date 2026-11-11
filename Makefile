.PHONY: build dev test lint typecheck clean

build:
	bun run build

dev:
	bun run dev

test:
	bun run test

lint:
	bun run lint

typecheck:
	bun run typecheck

clean:
	bun run clean

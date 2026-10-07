# Makefile for soroban-indexer
build:
	cargo build
	npm --prefix api run build

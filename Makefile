DENO_VERSION := v1.18.2
LUME_VERSION := v1.5.1
TAILWINDCSS_CLI_VERSION := v3.0.23
SHELL := $(shell which bash)
TMP := _tmp
BIN := _bin

build: ${BIN}/deno ${BIN}/tailwindcss
	PATH="${BIN}:${PATH}" deno run --import-map='import_map.json' -A 'https://deno.land/x/lume@${LUME_VERSION}/ci.ts' -- --import-map='import_map.json'

serve: ${BIN}/deno ${BIN}/tailwindcss
	PATH="${BIN}:${PATH}" deno run --import-map='import_map.json' -A 'https://deno.land/x/lume@${LUME_VERSION}/ci.ts' --serve --dev -- --import-map='import_map.json'

ifeq ($(shell uname),Linux)
${BIN}/deno:
	[[ -d "${TMP}" ]] || mkdir "${TMP}"
	[[ -d "${BIN}" ]] || mkdir "${BIN}"
	rm -rf "${TMP}"/*
	cd "${TMP}"
	jar -xvf <(curl -sL 'https://github.com/denoland/deno/releases/download/${DENO_VERSION}/deno-x86_64-unknown-linux-gnu.zip')
	mv deno "${BIN}"
	chmod +x "${BIN}/deno"

${BIN}/tailwindcss:
	curl -sL 'https://github.com/tailwindlabs/tailwindcss/releases/download/${TAILWINDCSS_CLI_VERSION}/tailwindcss-linux-x64' >"${BIN}/tailwindcss"
	chmod +x "${BIN}/tailwindcss"
endif

ifeq ($(shell uname),Darwin)
${BIN}/deno:
	[[ -d "${TMP}" ]] || mkdir "${TMP}"
	[[ -d "${BIN}" ]] || mkdir "${BIN}"
	rm -rf "${TMP}"/*
	cd "${TMP}"
	jar -xvf <(curl -sL 'https://github.com/denoland/deno/releases/download/${DENO_VERSION}/deno-x86_64-apple-darwin.zip')
	mv deno "${BIN}"
	chmod +x "${BIN}/deno"

${BIN}/tailwindcss:
	curl -sL 'https://github.com/tailwindlabs/tailwindcss/releases/download/${TAILWINDCSS_CLI_VERSION}/tailwindcss-macos-x64' >"${BIN}/tailwindcss"
	chmod +x "${BIN}/tailwindcss"
endif

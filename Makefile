DENO_VERSION := v1.18.2
LUME_VERSION := v1.5.1
SASS_VERSION := 1.49.7
SHELL := $(shell which bash)
TMP := _tmp
BIN := _bin

build: ${BIN}/sass ${BIN}/deno
	PATH="${BIN}:${PATH}" deno run --import-map='import_map.json' -A 'https://deno.land/x/lume@${LUME_VERSION}/ci.ts' -- --import-map='import_map.json'

serve: ${BIN}/sass ${BIN}/deno
	PATH="${BIN}:${PATH}" deno run --import-map='import_map.json' -A 'https://deno.land/x/lume@${LUME_VERSION}/ci.ts' --serve -- --import-map='import_map.json'

ifeq ($(shell uname),Linux)
${BIN}/sass:
	[[ -d "${TMP}" ]] || mkdir "${TMP}"
	[[ -d "${BIN}" ]] || mkdir "${BIN}"
	rm -rf "${TMP}"/*
	cd "${TMP}"
	tar -zxvf <(curl -sL 'https://github.com/sass/dart-sass/releases/download/${SASS_VERSION}/dart-sass-${SASS_VERSION}-linux-x64.tar.gz')
	mv dart-sass/* "${BIN}"
	chmod +x "${BIN}/sass"
${BIN}/deno:
	[[ -d "${TMP}" ]] || mkdir "${TMP}"
	[[ -d "${BIN}" ]] || mkdir "${BIN}"
	rm -rf "${TMP}"/*
	cd "${TMP}"
	jar -xvf <(curl -sL 'https://github.com/denoland/deno/releases/download/${DENO_VERSION}/deno-x86_64-unknown-linux-gnu.zip')
	mv deno "${BIN}"
	chmod +x "${BIN}/deno"
endif

ifeq ($(shell uname),Darwin)
${BIN}/sass:
	[[ -d "${TMP}" ]] || mkdir "${TMP}"
	[[ -d "${BIN}" ]] || mkdir "${BIN}"
	cd "${TMP}"
	rm -rf "${BIN}"/*
	tar -xvf <(curl -sL 'https://github.com/sass/dart-sass/releases/download/${SASS_VERSION}/dart-sass-${SASS_VERSION}-macos-x64.tar.gz')
	mv dart-sass/* "${BIN}"
	chmod +x "${BIN}/sass"
${BIN}/deno:
	[[ -d "${TMP}" ]] || mkdir "${TMP}"
	[[ -d "${BIN}" ]] || mkdir "${BIN}"
	rm -rf "${TMP}"/*
	cd "${TMP}"
	jar -xvf <(curl -sL 'https://github.com/denoland/deno/releases/download/${DENO_VERSION}/deno-x86_64-apple-darwin.zip')
	mv deno "${BIN}"
	chmod +x "${BIN}/deno"
endif

SHELL := /usr/bin/env bash

SOURCE_DIR := src/extension
RUNTIME_FILE_NAMES := \
	metadata.json \
	extension.js \
	stylesheet.css \
	constants.js \
	utils.js \
	elgatoClient.js \
	avahiDiscovery.js \
	keyLightIndicator.js
EXTENSION_FILES := $(addprefix $(SOURCE_DIR)/,$(RUNTIME_FILE_NAMES))
DIST_DIR := dist

UUID := $(shell python3 -c "import json;print(json.load(open('$(SOURCE_DIR)/metadata.json'))['uuid'])")
VERSION := $(shell python3 -c "import json;print(json.load(open('$(SOURCE_DIR)/metadata.json'))['version'])")
ARCHIVE := $(DIST_DIR)/$(UUID).v$(VERSION).zip
TARGET_DIR := $(HOME)/.local/share/gnome-shell/extensions/$(UUID)

.PHONY: help validate install-local build clean

help:
	@echo "Available targets:"
	@echo "  make validate      - Validate metadata and runtime files"
	@echo "  make install-local - Install extension into ~/.local/share/gnome-shell/extensions"
	@echo "  make build         - Build release zip in dist/"
	@echo "  make clean         - Remove generated zip archives"

validate:
	@python3 -c "import json,sys; m=json.load(open('$(SOURCE_DIR)/metadata.json')); required=['uuid','name','description','version','shell-version']; missing=[k for k in required if k not in m]; \
assert not missing, f'$(SOURCE_DIR)/metadata.json missing keys: {missing}'; \
assert isinstance(m['version'], int) and m['version'] > 0, 'metadata version must be positive integer'; \
assert isinstance(m['shell-version'], list) and len(m['shell-version']) > 0, 'metadata shell-version must be a non-empty list'; \
print(f\"metadata OK (uuid={m['uuid']}, version={m['version']})\")"
	@echo "Required runtime files check..."
	@for file in $(EXTENSION_FILES); do \
		if [[ ! -s "$$file" ]]; then \
			echo "$$file missing or empty" >&2; \
			exit 1; \
		fi; \
	done
	@echo "Validation passed."

install-local: validate
	@mkdir -p "$(TARGET_DIR)"
	@for file in $(EXTENSION_FILES); do cp "$$file" "$(TARGET_DIR)/$$(basename "$$file")"; done
	@echo "Installed to $(TARGET_DIR)"
	@echo "Now restart GNOME Shell and run:"
	@echo "  gnome-extensions enable $(UUID)"

build: validate
	@mkdir -p "$(DIST_DIR)"
	@tmp_dir="$$(mktemp -d)"; \
	trap 'rm -rf "$$tmp_dir"' EXIT; \
	stage_dir="$$tmp_dir/$(UUID)"; \
	mkdir -p "$$stage_dir"; \
	for file in $(EXTENSION_FILES); do cp "$$file" "$$stage_dir/$$(basename "$$file")"; done; \
	(cd "$$tmp_dir" && zip -rq "$(CURDIR)/$(ARCHIVE)" "$(UUID)"); \
	echo "Created $(ARCHIVE)"

clean:
	@rm -f "$(DIST_DIR)"/*.zip
	@echo "Removed generated zip archives."

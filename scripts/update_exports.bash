#!/usr/bin/env bash

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

export_path() {
	local path
	path="$1"

	local base
	base=$(basename "$path" ".ts")

	echo "./$base"
}

update_deno_exports() {
	local key
	key="$1"
	local value
	value="$2"
	jq --arg k "$key" --arg v "$value" '.exports.[$k] = $v' "$script_dir/../deno.json"
}

main() {
	local path
	path="$1"

	local export_path
	export_path=$(export_path "$path")

	local updated
	updated=$(update_deno_exports "$export_path" "$path")

	echo "$updated" >"$script_dir/../deno.json"
}

main "$@"

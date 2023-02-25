#!/usr/bin/env bash
# shellcheck disable=SC2155
set -uo pipefail

readonly DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

function package_zip () {
  (
  cd "$1" || exit
  zip -rX "$2" html icons js LICENSE.txt manifest.json -x '**/.*' -x '**/__MACOSX'
  )
}

# Update manifest version number from package.json
"$DIR/update-manifest-version.js"

# Package Chrome webstore release
package_zip "$DIR/../extension" "$DIR/../chrome-webstore-release.zip"

# Package Firefox webstore release
cp -Tr "$DIR/../extension" "$DIR/../extension-firefox"
"$DIR/update-manifest-firefox.js"
package_zip "$DIR/../extension-firefox" "$DIR/../firefox-webstore-release.zip"
#rm -r "$DIR/../extension-firefox"

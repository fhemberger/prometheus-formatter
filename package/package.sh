#!/usr/bin/env bash
set -uo pipefail

readonly DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

function package_zip () {
  cd "$1" && zip -r "$2" html icons js LICENSE.txt manifest.json -x icons/.DS_Store js/.DS_Store .DS_Store
}

# Update manifest version number from package.json
"$DIR/update-manifest-version.js"

# Package Chrome webstore release
package_zip "$DIR/../extension" "$DIR/../chrome-webstore-release.zip"

# Package Firefox webstore release
cp -r "$DIR/../extension" "$DIR/../extension-firefox"
"$DIR/update-manifest-firefox.js"
package_zip "$DIR/../extension-firefox" "$DIR/../firefox-webstore-release.zip"
#rm -r "$DIR/../extension-firefox"

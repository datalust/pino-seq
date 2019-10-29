if ($env:APPVEYOR_REPO_BRANCH -ne 'master') { exit } 
        
$ErrorActionPreference = "SilentlyContinue"

echo "//registry.npmjs.org/:_authToken=$env:NPM_TOKEN`n" | out-file "./.npmrc" -Encoding ASCII

npm publish 2>&1

trap { "Error: $_" }

$LastExitCode = 0

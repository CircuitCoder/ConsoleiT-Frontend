#!/bin/sh

set -e
echo "Deploying to $DEPLOY_DEST..."

chmod -R 755 ./dist

eval "$(ssh-agent -s)"
chmod 600 .travis/deploy_key
ssh-add .travis/deploy_key
rsync -r dist/* $DEPLOY_DEST

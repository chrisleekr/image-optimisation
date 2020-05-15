#!/bin/bash

GIT_CI_EMAIL=${GIT_CI_EMAIL:-"git@chrislee.kr"}
GIT_CI_NAME=${GIT_CI_NAME:-"Chris Lee (bot)"}

GIT_CI_USERNAME=${GIT_CI_USERNAME:-}
GIT_CI_PASSWORD=${GIT_CI_PASSWORD:-}

GIT_REPO_DOMAIN=${GIT_REPO_DOMAIN:-}

echo $GIT_CI_EMAIL
echo $GIT_CI_NAME
npm version patch -m "Update version to %s [skip ci]"
git push https://$GIT_CI_USERNAME:$GIT_CI_PASSWORD@$GIT_REPO_DOMAIN/chrisleekr/nodejs-image-optimisation.git HEAD:$GITHUB_REF

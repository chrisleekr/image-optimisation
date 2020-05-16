#!/bin/bash

set -x
set -e

BASEDIR=$(dirname "$0")

#API_HOST=https://image-optimisation.chrislee.kr
API_HOST=http://localhost:3001

curl -X POST -F "image=@$BASEDIR/sample1.jpg" $API_HOST/image -o $BASEDIR/sample1-output.jpg

curl -X POST "url=https://raw.githubusercontent.com/chrisleekr/nodejs-image-optimisation/master/examples/sample1.jpg" $API_HOST/image -o $BASEDIR/sample1-url-output.jpg

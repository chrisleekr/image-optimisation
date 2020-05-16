#!/bin/bash


curl -v -X POST -F "image=@sample1.jpg" https://image-optimisation.chrislee.kr/image -o sample1-output.jpg

#curl -v -X POST -F "image=@sample1.jpg" http://localhost:3001/image -o sample1-output.jpg

# Image Optimisation Service

[![Build](https://github.com/chrisleekr/image-optimisation/workflows/main/badge.svg)](https://github.com/chrisleekr/image-optimisation/actions?query=workflow%3Amain) [![CodeCov](https://codecov.io/gh/chrisleekr/image-optimisation/branch/master/graph/badge.svg)](https://codecov.io/gh/chrisleekr/image-optimisation) [![MIT License](https://img.shields.io/github/license/chrisleekr/image-optimisation)](https://github.com/chrisleekr/image-optimisation/blob/master/LICENSE)

This is a practice project. The project contains Node.js API that optimise images - jpg, png, svg, and gif.

- Node.js, Express, Webpack, Imagemin

## Demo

### Post local image to optimise

```bash
$ curl -v -X POST -F "image=@sample1.jpg" https://image-optimisation.chrislee.kr/image -o sample1-output.jpg
```

### Pass remote image URL to optimise

```bash
$ curl -v -X POST "url=https://raw.githubusercontent.com/chrisleekr/image-optimisation/master/examples/sample1.jpg" https://image-optimisation.chrislee.kr/image -o sample1-url-output.jpg
```

## How to start in your local environment

```bash
$ docker-compose up -d
```

Once docker containers are up, then you can access services with below URL.

| Service | Endpoint                                       |
| ------- | ---------------------------------------------- |
| API     | [http://localhost:3001](http://localhost:3001) |

### API

API docker container will be launched as development mode with nodemon. However, it won't detect any changes unless uncomment volumes.

To enable live change for the API, simply uncomment following lines in `docker-compose.yml`

```text
  volumes:
    - ./:/srv
```

Please make sure you run `npm install`.

### Routes

- POST `/image`
  - Fields:
    - `image`: image file
    - `url`: remote image URL

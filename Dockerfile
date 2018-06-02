FROM golang:1.8

MAINTAINER Jesus Trujillo <elyeyus@gmail.com>

WORKDIR /app

COPY bin/md380-webtools-linux-amd64 md380-webtools
COPY dist dist

EXPOSE 8080

CMD ["./md380-webtools"]

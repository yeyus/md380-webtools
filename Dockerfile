FROM ubuntu:16.04

MAINTAINER Jesus Trujillo <elyeyus@gmail.com>

RUN apt-get update && apt-get install --no-install-recommends -y \
    build-essential \
    ca-certificates \
    curl \
    mercurial \
    git-core

RUN curl -sL https://redirector.gvt1.com/edgedl/go/go1.9.2.linux-amd64.tar.gz | tar -v -C /usr/local -xz

ENV GOPATH /go
ENV GOROOT /usr/local/go
ENV PATH /usr/local/go/bin:/go/bin:/usr/local/bin:$PATH

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash - && \
  apt-get install -y nodejs

ADD . /app

RUN cd /app && npm install && go build main.go

EXPOSE 8080

WORKDIR /app

CMD ["/app/main"]
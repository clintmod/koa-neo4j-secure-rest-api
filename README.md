# koa-neo4j-secure-rest-api

This app is a rest api for [neo4j](https://neo4j.com) based on [koa.js](http://koajs.com/) and [node.js](https://nodejs.org/en/).

## Motivation

The neo4j database ships with it's own rest api that's integrated with the database server. It doesn't provide a way to horizontally scale the load on the api across multiple severs.

## Setup

This README assumes you're using yarn and Mac OS. You can substitute other commands where appropriate.

* Install homebrew  - `/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
* Install neo4j - `brew install neo4j`
* Install node.js - `brew install node`
* Clone the git repo - `git clone https://github.com/clintmod/koa-neo4j-secure-rest-api.git`
* Install `yarn` with `brew install yarn`
* Then run `cd koa-neo4j-secure-rest-api && yarn` to install dependencies.

At this point you should be able to:

* Run the app with `yarn dev`
* Use the [curl commands](#testing-the-api-with-curl) below to test the api

You can run the tests with `yarn test`

## Adapting the API

* Start the server with nodemon: `yarn local`
* Start the tests in watch mode: `yarn test-mocha-watch`
* Hack away

## Testing the api with curl

* use `curl` to login with that user and get a token:

```bash
curl -X POST -H "Content-Type: application/json" --data '{"username":"admin", "password":"admin"}' http://localhost:9000/login
```

* use `curl` to access the secured `api/v1` routes with the token you received in the login step

```bash
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer INSERT_TOKEN_HERE" http://localhost:9000/api/v1/nodes
```

* use `curl` with an admin token to create a new user:

```bash
curl -X POST -H "Authorization: Bearer INSERT_TOKEN_HERE" -H "Content-Type: application/json" --data '{"username":"thedude", "password":"abides", "email":"thedude@slacker.com", "name":"Mr. Lebowski"}' http://localhost:9000/admin/user/create
```

## Notes

You'll notice in the `package.json` I'm using a [forked version](https://github.com/clintmod/jwt/tree/v3.2.3-beta) of `koa-jwt`. This is because currently, there's no "documented" way to know when a token expires. I've [opened an issue](https://github.com/koajs/jwt/issues/107) and [sent a pull request](https://github.com/koajs/jwt/pull/108) with what I think is an appropriate fix. When the pull request gets merged and released I'll update the demo with the new version of koa-jwt.

I also hash the password using bcrypt because you should _always_ hash your passwords.

If you want to create or delete a user you'll need to use the built in `admin` user or create a new user with the `role:"admin"`.
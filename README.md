# redux-superapi

[![Build Status](https://travis-ci.org/kayak/redux-superapi.png?branch=master)](https://travis-ci.org/kayak/redux-superapi)
[![Coverage Status](https://coveralls.io/repos/github/kayak/redux-superapi/badge.svg?branch=master)](https://coveralls.io/github/kayak/redux-superapi?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/5cd791c56f4240728fdb6987c8397072)](https://www.codacy.com/app/remiremi/redux-superapi?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=kayak/redux-superapi&amp;utm_campaign=Badge_Grade)
[![David](https://img.shields.io/david/kayak/redux-superapi.svg)](https://david-dm.org/kayak/redux-superapi)
[![David](https://img.shields.io/david/dev/kayak/redux-superapi.svg)](https://david-dm.org/kayak/redux-superapi)

`redux-superapi` generates actions and reducers for communicating with a REST backend. Its API is inspired from
[redux-api](https://github.com/lexich/redux-api), and it uses [axios](https://github.com/mzabriskie/axios) for making
the actual AJAX calls. Its goal is short, extensible and highly-readable code.

## Installation

`npm install --save redux-superapi`

## Documentation

### Setup

```
var superApi = new SuperApi(endPointsConfig, defaultRequestConfig = {})
```

Create a new SuperApi configuration.

* `endPointsConfig` (required): map unique endpoint names to an object with:
    * `url` (required): url of the endpoint
    * `defaultRequestConfig`: default configuration passed on to axios, extending the configuration passed to the `SuperApi`
constructor.
* `defaultRequestConfig` (optional): pass a default request configuration that will be passed on to
[axios](https://github.com/mzabriskie/axios) on every request.

Next, create a store with the SuperApi reducers.

```
createStore(combineReducers(superApi.reducers));
```

### Usage

Dispatch any of the following actions:

```
superApi.endpointName.get(args, requestConfig = {});
superApi.endpointName.delete(args, requestConfig = {});
superApi.endpointName.head(args, requestConfig = {});
superApi.endpointName.options(args, requestConfig = {});
superApi.endpointName.post(args, data, requestConfig = {});
superApi.endpointName.put(args, data, requestConfig = {});
superApi.endpointName.patch(args, data, requestConfig = {});
```

* `args` (required): dictionary mapping of arguments that need to be replaced in the URL.
* `data` (required, only for post, put, patch): data to be passed to the server
* `requestConfig`: configuration object passed on to axios. Extends the configuration set at the API/Endpoint levels.

## Development

Pull requests and issue reports are welcome.

Build:

`npm run build`

Test:

`npm run test`

Lint:

`npm run lint`

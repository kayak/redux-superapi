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
    * `requestKey` (optional): function that returns a unique identifier of the request. See
      [making multiple requests for an endpoint](#making-multiple-requests-for-an-endpoint)
    * `defaultRequestConfig` (optional): default configuration passed on to axios, extending the configuration passed to the `SuperApi`
constructor.
* `defaultRequestConfig` (optional): pass a default request configuration that will be passed on to
[axios](https://github.com/mzabriskie/axios) on every request.

Sample endpoint configuration:

```
const endpoints = {
    experiments: {
        url: "/api/experiments/"
    },
    experimentDetails: {
        url: "/api/experiments/:experimentId/",
    },
};
```

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

Example: `dispatch(superApi.experimentDetails.get({experimentId: 42}))`

### State

The default state is:

```
{
    [endpointName]: {
        sync: false,
        syncing: false,
        loaded: false,
        data: {},
        error: null
    }
}
```

### Handling error

State's `error` property will be axios' error message for malformed requests, or the data returned
by the end point if the request went through but returned a response with an error status code.

### Cancelling requests

Dispatching `superApi.endpointName.reset()` will not only reset the state, it will also cancel any request that was
started. `reset()` will also be called before starting a new request if another request is still in progress for that
endpoint.

### Making multiple requests for an endpoint

By default, you can only do one request at a time per endpoint. Doing another request will reset the state. In some
situations you actually want to be able to do multiple requests and store their state separately.

This is possible by defining the `requestKey` endpoint option. `requestKey` should be a deterministic function that
takes as sole argument a dictionary of the `args` for the request and returns a string (or anything that can be cast to
string).

```
const endpoints = {
    experimentDetails: {
        url: "/api/experiments/:experimentId/",
        requestKey: (args) => args.experimentId
    },
};
```

The state will then look like

```
{
    [endpointName]: {
       [experimentId]: {
           ...
       }
    }
```

For cancelling a request simply pass the `args` to `reset`:

```
superApi.endpointName.reset({experimentId: 42})
```

## Development

Pull requests and issue reports are welcome.

Build:

`npm run build`

Test:

`npm run test`

Lint:

`npm run lint`

## License

Copyright 2016 KAYAK Germany, GmbH

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

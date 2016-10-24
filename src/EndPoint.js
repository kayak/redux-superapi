import axios from "axios";

let CancelToken = axios.CancelToken;

class EndPoint {
    constructor(name, {url, requestKey, defaultRequestConfig}) {
        this.name = name;
        this.url = url;
        this.defaultRequestConfig = defaultRequestConfig || {};
        this.isMultiRequest = !!requestKey;
        this.requestKey = requestKey || (() => 'default');
        this.cancellation = {};

        // Construct the methods for http methods that don't need data
        ['delete', 'get', 'head', 'options'].forEach((method) => {
            this[method] = (args, config = {}) => (dispatch) => this.request(dispatch, method, args, config);
        });

        // Construct the methods for http methods that do need data
        ['post', 'put', 'patch'].forEach((method) => {
            this[method] = (args, data, config = {}) => (dispatch) => this.request(dispatch, method, args, config, data);
        });
    }

    cancel(args) {
        let cancellation = this.cancellation[this.requestKey(args)];
        cancellation && cancellation.cancel();
    }

    createCancellation(args) {
        let cancellation = CancelToken.source();
        this.cancellation[this.requestKey(args)] = cancellation;
        return cancellation;
    }

    transformUrl(args = {}) {
        let url = this.url;
        // Replace all :arg with the actual value
        Object.keys(args).forEach((key) => {
            let argRe = new RegExp(':' + key + '(?=[^\w]|$)');
            url = url.replace(argRe, args[key]);
        });
        // Remove remaining arguments not present in args
        url = url.replace(/:[\w]+(?=[^\w]|$)/, '');
        // Remove double slashes
        url = url.replace(/\/+/g, '/');
        return url;
    }

    actionPrefix() {
        return '@@super-api@' + this.name + '_';
    }

    isValidActionType(actionType) {
        return actionType && actionType.startsWith(this.actionPrefix());
    }

    actionType(action) {
        return this.actionPrefix() + action;
    }

    actionSuccess(response, args) {
        return {
            type: this.actionType('success'),
            data: response.data,
            status: response.status,
            args
        };
    }

    actionError(error, args) {
        if (error.response) {
            // Server responded with an error
            return {
                type: this.actionType('error'),
                error: error.response.data,
                status: error.response.status,
                args
            };
        } else {
            // Request was malformed
            return {
                type: this.actionType('error'),
                error: error.message,
                args
            };
        }
    }

    actionRequest(method, args) {
        return {
            type: this.actionType('request'),
            method,
            args
        };
    }

    actionReset(args) {
        return {
            type: this.actionType('reset'),
            args
        };
    }

    reset(args) {
        return dispatch => {
            this.cancel(args);
            dispatch(this.actionReset(args))
        };
    }

    getOnce(args, config = {}) {
        // Will fetch data only if it hasn't been fetched and hasn't started fetching.
        return (dispatch, getState) => {
            return this.requestOnce(dispatch, getState, 'get', args, config)
        }
    }

    requestOnce(dispatch, getState, method, args, config, data = undefined) {
        // Start the request only if there is no data already loaded or loading
        let key = this.requestKey(args);
        if (this.cancellation[key]) {
            // A request is already ongoing
            return Promise.resolve();
        }
        let state = getState();
        if (this.isMultiRequest && state[key] && state[key].sync) {
            // There is no pending request but data has already been loaded
            return Promise.resolve();
        }
        if (!this.isMultiRequest && state.sync) {
            // There is no pending request but data has already been loaded
            return Promise.resolve();
        }

        return this.request(dispatch, method, args, config, data);
    }

    request(dispatch, method, args, config, data = undefined) {
        // Cancel any pending request
        this.cancel(args);

        dispatch(this.actionRequest(method, args));

        return axios.request({
            url: this.transformUrl(args),
            method: method,
            data: data,
            cancelToken: this.createCancellation(args).token,
            ...this.defaultRequestConfig[method],
            ...config
        })
            .catch(error => {
                // First handle "operational errors", where the request did not complete as expected.
                dispatch(this.actionError(error, args));
                throw error; // rethrow error for chaining
            })
            .then(response => {
                // The .then handler happens after handling errors from the server ("operational errors") so that we
                // don't accidentally catch "programmers error".
                // See http://www.2ality.com/2016/03/promise-rejections-vs-exceptions.html
                dispatch(this.actionSuccess(response, args));
            });
    }

    reduce(state, action) {
        if (this.isMultiRequest) {
            return this.reduceMultiRequest(state, action)
        } else {
            return this.reduceRequest(state, action);
        }
    }

    reduceMultiRequest(state, action) {
        if (typeof state === 'undefined') {
            state = {};
        }

        if (!this.isValidActionType(action.type)) {
            // Don't try to reduce an action coming from a different endpoint.
            return state;
        } else {
            let key = this.requestKey(action.args);

            return {
                ...state,
                [key]: this.reduceRequest(state[key], action)
            };
        }
    }

    reduceRequest(state, action) {
        const defaultState = {
            loading: false,
            sync: false,
            syncing: false,
            data: {},
            error: null
        };

        if (typeof state === 'undefined') {
            state = defaultState;
        }

        switch (action.type) {
            case this.actionType('request'):
                return {
                    ...state,
                    loading: true,
                    sync: false,
                    syncing: true,
                    error: null
                };
            case this.actionType('success'):
                return {
                    ...state,
                    loading: false,
                    sync: true,
                    syncing: false,
                    data: action.data,
                    error: null
                };
            case this.actionType('error'):
                return {
                    ...state,
                    loading: false,
                    sync: false,
                    syncing: false,
                    error: action.error
                };
            case this.actionType('reset'):
                return defaultState;
            default:
                return state;
        }
    }
}


EndPoint.axios = axios; // used for mocking in unit-tests


export default EndPoint;
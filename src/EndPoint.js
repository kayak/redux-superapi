import axios from "axios";


class EndPoint {
    constructor(name, {url, defaultRequestConfig}) {
        this.name = name;
        this.url = url;
        this.defaultRequestConfig = defaultRequestConfig || {};

        // Construct the methods for http methods that don't need data
        ['delete', 'get', 'head', 'options'].forEach((method) => {
            this[method] = (args, config = {}) => (dispatch) => this.request(dispatch, method, args, config);
        });

        // Construct the methods for http methods that do need data
        ['post', 'put', 'patch'].forEach((method) => {
            this[method] = (args, data, config = {}) => (dispatch) => this.request(dispatch, method, args, config, data);
        });
    }

    transformUrl(args = {}) {
        let url = this.url;
        // Replace all :arg with the actual value
        Object.keys(args).forEach((key) => {
            let argRe = new RegExp(':' + key + '(?=[^\w])');
            url = url.replace(argRe, args[key]);
        });
        // Remove remaining arguments not present in args
        url = url.replace(/:[\w]+(?=[^\w])/, '');
        // Remove double slashes
        url = url.replace(/\/+/g, '/');
        return url;
    }

    actionType(action) {
        return '@@super-api@' + this.name + '_' + action;
    }

    actionSuccess(response) {
        return {
            type: this.actionType('success'),
            data: response.data,
            status: response.status
        };
    }

    actionError(error) {
        if (error.response) {
            // Server responded with an error
            return {
                type: this.actionType('error'),
                error: error.response.data,
                status: error.response.status
            };
        } else {
            // Request was malformed
            return {
                type: this.actionType('error'),
                error: error.message
            };
        }
    }

    actionRequest(method) {
        return {
            type: this.actionType('request'),
            method
        };
    }

    actionReset() {
        return {
            type: this.actionType('reset')
        };
    }

    reset() {
        return dispatch => dispatch(this.actionReset());
    }

    request(dispatch, method, args, config, data = undefined) {
        dispatch(this.actionRequest(method));
        return axios.request({
            url: this.transformUrl(args),
            method: method,
            data: data,
            ...this.defaultRequestConfig[method],
            ...config
        })
            .then(response => dispatch(this.actionSuccess(response)))
            .catch(error => dispatch(this.actionError(error)));
    }

    reduce(state, action) {
        const defaultState = {
            loading: false,
            sync: false,
            syncing: false,
            data: {},
            error: null
        };

        if (typeof state === 'undefined') {
            return defaultState;
        }

        switch (action.type) {
            case this.actionType('request'):
                return {
                    ...state,
                    loading: true,
                    sync: false,
                    syncing: true,
                    data: {},
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
                    data: {},
                    error: action.error
                };
            case this.actionType('reset'):
                return defaultState;
            default:
                return state;
        }
    }
}


export default EndPoint;
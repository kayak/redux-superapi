import EndPoint from "./EndPoint";


class SuperApi {
    constructor(endPointsConfig, defaultRequestConfig = {}) {
        this.reducers = {};

        Object.keys(endPointsConfig).forEach((key) => {
            let endPoint = new EndPoint(key, {defaultRequestConfig, ...endPointsConfig[key]});
            this[key] = endPoint;
            this.reducers[key] = endPoint.reduce.bind(endPoint);
        });
    }
}

SuperApi.Endpoint = EndPoint;

export default SuperApi;

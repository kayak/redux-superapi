import {expect} from "chai";
import chai from "chai";
import chaiSubset from "chai-subset";
import EndPoint from "../src/EndPoint";

chai.use(chaiSubset);

describe('EndPoint', () => {

    it('has all http methods', () => {
        const endPoint = new EndPoint('test', {url: '/api/buckets/'});
        expect(endPoint).to.contain.all.keys(['delete', 'get', 'head', 'options', 'post', 'put', 'patch']);
    });

    describe('.transformUrl()', () => {
        it('can do nothing', function () {
            const endPoint = new EndPoint('test', {url: '/api/buckets/'});
            expect(endPoint.transformUrl()).to.equal('/api/buckets/')
        });

        it('can replace an argument', function () {
            const endPoint = new EndPoint('test', {url: '/api/buckets/:bucketId/'});
            expect(endPoint.transformUrl({bucketId: 42})).to.equal('/api/buckets/42/')
        });

        it('removes unspecified arguments', function () {
            const endPoint = new EndPoint('test', {url: '/api/buckets/:bucketId/'});
            expect(endPoint.transformUrl()).to.equal('/api/buckets/')
        });
    });


    describe('.reduce()', () => {
        const endPoint = new EndPoint('test', {url: '/api/buckets/'});

        it('transitions flags on request', function () {
            const oldState = {
                loading: false,
                syncing: false,
                sync: false
            };
            const action = endPoint.actionRequest('get');

            expect(endPoint.reduce(oldState, action)).to.containSubset({
                loading: true,
                syncing: true,
                sync: false
            });
        });

        it('transitions flags on success', function () {
            const oldState = {
                loading: true,
                syncing: true,
                sync: false
            };
            const action = endPoint.actionSuccess({});

            expect(endPoint.reduce(oldState, action)).to.containSubset({
                loading: false,
                syncing: false,
                sync: true,
            });
        });

        it('sets data on success', function () {
            const data = {sample: true};
            const oldState = {data: {}};
            const action = endPoint.actionSuccess(({data}));

            expect(endPoint.reduce(oldState, action).data).to.deep.equal(data);
        });
    });

});

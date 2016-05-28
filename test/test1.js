/**
 * Created by Administrator on 2016/2/5.
 */
import chai from 'chai';
import apiMiddleware from '../apiMiddleware';
import {API_MW_SYMBOL} from '../apiMiddleware';
import 'isomorphic-fetch'

import { Schema, arrayOf, normalize } from 'normalizr';

var fetchMock = require('fetch-mock');


describe('api middleware', () => {
    const doDispatch = () => {};
    const doGetState = () => {};
    const nextHandler = apiMiddleware({dispatch: doDispatch, getState: doGetState});

    it('must return a function to handle next', () => {
        chai.assert.isFunction(nextHandler);
        chai.assert.strictEqual(nextHandler.length, 1);
    });

    describe('handle next', () => {
        it('must return a function to handle action', () => {
            const actionHandler = nextHandler();

            chai.assert.isFunction(actionHandler);
            chai.assert.strictEqual(actionHandler.length, 1);
        });

        it('must execute next if no API_MW_SYMBOL attribute in action', (done) =>{
            const expected = 'YouRent';

            const actionHandler = nextHandler(action => {
                chai.assert.strictEqual(action, expected);
                done();
            });

            actionHandler(expected);
        });

        const REQUEST_TYPE = "REQUEST_TYPE";
        const SUCCESS_TYPE = "SUCCESS_TYPE";
        const FAILED_TYPE = "FAIL_TYPE";

        var legalAction = {
            [API_MW_SYMBOL]: {
                endpoint: null,
                types: [REQUEST_TYPE, SUCCESS_TYPE, FAILED_TYPE],
                schema: null,
                init: null
            }
        }
        it('endpoint must be a string or a function', (done) => {
            const actionHandler = nextHandler();

            try {
                actionHandler(legalAction)
            }
            catch(err) {
                done();
            }
        });

        it('test fetch-mock', (done) => {
            const expected = 'YouRent';
            fetchMock.mock(
                'http://1.com/a', {
                    name: expected
                }
            );

            fetch('http://1.com/a').then(
                    response => {
                    // console.log(response.ok);
                    chai.assert(response.ok);
                    response.json().then(
                            json => {
                            //       console.log(json);
                            chai.assert.equal(json.name, expected);
                            done();
                        },
                            err=> {
                            console.log(err);
                        }
                    )},
                    error => {
                    console.log(error);
                }
            )
            fetchMock.restore();
        });

        it('test api result 1', done => {
            fetchMock.mock("http://1.com/a", {
                total: 100,
                list:
                    [
                        {
                            id: 1,
                            name: 'xc'
                        },
                        {
                            id: 2,
                            name: 'cg'
                        }
                    ]
            });

            const actionHandler = nextHandler(
                action => {
                    if(action.type == SUCCESS_TYPE) {
                        chai.assert.equal(action.response.result.total, 100);
                        chai.assert.typeOf(action.response.entities, 'object');
                        chai.expect(action.response.entities).to.have.property('users').to.have.property('1').to.have.property('name').to.equal('xc');
                        done();
                    }
                }
            );

            legalAction[API_MW_SYMBOL].endpoint = "http://1.com/a";
            const userSchema = new Schema('users');
            const resultSchema = new Schema("result");
            resultSchema.define({
                list: arrayOf(userSchema)
            });
            legalAction[API_MW_SYMBOL].schema = {
                list: arrayOf(userSchema)
            };

            try {
                actionHandler(legalAction);
            }
            catch(err) {
                console.log(err);
            }

            fetchMock.restore();
        })

    })

})

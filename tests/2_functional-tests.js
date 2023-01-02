const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');
const { valid, invalid_chars, none81, cannotBeSolved } = require('../controllers/puzzle-strings');

chai.use(chaiHttp);

suite('Functional Tests', () => {

    const solutionKey = ['solution'];
    const errorKey = ['error'];

    /* Error messages for POST request to /api/solve */
    const not81E = 'Expected puzzle to be 81 characters long';
    const charsE = 'Invalid characters in puzzle';
    const noSutionE = 'Puzzle cannot be solved';
    const noPuzzleE = 'Required field missing';

    /* Error messages for POST request to /api/check */
    const missingFieldsE = "Required field(s) missing";
    const valueE = "Invalid value";
    const coordinateE = "Invalid coordinate";

    /* keys of result */
    const successKey = ['valid'];
    const failKey = ['valid', 'conflict'];


    suite('route tests: POST request to /api/solve',
        function () {
            suite('#13 Solve a puzzle with valid puzzle string',
                function () {
                    for (let sample of valid) {
                        test(sample[0], function (done) {
                            chai.request(server)
                                .post('/api/solve')
                                .send({ puzzle: sample[0] })
                                .end((err, res) => {
                                    assert.equal(res.status, 200)
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, solutionKey);
                                    assert.isString(res.body.solution);
                                    assert.equal(res.body.solution.length, 81);
                                    assert.equal(res.body.solution, sample[1]);
                                    done();
                                });
                        });
                    }
                });

            suite('#14 Solve a puzzle with missing puzzle string',
                function () {
                    test('#14.0 Solve a puzzle with missing puzzle string',
                        function (done) {
                            chai.request(server)
                                .post('/api/solve')
                                .send({ puzzle: '' })
                                .end((err, res) => {
                                    assert.equal(res.status, 200)
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, errorKey);
                                    assert.equal(res.body.error, noPuzzleE);
                                    done();
                                });
                        });

                    test('#14.1 Solve a puzzle with missing puzzle string',
                        function (done) {
                            chai.request(server)
                                .post('/api/solve')
                                .end((err, res) => {
                                    assert.equal(res.status, 200)
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, errorKey);
                                    assert.equal(res.body.error, noPuzzleE);
                                    done();
                                });
                        });
                });

            suite('#15 Solve a puzzle with invalid characters',
                function () {
                    for (let sample of invalid_chars) {
                        test(sample, function (done) {
                            chai.request(server)
                                .post('/api/solve')
                                .send({ puzzle: sample })
                                .end((err, res) => {
                                    assert.equal(res.status, 200)
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, errorKey);
                                    assert.equal(res.body.error, charsE);
                                    done();
                                });
                        });
                    }
                });

            suite('#16 Solve a puzzle with incorrect length',
                function () {
                    for (let sample of none81) {
                        test(sample, function (done) {
                            chai.request(server)
                                .post('/api/solve')
                                .send({ puzzle: sample })
                                .end((err, res) => {
                                    assert.equal(res.status, 200)
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, errorKey);
                                    assert.equal(res.body.error, not81E);
                                    done();
                                });
                        });
                    }
                });

            suite('#17 Solve a puzzle that cannot be solved',
                function () {
                    for (let sample of cannotBeSolved) {
                        test(sample, function (done) {
                            chai.request(server)
                                .post('/api/solve')
                                .send({ puzzle: sample })
                                .end((err, res) => {
                                    assert.equal(res.status, 200)
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, errorKey);
                                    assert.equal(res.body.error, noSutionE);
                                    done();
                                });
                        })
                    }
                });
        });
    suite('route test: POST request to /api/check',
        function () {

            suite('#18 Check a puzzle placement with all fields',
                function () {
                    test('A4 = 7 on valid.0.0', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[0][0],
                                coordinate: 'A4',
                                value: '7'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, successKey);
                                assert.isTrue(res.body.valid);
                                done();
                            });
                    });
                    test('E3 = 2 on valid.3.0', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[3][0],
                                coordinate: 'E3',
                                value: '2'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, successKey);
                                assert.isTrue(res.body.valid);
                                done();
                            });
                    });
                });

            suite('#19 Check a puzzle placement with single placement conflict',
                function () {
                    test('G9 = 2 on valid.1.0', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[1][0],
                                coordinate: 'G9',
                                value: '2'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, failKey);
                                assert.isFalse(res.body.valid);
                                assert.deepEqual(res.body.conflict, ['row']);
                                done();
                            });
                    });


                    test('C6 = 9 on valid.2.0', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[2][0],
                                coordinate: 'C6',
                                value: '9'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, failKey);
                                assert.isFalse(res.body.valid);
                                assert.deepEqual(res.body.conflict, ['region']);
                                done();
                            });
                    });

                    test('A1 = 6 on valid.2.0', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[2][0],
                                coordinate: 'A1',
                                value: '6'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, failKey);
                                assert.isFalse(res.body.valid);
                                assert.deepEqual(res.body.conflict, ['column']);
                                done();
                            });
                    });
                });

            suite('#20 Check a puzzle placement with multiple placement conflicts',
                function () {
                    test('I3 = 9 on valid.4.0', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[4][0],
                                coordinate: 'I3',
                                value: '9'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, failKey);
                                assert.isFalse(res.body.valid);
                                assert.deepEqual(res.body.conflict, ['column', 'region']);
                                done();
                            });
                    });
                });

            suite('#21 Check a puzzle placement with all placement conflicts',
                function () {
                    test('B6 = 1 on valid.4.0', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[4][0],
                                coordinate: 'B1',
                                value: '1'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, failKey);
                                assert.isFalse(res.body.valid);
                                assert.deepEqual(res.body.conflict, ["row", "column", "region"]);
                                done();
                            });
                    });
                });

            suite('#22 Check a puzzle placement with missing required fields',
                function () {
                    test('No puzzle', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                coordinate: 'I3',
                                value: '9'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, errorKey);
                                assert.equal(res.body.error, missingFieldsE);
                                done();
                            });
                    });

                    test('No puzzle and value', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                coordinate: 'I3'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, errorKey);
                                assert.equal(res.body.error, missingFieldsE);
                                done();
                            });
                    });

                    test('No puzzle, coordinate, and value', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, errorKey);
                                assert.equal(res.body.error, missingFieldsE);
                                done();
                            });
                    });

                    test('With body but empty puzzle, coordinate, and value', function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: '',
                                coordinate: '',
                                value: ''
                            })
                            .end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, errorKey);
                                assert.equal(res.body.error, missingFieldsE);
                                done();
                            });
                    });
                });

            suite('#23 Check a puzzle placement with invalid characters',
                function () {
                    for (let sample of invalid_chars) {
                        test(sample, function (done) {
                            chai.request(server)
                                .post('/api/check')
                                .send({
                                    puzzle: sample,
                                    coordinate: 'A1',
                                    value: '1'
                                }).end((err, res) => {
                                    assert.equal(res.status, 200);
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, errorKey);
                                    assert.equal(res.body.error, charsE);
                                    done();
                                });
                        });
                    }
                });

            suite('#24 Check a puzzle placement with incorrect length',
                function () {
                    for (let sample of none81) {
                        test(sample, function (done) {
                            chai.request(server)
                                .post('/api/check')
                                .send({
                                    puzzle: sample,
                                    coordinate: 'A1',
                                    value: '1'
                                }).end((err, res) => {
                                    assert.equal(res.status, 200);
                                    assert.isObject(res.body);
                                    assert.hasAllKeys(res.body, errorKey);
                                    assert.equal(res.body.error, not81E);
                                    done();
                                });
                        });
                    }

                });

            suite('#25 Check a puzzle placement with invalid placement coordinate',
                function () {
                    test(valid[0][0], function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[0][0],
                                coordinate: 'Z18',
                                value: '1'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, errorKey);
                                assert.equal(res.body.error, coordinateE);
                                done();
                            });
                    });
                });

            suite('#26 Check a puzzle placement with invalid placement value',
                function () {
                    test(valid[0][0], function (done) {
                        chai.request(server)
                            .post('/api/check')
                            .send({
                                puzzle: valid[0][0],
                                coordinate: 'A1',
                                value: '10'
                            }).end((err, res) => {
                                assert.equal(res.status, 200);
                                assert.isObject(res.body);
                                assert.hasAllKeys(res.body, errorKey);
                                assert.equal(res.body.error, valueE);
                                done();
                            });
                    });
                });
        });

});


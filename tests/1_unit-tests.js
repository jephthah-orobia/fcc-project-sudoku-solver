require('dotenv').config();
const chai = require('chai');
const assert = chai.assert;

const { setDebugging, log, logEr, logPropsOf } = require('../log-utils');
const Solver = require('../controllers/sudoku-solver.js');
const { valid, invalid_chars, none81 } = require('../controllers/puzzle-strings');

setDebugging(process.env.DEBUG == 'yes');

suite('Unit Tests', () => {
    let solver = new Solver();
    suite('Test validate method', function () {
        test('#1 validite puzzle strings of 81 characters',
            function (done) {
                for (let sample of valid)
                    assert.isTrue(solver.validate(sample[0]));
                done();
            });

        test('#2 validite puzzle strings with some invalid characters.',
            function (done) {
                for (let sample of invalid_chars)
                    assert.isFalse(solver.validate(sample));
                done();
            });

        test('#3 validite puzzle strings that is not 81 characters long',
            function (done) {
                for (let sample of none81)
                    assert.isFalse(solver.validate(sample));
                done();
            });
    });

    suite('Test checkRowPlacement method',
        function () {
            test('#4 check a valid row placement.', function (done) {
                for (let sample of valid)
                    for (let i in sample)
                        assert.isTrue(solver.checkRowPlacement(sample[0], Math.floor(i / 9) + 1, (i % 9) + 1, sample[1][i]));
                done();
            });

            test('#5 check an invalid row placement', function (done) {
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 1, 5, 2));
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 3, 7, 5));
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 9, 6, 7));
                done();
            })
        });

    suite('Test checkColPlacement method',
        function () {
            test('#6 check a valid column placement.', function (done) {
                for (let sample of valid)
                    for (let i in sample)
                        assert.isTrue(solver.checkColPlacement(sample[0], Math.floor(i / 9) + 1, (i % 9) + 1, sample[1][i]));
                done();
            });

            test('#7 check an invalid column placement', function (done) {
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 1, 5, 3));
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 3, 7, 3));
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 9, 6, 8));
                done();
            })
        });

    suite('Test checkRegionPlacement method',
        function () {
            test('#8 check a valid region placement.', function (done) {
                for (let sample of valid)
                    for (let i in sample)
                        assert.isTrue(solver.checkRegionPlacement(sample[0], Math.floor(i / 9) + 1, (i % 9) + 1, sample[1][i]));
                done();
            });

            test('#9 check an invalid region placement', function (done) {
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 1, 5, 5));
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 3, 7, 4));
                assert.isFalse(solver.checkRowPlacement(valid[0][0], 9, 6, 6));
                done();
            })
        });

    suite('Test solve method',
        function () {
            test('#10 valid puzzle string pass the solver.', function (done) {
                for (let sample of valid)
                    assert.doesNotThrow(() => solver.solve(sample[0]));
                done();
            });

            test('#11 invalid puzzle strings fail the solver', function (done) {
                for (let sample of [...invalid_chars, ...none81])
                    assert.Throw(() => solver.solve(sample));
                done();
            });

            test('#12 Solver returns the expected solution for an incomplete puzzle', function (done) {
                for (let sample of valid)
                    assert.equal(solver.solve(sample[0]), sample[1]);
                done();
            });
        });

});

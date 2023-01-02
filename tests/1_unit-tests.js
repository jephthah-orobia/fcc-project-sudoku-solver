require('dotenv').config();
const chai = require('chai');
const assert = chai.assert;

const { setDebugging, log, logEr, logPropsOf } = require('../log-utils');
const Solver = require('../controllers/sudoku-solver.js');
const { valid, invalid_chars, none81, cannotBeSolved } = require('../controllers/puzzle-strings');

const logTest = process.env.LOG_TEST == 'yes';
setDebugging(logTest);

const isLocal = process.env.NODE_ENV == 'local';


suite('Unit Tests', () => {
    let solver = new Solver();
    if (isLocal) {

        suite('Test toRowCol Method', function () {
            test('valid index', function (done) {
                assert.deepEqual(solver.toRowCol(0), [0, 0]);
                assert.deepEqual(solver.toRowCol(65), [7, 2]);
                assert.deepEqual(solver.toRowCol(42), [4, 6]);
                done();
            });
            test('invalid index', function (done) {
                assert.throws(() => solver.toRowCol('A3'));
                assert.throws(() => solver.toRowCol(null));
                assert.throws(() => solver.toRowCol(-3));
                assert.throws(() => solver.toRowCol(81));
                done();
            });
        });

        suite('Test toIndex Method', function () {
            test('Test valid row col', function (done) {
                assert.equal(solver.toIndex(0, 0), 0);
                assert.equal(solver.toIndex(7, 2), 65);
                assert.equal(solver.toIndex(4, 6), 42);
                done();
            });

            test('Test invalid row col', function (done) {
                assert.throws(() => solver.toIndex('A3', 'A3'));
                assert.throws(() => solver.toIndex(null, null));
                assert.throws(() => solver.toIndex(-1, -3));
                assert.throws(() => solver.toIndex(-4, 9));
                assert.throws(() => solver.toIndex(9, 10));
                assert.throws(() => solver.toIndex(8, -1));
                done();
            });
        });


        suite('Test fromCoorToRC Method', function () {
            test('Test valid inputs', function (done) {
                assert.deepEqual(solver.fromCoordToRC('A1'), [0, 0]);
                assert.deepEqual(solver.fromCoordToRC('A2'), [0, 1]);
                assert.deepEqual(solver.fromCoordToRC('C2'), [2, 1]);
                assert.deepEqual(solver.fromCoordToRC('D7'), [3, 6]);
                assert.deepEqual(solver.fromCoordToRC('I4'), [8, 3]);
                done();
            });
            test('Test invalid inputs', function (done) {
                assert.throws(() => solver.fromCoordToRC('A12'), 'Invalid coordinate');
                assert.throws(() => solver.fromCoordToRC('Z3'), 'Invalid coordinate');
                assert.throws(() => solver.fromCoordToRC('V14'), 'Invalid coordinate');
                assert.throws(() => solver.fromCoordToRC('sdfag'), 'Invalid coordinate');
                done();
            })
        });

        suite('Test toCoordinate Method', function () {
            test('Test valid inputs', function (done) {
                assert.equal(solver.toCoordinate(0), 'A1');
                assert.equal(solver.toCoordinate(65), 'H3');
                assert.equal(solver.toCoordinate(42), 'E7');
                assert.equal(solver.toCoordinate(...solver.toRowCol(0)), 'A1');
                assert.equal(solver.toCoordinate(...solver.toRowCol(65)), 'H3');
                assert.equal(solver.toCoordinate(...solver.toRowCol(42)), 'E7');
                assert.equal(solver.toCoordinate(0, 0), 'A1');
                assert.equal(solver.toCoordinate(7, 2), 'H3');
                assert.equal(solver.toCoordinate(4, 6), 'E7');
                done();
            });
            test('Test invalid inputs', function (done) {
                assert.throws(() => solver.toCoordinate(-1, -3));
                assert.throws(() => solver.toCoordinate(-4, 9));
                assert.throws(() => solver.toCoordinate(9, 10));
                assert.throws(() => solver.toCoordinate(8, -1));
                assert.throws(() => solver.toCoordinate('A3'));
                assert.throws(() => solver.toCoordinate(null));
                assert.throws(() => solver.toCoordinate(-3));
                assert.throws(() => solver.toCoordinate(81));
                done();
            });
        });
        suite('Test validate method', function () {
            test('#1 validite a puzzle string of 81 characters',
                function (done) {
                    for (let sample of valid) {
                        assert.isTrue(solver.validate(sample[0]), "expected " + sample[0] + ' to be true');
                    }
                    for (let sample of cannotBeSolved) {
                        assert.isFalse(solver.validate(sample), "expected " + sample + ' to be FALSE');
                    }
                    done();
                });

            test('#2 validite a puzzle string with invalid characters (not 1-9 or .)',
                function (done) {
                    for (let sample of invalid_chars) {
                        assert.throws(() => solver.validate(sample), "Invalid characters in puzzle");
                    }
                    done();
                });

            test('#3 validite puzzle strings that is not 81 characters long',
                function (done) {
                    for (let sample of none81) {
                        assert.throws(() => solver.validate(sample), 'Expected puzzle to be 81 characters long');
                    }
                    done();
                });
        });

        suite('Test checkRowPlacement method',
            function () {
                test('#4 check a valid row placement.', function (done) {
                    for (let sample of valid) {
                        for (let i in sample[0]) {
                            const [row, col] = solver.toRowCol(parseInt(i));
                            assert.isTrue(
                                solver.checkRowPlacement(sample[0],
                                    row,
                                    col,
                                    sample[1][i]
                                ), 'expected ' + sample[1][i] + ' in ' + 'ABCDEFGHI'[row] + (col + 1).toString() + ' of ' + sample[0] + ' to be valid');
                        }
                    }
                    done();
                });

                test('#5 check an invalid row placement', function (done) {
                    assert.isFalse(solver.checkRowPlacement(valid[0][0], 0, 4, '5'));
                    if (isLocal) {
                        assert.isFalse(solver.checkRowPlacement(valid[0][0], 0, 4, '2'));
                        assert.isFalse(solver.checkRowPlacement(valid[0][0], 2, 6, '5'));
                        assert.isFalse(solver.checkRowPlacement(valid[0][0], 8, 5, '7'));
                    }
                    done();
                })

            });

        suite('Test checkColPlacement method',
            function () {
                test('#6 check valid column placement', function (done) {
                    for (let sample of valid) {
                        for (let i in sample[0]) {
                            const [row, col] = solver.toRowCol(parseInt(i));
                            assert.isTrue(
                                solver.checkColPlacement(sample[0],
                                    row,
                                    col,
                                    sample[1][i]
                                ), 'expected ' + sample[1][i] + ' in ' + 'ABCDEFGHI'[row] + (col + 1).toString() + ' of ' + sample[0] + ' to be valid');
                        }
                    }
                    done();
                });


                test('#7 check an invalid column placement', function (done) {
                    assert.isFalse(solver.checkColPlacement(valid[0][0], 0, 4, '5'));
                    if (!isLocal) return done();
                    assert.isFalse(solver.checkColPlacement(valid[0][0], 0, 4, '3'));
                    assert.isFalse(solver.checkColPlacement(valid[0][0], 2, 6, '3'));
                    assert.isFalse(solver.checkColPlacement(valid[0][0], 8, 5, '8'));
                    done();
                })
            });

        suite('Test checkRegionPlacement method',
            function () {
                test('#8 check a valid region placement.', function (done) {
                    for (let sample of valid) {
                        for (let i in sample[0]) {
                            const [row, col] = solver.toRowCol(parseInt(i));
                            assert.isTrue(
                                solver.checkRegionPlacement(sample[0],
                                    row,
                                    col,
                                    sample[1][i]
                                ), 'expected ' + sample[1][i] + ' in ' + 'ABCDEFGHI'[row] + (col + 1).toString() + ' of ' + sample[0] + ' to be valid');
                        }
                    }
                    done();
                });

                test('#9 check an invalid region placement', function (done) {
                    assert.isFalse(solver.checkRegionPlacement(valid[0][0], 0, 4, '5'));
                    if (!isLocal) return done();
                    assert.isFalse(solver.checkRegionPlacement(valid[0][0], 2, 6, '4'));
                    assert.isFalse(solver.checkRegionPlacement(valid[0][0], 8, 5, '6'));
                    done();
                })
            });

        suite('Test solve method',
            function () {
                test('#10 valid puzzle string pass the solver.', function (done) {
                    for (let sample of valid) {
                        assert.doesNotThrow(() => solver.solve(sample[0]),
                            sample[0] + ' is solvable');
                    }
                    done();
                });

                test('#11 invalid puzzle strings fail the solver', function (done) {
                    for (let sample of [...invalid_chars, ...none81, ...cannotBeSolved]) {
                        assert.Throw(() => solver.solve(sample));
                    }
                    done();
                });

                test('#12 Solver returns the expected solution for an incomplete puzzle', function (done) {
                    for (let sample of valid) {
                        assert.doesNotThrow(() => solver.solve(sample[0]),
                            sample[0] + ' is solvable');
                        assert.equal(solver.solve(sample[0]), sample[1]);
                    }
                    done();
                });
            });
    } else {
        test('#1 validite a puzzle string of 81 characters',
            function (done) {
                assert.isTrue(solver.validate(valid[0][0]), "expected " + valid[0][0] + ' to be true');
                assert.isFalse(solver.validate(cannotBeSolved[0]), "expected " + cannotBeSolved[0] + ' to be FALSE');
                done();
            });

        test('#2 validite a puzzle string with invalid characters (not 1-9 or .)',
            function (done) {
                assert.throws(() => solver.validate(invalid_chars[0]), "Invalid characters in puzzle");
                done();
            });

        test('#3 validite puzzle strings that is not 81 characters long',
            function (done) {
                assert.throws(() => solver.validate(none81), 'Expected puzzle to be 81 characters long');
                done();
            });
        test('#4 check a valid row placement.', function (done) {
            assert.isTrue(solver.checkRowPlacement(valid[1][0], 6, 8, '4'));
            done();
        });

        test('#5 check an invalid row placement', function (done) {
            assert.isFalse(solver.checkRowPlacement(valid[0][0], 0, 4, '5'));
            done();
        })

        test('#6 check valid column placement', function (done) {
            assert.isTrue(solver.checkColPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
                0, 4, '7'));
            done();
        });


        test('#7 check an invalid column placement', function (done) {
            assert.isFalse(solver.checkColPlacement(valid[0][0], 0, 4, '5'));
            done();
        });

        test('#8 check a valid region placement.', function (done) {
            assert.isTrue(solver.checkRegionPlacement('..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..',
                4, 4, '5'));
            done();
        });

        test('#9 check an invalid region placement', function (done) {
            assert.isFalse(solver.checkRegionPlacement(valid[0][0], 0, 4, '5'));
            done();
        });

        test('#10 valid puzzle string pass the solver.', function (done) {
            assert.doesNotThrow(() => solver.solve(valid[0][0]),
                valid[0][0] + ' is solvable');
            done();
        });

        test('#11 invalid puzzle strings fail the solver', function (done) {
            assert.Throw(() => solver.solve(cannotBeSolved[0]));
            done();
        });

        test('#12 Solver returns the expected solution for an incomplete puzzle', function (done) {
            assert.equal(solver.solve(valid[0][0]), valid[0][1]);
            done();
        });
    }
});

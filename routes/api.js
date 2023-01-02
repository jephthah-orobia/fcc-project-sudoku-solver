'use strict';
require('dotenv').config();

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {

  let solver = new SudokuSolver();

  const noSutionE = 'Puzzle cannot be solved';

  const noPuzzleE = 'Required field missing';

  const missingFieldsE = "Required field(s) missing";


  app.route('/api/check')
    .post((req, res) => {
      const puzzle = req.body?.puzzle,
        coordinate = req.body?.coordinate,
        value = req.body?.value;

      if (!puzzle || !coordinate || !value)
        res.json({ error: missingFieldsE });
      else {
        try {
          const conflict = [];
          const [r, c] = solver.fromCoordToRC(coordinate);
          !solver.checkRowPlacement(puzzle, r, c, value) && conflict.push('row');
          !solver.checkColNoValidation(puzzle, r, c, value) && conflict.push('column');
          !solver.checkRegionNoValidation(puzzle, r, c, value) && conflict.push('region');

          if (conflict.length > 0)
            res.json({ valid: false, conflict })
          else
            res.json({ valid: true });
        } catch (e) {
          res.json({ error: e });
        }
      }
    });

  app.route('/api/solve')
    .post((req, res) => {
      const puzzle = req.body?.puzzle?.valueOf();
      if (!puzzle || puzzle == '')
        res.json({ error: noPuzzleE });
      else {
        try {
          res.json({ solution: solver.solve(req.body.puzzle) });
        } catch (e) {
          res.json({ error: e });
        }
      }
    });
};
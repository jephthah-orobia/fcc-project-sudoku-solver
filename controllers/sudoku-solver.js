const validROW = 'ABCDEFGHI',
  validCOL = '123456789';
class SudokuSolver {
  /**
   * Convert an index into [row,col]
   * @param {Number} index index in puzzleString (an integer from 0 to 81)
   * @returns {[Number, Number]} the zero-based row and column
   */
  toRowCol(index) {
    if (Number.isInteger(index) && index >= 0 && index < 81)
      return [Math.floor(index / 9), (index % 9)];
    throw Error("invalid index");
  }

  /**
   * 
   * @param {Number} row 0-9
   * @param {Number} col 0-9
   * @returns the index in puzzlestring. (0-80)
   */
  toIndex(row, col) {
    // check if row and cols are integers between 0 to 8
    if (Number.isInteger(row) && row >= 0 && row < 9
      && Number.isInteger(col) && col >= 0 && col < 9) {
      return row * 9 + col;
    }
    throw new Error("invalid row X col");
  };

  fromCoordToRC(coord) {
    if (!coord || coord.length != 2 || !validROW.includes(coord[0]) || !validCOL.includes(coord[1]))
      throw "Invalid coordinate";
    return [validROW.indexOf(coord[0]), validCOL.indexOf(coord[1])];
  };
  /**
   * 
   * @param {Number} row index or could be the row if col is defined
   * @param {Number | undefined} col 
   * @returns a string that represents the coordinate in 'A4' style.
   */
  toCoordinate(a = null, b = null) {
    if (a != null && b == null) {
      const [row, col] = this.toRowCol(a);
      return validROW[row] + validCOL[col];
    } else if (a != null && b != null && Number.isInteger(a) && a >= 0 && a < 9
      && Number.isInteger(b) && b >= 0 && b < 9)
      return validROW[a] + validCOL[b];
    if (a == null && b != null) throw Error("invalid row");
    if (a == null && b == null) throw Error("invalid index");
    throw Error('invalid row column');
  }

  validateString(str) {
    if (str.length != 81)
      throw 'Expected puzzle to be 81 characters long';
    for (let i = 0; i < 81; i++)
      if (!'.123456789'.includes(str[i]))
        throw 'Invalid characters in puzzle';
    return true;
  }

  validate(puzzleString) {
    if (this.validateString(puzzleString)) {
      for (let i = 0; i < 81; i++)
        if (puzzleString[i] !== '.') {
          const [r, c] = this.toRowCol(i);
          if (!(this.checkRowNoValidation(puzzleString, r, c, puzzleString[i])
            && this.checkColNoValidation(puzzleString, r, c, puzzleString[i])
            && this.checkRegionNoValidation(puzzleString, r, c, puzzleString[i])))
            return false;
        }
      return true;
    }
    else
      return false;
  }

  noDuplicateIn(puzzleString, row, column, value, sieve) {
    const index = this.toIndex(row, column);
    // if the position on the puzzleString is not vacant and value is not in that position.
    //if (puzzleString[index] != '.' && puzzleString[index] != value)
    //  return false;

    // acquire the all elements that the `value` will be check against.
    let toInspect = puzzleString.split('')
      .filter((e, i) => e != '.' && i != index && sieve(i));

    for (let other of toInspect) {
      if (other == value)
        return false;
    }

    return true;
  }

  validateRowCol(n) {
    if (!Number.isInteger(n) || n < 0 || n > 8)
      throw 'Invalid coordinate';
    return true;
  }

  validateValue(c) {
    if (!'123456789'.includes(c))
      throw 'Invalid value';
    return true;
  }

  validateCheckArguments(str, r, c, v) {
    return this.validateString(str)
      && this.validateValue(v)
      && this.validateRowCol(r) && this.validateRowCol(c);
  }

  checkRowPlacement(puzzleString, row, column, value) {
    return this.validateCheckArguments(puzzleString, row, column, value)
      && this.checkRowNoValidation(puzzleString, row, column, value);
  }

  checkRowNoValidation(puzzleString, row, column, value) {
    return this.noDuplicateIn(puzzleString, row, column, value,
      (i) => this.toRowCol(i)[0] == row);
  }

  checkColPlacement(puzzleString, row, column, value) {
    return this.validateCheckArguments(puzzleString, row, column, value)
      && this.checkColNoValidation(puzzleString, row, column, value);
  }

  checkColNoValidation(puzzleString, row, column, value) {
    return this.noDuplicateIn(puzzleString, row, column, value,
      (i) => this.toRowCol(i)[1] == column);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    return this.validateCheckArguments(puzzleString, row, column, value)
      && this.checkRegionNoValidation(puzzleString, row, column, value);
  }

  checkRegionNoValidation(puzzleString, row, column, value) {
    const r0 = Math.floor(row / 3) * 3,
      rf = r0 + 3,
      c0 = Math.floor(column / 3) * 3,
      cf = c0 + 3;
    return this.noDuplicateIn(puzzleString, row, column, value,
      (i) => {
        const [r, c] = this.toRowCol(i);
        return r >= r0 && r < rf && c >= c0 && c < cf;
      }
    );
  }

  solve(puzzleString) {
    if (!this.validate(puzzleString))
      throw "Puzzle cannot be solved";

    const solveNoValidation = (toSolve) => {
      const chars = toSolve.split('');
      for (let i = 0; i < 81; i++) {
        if (chars[i] == '.') {
          const [row, col] = this.toRowCol(i),
            candidates = [];
          for (let c = 1; c < 10; c++) {
            if (this.checkRowNoValidation(toSolve, row, col, c.toString())
              && this.checkColNoValidation(toSolve, row, col, c.toString())
              && this.checkRegionNoValidation(toSolve, row, col, c.toString()))
              candidates.push(c.toString())
            if (candidates.length > 1)
              break;
          }
          if (candidates.length == 1)
            chars[i] = candidates[0];
        }
      }
      const newPuzzleString = chars.join('');
      if (!/\./.test(newPuzzleString))
        return newPuzzleString;
      if (toSolve === newPuzzleString)
        throw "Puzzle cannot be solved";
      return solveNoValidation(newPuzzleString);
    }

    if (!/\./.test(puzzleString))
      return puzzleString;
    return solveNoValidation(puzzleString);
  }
}

module.exports = SudokuSolver;


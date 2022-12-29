const puzzleStrings = require("./puzzle-strings");

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

  /**
   * 
   * @param {Number} row index or could be the row if col is defined
   * @param {Number | undefined} col 
   * @returns a string that represents the coordinate in 'A4' style.
   */
  toCoordinate(a = null, b = null) {
    if (a != null && b == null) {
      const [row, col] = this.toRowCol(a);
      return 'ABCDEFGHI'[row] + (col + 1).toString();
    } else if (a != null && b != null && Number.isInteger(a) && a >= 0 && a < 9
      && Number.isInteger(b) && b >= 0 && b < 9)
      return 'ABCDEFGHI'[a] + (b + 1).toString();
    if (a == null && b != null) throw Error("invalid row");
    if (a == null && b == null) throw Error("invalid index");
    throw Error('invalid row column');
  }

  validate(puzzleString) {
    for (let i = 0; i < 81; i++)
      if (puzzleString[i] !== '.') {
        const [r, c] = this.toRowCol(i);
        if (!(this.checkRowPlacement(puzzleString, r, c, puzzleString[i])
          && this.checkColPlacement(puzzleString, r, c, puzzleString[i])
          && this.checkRegionPlacement(puzzleString, r, c, puzzleString[i])))
          return false;
      }
    return true;
  }


  noDuplicateIn(puzzleString, row, column, value, sieve) {
    if (puzzleString.length != 81)
      throw 'Expected puzzle to be 81 characters long';
    for (let i = 0; i < 81; i++)
      if (!'.123456789'.includes(puzzleString[i]))
        throw 'Invalid characters in puzzle';
    if (!Number.isInteger(row) || row < 0 || row > 8)
      throw 'Invalid coordinate';
    if (!Number.isInteger(column) || column < 0 || column > 8)
      throw 'Invalid coordinate';
    if (!'123456789'.includes(value))
      throw 'Invalid value';

    const index = this.toIndex(row, column);

    // if the position on the puzzleString is not vacant and value is not in that position.
    if (puzzleString[index] != '.' && puzzleString[index] != value)
      return false;

    // acquire the all elements that the `value` will be check against.
    let toInspect = puzzleString.split('')
      .filter((e, i) => e != '.' && i != index && sieve(i));

    for (let other of toInspect) {
      if (other == value)
        return false;
    }

    return true;
  }

  checkRowPlacement(puzzleString, row, column, value) {
    return this.noDuplicateIn(puzzleString, row, column, value,
      (i) => this.toRowCol(i)[0] == row);
  }

  checkColPlacement(puzzleString, row, column, value) {
    return this.noDuplicateIn(puzzleString, row, column, value,
      (i) => this.toRowCol(i)[1] == column);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
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
      throw "Puzzle connot be solved";
  }
}

module.exports = SudokuSolver;


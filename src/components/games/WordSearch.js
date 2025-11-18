import React, { useState, useEffect } from 'react';
import './WordSearch.css';

const WordSearch = ({ words = [], gridSize = 10 }) => {
  const [grid, setGrid] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selectedCells, setSelectedCells] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const directions = [
    [0, 1],   // right
    [1, 0],   // down
    [1, 1],   // diagonal down-right
    [-1, 1],  // diagonal up-right
  ];

  const generateGrid = () => {
    if (words.length === 0) return;

    // Initialize empty grid
    const newGrid = Array(gridSize).fill(null).map(() =>
      Array(gridSize).fill(null).map(() => ({
        letter: '',
        isPartOfWord: false,
        wordIndex: -1
      }))
    );

    const upperWords = words.map(w => w.toUpperCase());
    const placedWords = [];

    // Try to place each word
    upperWords.forEach((word, wordIndex) => {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        attempts++;
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const [dx, dy] = direction;

        // Random starting position
        let row = Math.floor(Math.random() * gridSize);
        let col = Math.floor(Math.random() * gridSize);

        // Check if word fits
        let canPlace = true;
        const positions = [];

        for (let i = 0; i < word.length; i++) {
          const newRow = row + (dx * i);
          const newCol = col + (dy * i);

          if (
            newRow < 0 || newRow >= gridSize ||
            newCol < 0 || newCol >= gridSize ||
            (newGrid[newRow][newCol].letter !== '' &&
             newGrid[newRow][newCol].letter !== word[i])
          ) {
            canPlace = false;
            break;
          }

          positions.push({ row: newRow, col: newCol, letter: word[i] });
        }

        // Place the word
        if (canPlace) {
          positions.forEach(({ row, col, letter }) => {
            newGrid[row][col] = {
              letter,
              isPartOfWord: true,
              wordIndex
            };
          });
          placedWords.push({ word, positions });
          placed = true;
        }
      }
    });

    // Fill empty cells with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (newGrid[i][j].letter === '') {
          newGrid[i][j].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    setGrid(newGrid);
    setFoundWords(new Set());
  };

  useEffect(() => {
    generateGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, gridSize]);

  const checkWord = (cells) => {
    if (cells.length < 2) return null;

    const letters = cells.map(({ row, col }) => grid[row][col].letter).join('');

    for (let word of words) {
      const upperWord = word.toUpperCase();
      if (letters === upperWord || letters === upperWord.split('').reverse().join('')) {
        return upperWord;
      }
    }

    return null;
  };

  const handleMouseDown = (row, col) => {
    setIsDragging(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row, col) => {
    if (!isDragging) return;

    const lastCell = selectedCells[selectedCells.length - 1];

    // Check if this is a valid continuation (same row, col, or diagonal)
    if (selectedCells.length === 1 ||
        (Math.abs(row - lastCell.row) <= 1 && Math.abs(col - lastCell.col) <= 1)) {

      // Avoid duplicates
      if (!selectedCells.some(cell => cell.row === row && cell.col === col)) {
        setSelectedCells([...selectedCells, { row, col }]);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const word = checkWord(selectedCells);
    if (word && !foundWords.has(word)) {
      setFoundWords(new Set([...foundWords, word]));
    }

    setIsDragging(false);
    setSelectedCells([]);
  };

  const isSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isFound = (row, col) => {
    if (!grid[row] || !grid[row][col]) return false;
    const cell = grid[row][col];
    if (!cell.isPartOfWord) return false;

    const wordAtCell = words[cell.wordIndex];
    return wordAtCell && foundWords.has(wordAtCell.toUpperCase());
  };

  if (words.length === 0) {
    return (
      <div className="word-search-container">
        <div className="word-search-message error">
          No words available for Word Search! Add words in the admin panel.
        </div>
      </div>
    );
  }

  const allWordsFound = foundWords.size === words.length;

  return (
    <div className="word-search-container">
      <div className="word-search-header">
        <h2>Word Search</h2>
        <button onClick={generateGrid} className="word-search-reset-btn">New Puzzle</button>
      </div>

      <div className="word-search-stats">
        <p>Found: {foundWords.size} / {words.length}</p>
      </div>

      {allWordsFound && (
        <div className="word-search-message success">
          🎉 Congratulations! You found all the words!
        </div>
      )}

      <div className="word-search-content">
        <div
          className="word-search-grid"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="word-search-row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`word-search-cell ${
                    isSelected(rowIndex, colIndex) ? 'selected' : ''
                  } ${
                    isFound(rowIndex, colIndex) ? 'found' : ''
                  }`}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                >
                  {cell.letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="word-search-words">
          <h3>Words to Find:</h3>
          <ul>
            {words.map((word, index) => (
              <li
                key={index}
                className={foundWords.has(word.toUpperCase()) ? 'found-word' : ''}
              >
                {word}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WordSearch;

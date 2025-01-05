let currentPuzzle = []; // Stores the original puzzle fetched from the API
let solutionPuzzle = []; // Stores the generated solution

async function fetchPuzzle() {
    try {
        const response = await fetch("https://sudoku-api.vercel.app/api/dosuku");
        const data = await response.json();

        currentPuzzle = data.newboard.grids[0].value; // Fetch the puzzle (already in 2D format)
        solutionPuzzle = JSON.parse(JSON.stringify(currentPuzzle)); // Deep copy for solving
        solveSudoku(solutionPuzzle); // Solve the puzzle
        renderBoard(); // Render the board
    } catch (error) {
        console.error("Error fetching puzzle:", error);
    }
}

function renderBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("div");
            cell.classList.add("sudoku-cell");
            
            // Add tabindex to make read-only cells focusable
            cell.tabIndex = 0;

            if (currentPuzzle[row][col] !== 0) {
                cell.classList.add("read-only");
                cell.textContent = currentPuzzle[row][col];
            } else {
                const input = document.createElement("input");
                input.type = "number";
                input.min = 1;
                input.max = 9;
                
                // Add input event listener to style user entries
                input.addEventListener('input', function(e) {
                    if (e.target.value) {
                        e.target.style.color = '#0066ff'; // blue color for user input
                    }
                });
                
                cell.appendChild(input);
            }

            if ((col + 1) % 3 === 0 && col !== 8) {
                cell.classList.add("border-thick-right");
            }
            if ((row + 1) % 3 === 0 && row !== 8) {
                cell.classList.add("border-thick-bottom");
            }

            board.appendChild(cell);
        }
    }
}

// Solve the Sudoku puzzle using backtracking
function solveSudoku(board) {
    const emptyCell = findEmptyCell(board); // Find the next empty cell
    if (!emptyCell) return true; // No empty cells, puzzle is solved

    const [row, col] = emptyCell;

    // Try numbers 1 through 9
    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            board[row][col] = num; // Place the number

            if (solveSudoku(board)) {
                return true; // Puzzle solved
            }

            board[row][col] = 0; // Reset the cell and backtrack
        }
    }

    return false; // Trigger backtracking
}

// Find the next empty cell in the puzzle
function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null; // No empty cells
}

// Check if placing a number is valid
function isValid(board, row, col, num) {
    // Check the row
    for (let c = 0; c < 9; c++) {
        if (board[row][c] === num) {
            return false;
        }
    }

    // Check the column
    for (let r = 0; r < 9; r++) {
        if (board[r][col] === num) {
            return false;
        }
    }

    // Check the 3x3 sub-grid
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (board[boxRow + r][boxCol + c] === num) {
                return false;
            }
        }
    }

    return true; // The placement is valid
}

// Solve and display the Sudoku solution
function solvePuzzle() {
    const boardCopy = JSON.parse(JSON.stringify(currentPuzzle)); // Create a copy of the puzzle to solve

    if (solveSudoku(boardCopy)) {
        renderSolvedBoard(boardCopy); // Render the solved board
        alert("Puzzle solved!");
    } else {
        alert("This puzzle cannot be solved.");
    }
}

// Render the solved Sudoku board
function renderSolvedBoard(solvedBoard) {
    const board = document.getElementById("board");
    board.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("div");
            cell.classList.add("sudoku-cell", "read-only");

            if ((col + 1) % 3 === 0 && col !== 8) {
                cell.classList.add("border-thick-right");
            }
            if ((row + 1) % 3 === 0 && row !== 8) {
                cell.classList.add("border-thick-bottom");
            }

            cell.textContent = solvedBoard[row][col]; // Display the solved value
            board.appendChild(cell);
        }
    }
}

function checkAnswer() {
    const inputs = document.querySelectorAll(".sudoku-cell input");
    let isCorrect = true;

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = inputs[row * 9 + col]; // Flattened index
            if (cell) {
                const value = cell.value;
                if(value==="") continue;
                if (value != solutionPuzzle[row][col]) {
                    cell.parentElement.classList.add("error");
                    isCorrect = false;
                } else {
                    cell.parentElement.classList.remove("error");
                }
            }
        }
    }

    if (isCorrect) {
        alert("Congratulations! You've solved the puzzle!");
    } else {
        alert("There are errors in your solution. Keep trying!");
    }
}


// document.addEventListener("keydown", (event) => {
//     const inputs = Array.from(document.querySelectorAll(".sudoku-cell input"));
//     if (!inputs.length) return;

//     const currentIndex = inputs.findIndex((input) => input === document.activeElement);
//     let newIndex;

//     switch (event.key) {
//         case "ArrowRight":
//             newIndex = (currentIndex + 1) % inputs.length;
//             break;
//         case "ArrowLeft":
//             newIndex = (currentIndex - 1 + inputs.length) % inputs.length;
//             break;
//         case "ArrowUp":
//             newIndex = currentIndex - 9 >= 0 ? currentIndex - 9 : currentIndex;
//             break;
//         case "ArrowDown":
//             newIndex = currentIndex + 9 < inputs.length ? currentIndex + 9 : currentIndex;
//             break;
//         default:
//             return;
//     }

//     inputs[newIndex].focus();
// });

document.addEventListener("keydown", function (event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
        
        const board = document.getElementById("board");
        const cells = Array.from(board.children);
        let currentCell;
        
        // Find the current cell (whether it's an input or read-only cell)
        if (document.activeElement.tagName === "INPUT") {
            currentCell = document.activeElement.parentElement;
        } else {
            currentCell = document.querySelector(".sudoku-cell:focus");
        }
        
        if (!currentCell) return;
        
        const currentIndex = cells.indexOf(currentCell);
        let nextIndex = currentIndex;
        
        switch (event.key) {
            case "ArrowUp":
                nextIndex = currentIndex - 9;
                break;
            case "ArrowDown":
                nextIndex = currentIndex + 9;
                break;
            case "ArrowLeft":
                if (currentIndex % 9 !== 0) nextIndex = currentIndex - 1;
                break;
            case "ArrowRight":
                if ((currentIndex + 1) % 9 !== 0) nextIndex = currentIndex + 1;
                break;
        }
        
        // Check if the next index is valid
        if (nextIndex >= 0 && nextIndex < cells.length) {
            const nextCell = cells[nextIndex];
            
            // If the next cell has an input, focus the input
            const input = nextCell.querySelector("input");
            if (input) {
                input.focus();
            } else {
                // If it's a read-only cell, focus the cell itself
                nextCell.focus();
            }
        }
    }
});
  

// Event listeners for buttons

document.getElementById("newPuzzleBtn").addEventListener("click", fetchPuzzle);

document.getElementById("solvePuzzleBtn").addEventListener("click", solvePuzzle);

document.getElementById("checkAnswerBtn").addEventListener("click", checkAnswer);



// Initialize by fetching a new puzzle

fetchPuzzle();
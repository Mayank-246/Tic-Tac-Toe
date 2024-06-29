document.addEventListener('DOMContentLoaded', function () {
    let selectedGameType = null;
    let selectedAlgorithm = null;
    let gameInProgress = false;
    let depth = Infinity;
    
    function toggleActive(buttonGroup, button) {
        if (!gameInProgress) {
            buttonGroup.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            return button.getAttribute('data-value');
        }
    }

    document.querySelectorAll('.game-type-buttons').forEach(buttonGroup => {
        buttonGroup.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                selectedGameType = toggleActive(buttonGroup, event.target);
            }
        });
    });

    document.querySelectorAll('.algo-type-buttons').forEach(buttonGroup => {
        buttonGroup.addEventListener('click', function (event) {
            if (event.target.tagName === 'BUTTON') {
                selectedAlgorithm = toggleActive(buttonGroup, event.target);
            }
        });
    });

    $('#gamedata').submit(function (event) {
        event.preventDefault();
        if (!gameInProgress) {
            const depthInputValue =$('#depth').value;
            depth = !depthInputValue || isNaN(depthInputValue) ? Infinity : parseInt(depthInputValue);

            gameInProgress = true;
            document.querySelectorAll('.buttons button').forEach(element => {
                element.disabled = true;
            });
            $('depth').disabled = true;

            startGame(selectedGameType, selectedAlgorithm, depth);
        }
    });

    $('#reset').click(function () {
        selectedGameType = null;
        selectedAlgorithm = null;
        gameInProgress = false;
        $('#depth').value = '';
        $('#winner_text').text('Turn for X');
        document.querySelectorAll('.buttons button').forEach(button => {
            button.classList.remove('active');
            button.disabled = false;
        });

        $('#depth').disabled = false;
        resetBoard();
        endGame();
    });

    const cells = document.querySelectorAll('.box');
    const winnerText = document.getElementById('winner_text');
    
    let currentPlayer = 'X';
    let board = Array(9).fill(null);

    function startGame(gameType, algorithm, depth) {
        resetBoard();

        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });

        if (gameType === 'single') {
            currentPlayer = 'X';
        } else if (gameType === 'multi') {
            currentPlayer = 'X';
        }
        $('#winner_text').text('Turn for '+currentPlayer);
    }

    function handleCellClick(event) {
        const cell = event.target;
        const cellIndex = parseInt(cell.id);

        if (!board[cellIndex]) {
            board[cellIndex] = currentPlayer;
            cell.textContent = currentPlayer;
            cell.classList.add('active');

            const winner = checkWinner();
            if (winner) {
                winnerText.textContent = winner === 'tie' ? 'It\'s a draw!' : `Player ${winner} wins!`;
                // winnerDisplay.style.display = 'block';
                endGame();
            } else {
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                $('#winner_text').text('Turn for '+currentPlayer);
                if (selectedGameType === 'single' && currentPlayer === 'O') {
                    if (selectedAlgorithm === 'minimax') {
                        aiMoveMinimax(depth);
                    } else if (selectedAlgorithm === 'alpha_beta') {
                        aiMoveAlphaBeta(depth);
                    }
                }
            }
        }
    }

    function aiMoveMinimax(depth) {
        let bestMove;
        let bestValue = -Infinity;

        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = 'O';
                let moveValue = minimax(board, depth - 1, false);
                board[i] = null;

                if (moveValue > bestValue) {
                    bestValue = moveValue;
                    bestMove = i;
                }
            }
        }
        setTimeout(function(){
            if (bestMove !== undefined) {
                board[bestMove] = 'O';
                cells[bestMove].textContent = 'O';
                cells[bestMove].classList.add('active');
                
                const winner = checkWinner();
                if (winner) {
                    winnerText.textContent = winner === 'tie' ? 'It\'s a draw!' : `Player O wins!`;
                    // winnerDisplay.style.display = 'block';
                    endGame();
                } else {
                    currentPlayer = 'X';
                    $('#winner_text').text('Turn for '+currentPlayer);
                }
                
            }
        }, 200);
        
    }

    function minimax(board, depth, isMaximizing) {
        let winner = checkWinner();

        if (winner !== null) {
            return winner === 'tie' ? 0 : (winner === 'O' ? 10 : -10);
        }

        if (depth === 0) {
            return evaluateBoard(board);
        }

        if (isMaximizing) {
            let bestValue = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (!board[i]) {
                    board[i] = 'O';
                    let value = minimax(board, depth - 1, false);
                    board[i] = null;
                    bestValue = Math.max(bestValue, value);
                }
            }
            return bestValue;
        } else {
            let bestValue = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (!board[i]) {
                    board[i] = 'X';
                    let value = minimax(board, depth - 1, true);
                    board[i] = null;
                    bestValue = Math.min(bestValue, value);
                }
            }
            return bestValue;
        }
    }

    function aiMoveAlphaBeta(depth) {
        let bestMove;
        let bestValue = -Infinity;

        for (let i = 0; i < board.length; i++) {
            if (!board[i]) {
                board[i] = 'O';
                let moveValue = alphaBetaPruning(board, depth - 1, -Infinity, Infinity, false);
                board[i] = null;

                if (moveValue > bestValue) {
                    bestValue = moveValue;
                    bestMove = i;
                }
            }
        }
        setTimeout(function(){
            if (bestMove !== undefined) {
                board[bestMove] = 'O';
                cells[bestMove].textContent = 'O';
                cells[bestMove].classList.add('active');
    
                const winner = checkWinner();
                if (winner) {
                    winnerText.textContent = winner === 'tie' ? 'It\'s a draw!' : `Player O wins!`;
                    // winnerDisplay.style.display = 'block';
                    endGame();
                } else {
                    currentPlayer = 'X';
                    $('#winner_text').text('Turn for '+currentPlayer);
                }
                
            }
        },200);
        
    }

    function alphaBetaPruning(board, depth, alpha, beta, isMaximizing) {
        let winner = checkWinner();

        if (winner !== null) {
            return winner === 'tie' ? 0 : (winner === 'O' ? 10 : -10);
        }

        if (depth === 0) {
            return evaluateBoard(board);
        }

        if (isMaximizing) {
            let bestValue = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (!board[i]) {
                    board[i] = 'O';
                    let value = alphaBetaPruning(board, depth - 1, alpha, beta, false);
                    board[i] = null;
                    bestValue = Math.max(bestValue, value);
                    alpha = Math.max(alpha, bestValue);
                    if (alpha >= beta) {
                        break;
                    }
                }
            }
            return bestValue;
        } else {
            let bestValue = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (!board[i]) {
                    board[i] = 'X';
                    let value = alphaBetaPruning(board, depth - 1, alpha, beta, true);
                    board[i] = null;
                    bestValue = Math.min(bestValue, value);
                    beta = Math.min(beta, bestValue);
                    if (alpha >= beta) {
                        break;
                    }
                }
            }
            return bestValue;
        }
    }
    function evaluateBoard(board) {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        let score = 0;

        for (const [a, b, c] of winningCombinations) {
            const line = [board[a], board[b], board[c]];

            if (line.every(cell => cell === 'O')) {
                score += 10;
            } else if (line.every(cell => cell === 'X')) {
                score -= 10;
            } else if (line.filter(cell => cell === 'O').length === 2 && line.includes(null)) {
                score += 1;
            } else if (line.filter(cell => cell === 'X').length === 2 && line.includes(null)) {
                score -= 1;
            }
        }

        return score;
    }

    function checkWinner() {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (const [a, b, c] of winningCombinations) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return board.every(cell => cell) ? 'tie' : null;
    }

    function endGame() {
        gameInProgress = false;

        document.querySelectorAll('.buttons button').forEach(element => {
            element.disabled = false;
        });
        $('#depth').disabled = false;

        cells.forEach(cell => {
            cell.removeEventListener('click', handleCellClick);
        });
    }

    function resetBoard() {
        board = Array(9).fill(null);
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('active');
        });
        //winnerDisplay.style.display = 'none';
        currentPlayer = 'X';
    }
    
    $('#restart').click(function(){
        startGame(selectedGameType, selectedAlgorithm, depth);
    });
});


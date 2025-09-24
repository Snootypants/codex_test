import React, { useMemo, useState } from 'react';

const ROWS = 6;
const COLUMNS = 7;
const PLAYERS = {
  playerOne: {
    id: 'playerOne',
    name: 'Solar Nova',
    vibe: 'Optimistic Strategist',
    token: '☀️',
    color: '#ff6ad5',
    glow: 'rgba(255, 106, 213, 0.6)',
    gradient: 'linear-gradient(135deg, #ff6ad5, #ffb861)',
  },
  playerTwo: {
    id: 'playerTwo',
    name: 'Lunar Flux',
    vibe: 'Calm Tactician',
    token: '🌙',
    color: '#45f1ff',
    glow: 'rgba(69, 241, 255, 0.6)',
    gradient: 'linear-gradient(135deg, #45f1ff, #805bff)',
  },
};

const createBoard = () => Array.from({ length: ROWS }, () => Array(COLUMNS).fill(null));

const checkForWin = (board, row, column, player) => {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ];

  for (const { dr, dc } of directions) {
    const line = [[row, column]];

    let count = 1;
    let r = row + dr;
    let c = column + dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r][c] === player) {
      line.push([r, c]);
      count += 1;
      r += dr;
      c += dc;
    }

    r = row - dr;
    c = column - dc;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r][c] === player) {
      line.unshift([r, c]);
      count += 1;
      r -= dr;
      c -= dc;
    }

    if (count >= 4) {
      return {
        winner: player,
        cells: line.slice(0, 4),
      };
    }
  }

  return { winner: null, cells: [] };
};

const isBoardFull = (board) => board.every((row) => row.every(Boolean));

export default function App() {
  const [board, setBoard] = useState(createBoard);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYERS.playerOne.id);
  const [hoverColumn, setHoverColumn] = useState(null);
  const [scores, setScores] = useState({
    [PLAYERS.playerOne.id]: 0,
    [PLAYERS.playerTwo.id]: 0,
  });
  const [gameState, setGameState] = useState({
    status: 'playing',
    winner: null,
    winningCells: [],
  });

  const nextPlayer = currentPlayer === PLAYERS.playerOne.id ? PLAYERS.playerTwo : PLAYERS.playerOne;
  const activePlayer = PLAYERS[currentPlayer];

  const statusLabel = useMemo(() => {
    if (gameState.status === 'won' && gameState.winner) {
      return `${PLAYERS[gameState.winner].name} takes the round!`;
    }

    if (gameState.status === 'draw') {
      return "It's a standoff.";
    }

    return `${activePlayer.name}'s move`;
  }, [activePlayer.name, gameState]);

  const handleDrop = (column) => {
    if (gameState.status !== 'playing') return;

    const columnCells = board.map((row) => row[column]);
    const targetRow = columnCells.lastIndexOf(null);

    if (targetRow === -1) return;

    const nextBoard = board.map((row) => [...row]);
    nextBoard[targetRow][column] = currentPlayer;

    const { winner, cells } = checkForWin(nextBoard, targetRow, column, currentPlayer);

    if (winner) {
      setBoard(nextBoard);
      setGameState({ status: 'won', winner, winningCells: cells });
      setScores((prev) => ({
        ...prev,
        [winner]: prev[winner] + 1,
      }));
      return;
    }

    if (isBoardFull(nextBoard)) {
      setBoard(nextBoard);
      setGameState({ status: 'draw', winner: null, winningCells: [] });
      return;
    }

    setBoard(nextBoard);
    setCurrentPlayer(nextPlayer.id);
  };

  const handleReset = (resetScores = false) => {
    setBoard(createBoard());
    setCurrentPlayer(PLAYERS.playerOne.id);
    setHoverColumn(null);
    setGameState({ status: 'playing', winner: null, winningCells: [] });

    if (resetScores) {
      setScores({
        [PLAYERS.playerOne.id]: 0,
        [PLAYERS.playerTwo.id]: 0,
      });
    }
  };

  return (
    <div className="app-shell">
      <div className="aurora" aria-hidden="true" />
      <div className="aurora aurora-2" aria-hidden="true" />

      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">Neon Connect Labs</p>
          <h1>
            Drop. Align. <span>Win big.</span>
          </h1>
          <p className="subtitle">
            A vibrant Connect 4 experience for your next team night, company social, or customer lounge.
            Play a round, share a link, turn downtime into dazzling showtime.
          </p>
          <div className="actions">
            <button type="button" className="cta" onClick={() => handleReset(false)}>
              Start fresh round
            </button>
            <button type="button" className="ghost" onClick={() => handleReset(true)}>
              Reset scoreboard
            </button>
          </div>
        </div>
        <div className="scoreboard">
          {Object.values(PLAYERS).map((player) => (
            <div key={player.id} className={`score-card ${player.id === currentPlayer ? 'score-active' : ''}`}>
              <div className="score-headline">
                <span className="token" style={{ background: player.gradient }}>
                  {player.token}
                </span>
                <div>
                  <p className="player-name">{player.name}</p>
                  <p className="player-vibe">{player.vibe}</p>
                </div>
              </div>
              <div className="score-value">{scores[player.id]}</div>
              <p className="score-label">rounds won</p>
            </div>
          ))}
        </div>
      </header>

      <main className="main-stage">
        <div className="game-card">
          <div className="status-bar">
            <span className={`status-chip status-${gameState.status}`}>
              {gameState.status === 'playing' && 'In progress'}
              {gameState.status === 'won' && 'Victory secured'}
              {gameState.status === 'draw' && 'All filled up'}
            </span>
            <p className="status-headline">{statusLabel}</p>
            <p className="status-sub">{`Your tokens are glowing ${activePlayer.id === PLAYERS.playerOne.id ? 'sunset pink' : 'electric cyan'}.`}</p>
          </div>

          <div className="board" role="grid" aria-label="Connect Four Board">
            {Array.from({ length: COLUMNS }).map((_, columnIndex) => (
              <div
                key={`col-${columnIndex}`}
                className={`board-column ${hoverColumn === columnIndex ? 'board-column-hover' : ''}`}
                onMouseEnter={() => setHoverColumn(columnIndex)}
                onMouseLeave={() => setHoverColumn(null)}
                onClick={() => handleDrop(columnIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleDrop(columnIndex);
                  }
                }}
              >
                <div className="drop-zone">
                  <div
                    className="drop-indicator"
                    style={{ background: activePlayer.gradient, opacity: hoverColumn === columnIndex ? 1 : 0 }}
                  />
                </div>
                {Array.from({ length: ROWS }).map((_, rowIndex) => {
                  const cellValue = board[rowIndex][columnIndex];
                  const isWinningCell = gameState.winningCells.some(
                    ([winRow, winColumn]) => winRow === rowIndex && winColumn === columnIndex,
                  );

                  return (
                    <div
                      key={`cell-${rowIndex}-${columnIndex}`}
                      className={`cell ${cellValue ?? 'empty'} ${isWinningCell ? 'cell-winning' : ''}`}
                    >
                      <div className="token-shell">
                        <div
                          className="token-core"
                          style={{
                            background:
                              cellValue && cellValue === PLAYERS.playerOne.id
                                ? PLAYERS.playerOne.gradient
                                : cellValue === PLAYERS.playerTwo.id
                                  ? PLAYERS.playerTwo.gradient
                                  : 'transparent',
                            boxShadow:
                              cellValue && cellValue === PLAYERS.playerOne.id
                                ? `0 0 18px ${PLAYERS.playerOne.glow}`
                                : cellValue === PLAYERS.playerTwo.id
                                  ? `0 0 18px ${PLAYERS.playerTwo.glow}`
                                  : 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <footer className="card-footer">
            {gameState.status !== 'playing' ? (
              <button type="button" className="cta" onClick={() => handleReset(false)}>
                Launch another round
              </button>
            ) : (
              <p>
                Pro tip: stack combos diagonally for unstoppable highlight moments. Columns fill from the bottom, so plan
                your glow ups wisely.
              </p>
            )}
          </footer>
        </div>

        <aside className="promo">
          <h2>Why teams love Neon Connect</h2>
          <ul>
            <li>
              <span className="promo-bullet">⚡</span>
              Instant engagement for product launches, onboarding lounges, and event booths.
            </li>
            <li>
              <span className="promo-bullet">🎨</span>
              Gorgeous neon visuals that flex across dark dashboards, landing pages, and command centers.
            </li>
            <li>
              <span className="promo-bullet">📈</span>
              Built-in analytics hooks and white-label ready API in the full SaaS edition.
            </li>
          </ul>
          <button type="button" className="ghost">Talk to sales</button>
        </aside>
      </main>
    </div>
  );
}

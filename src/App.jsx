import { useMemo, useState } from 'react';
import './App.css';

const ROWS = 6;
const COLUMNS = 7;

const playerThemes = {
  1: {
    label: 'Sunset Nova',
    accent: '#ff7b7b',
    glow: 'rgba(255, 123, 123, 0.55)',
  },
  2: {
    label: 'Aqua Pulse',
    accent: '#4ef3c2',
    glow: 'rgba(78, 243, 194, 0.55)',
  },
};

const featureHighlights = [
  {
    icon: '🎯',
    title: 'Column intelligence',
    description:
      'Preview each lane in real time and drop discs with confident precision.',
  },
  {
    icon: '📈',
    title: 'Victory analytics',
    description:
      'Track wins, draws, and streaks with bright SaaS-inspired scorecards.',
  },
  {
    icon: '⚡',
    title: 'Lightning rounds',
    description:
      'Launch the next match instantly and keep your team energised.',
  },
];

const createEmptyBoard = () =>
  Array.from({ length: ROWS }, () => Array.from({ length: COLUMNS }, () => 0));

const directions = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

const collectWinningCells = (board, row, col, [dRow, dCol]) => {
  const player = board[row][col];
  if (!player) {
    return null;
  }

  const cells = [[row, col]];
  let count = 1;

  let currentRow = row + dRow;
  let currentCol = col + dCol;
  while (
    currentRow >= 0 &&
    currentRow < ROWS &&
    currentCol >= 0 &&
    currentCol < COLUMNS &&
    board[currentRow][currentCol] === player
  ) {
    cells.push([currentRow, currentCol]);
    count += 1;
    currentRow += dRow;
    currentCol += dCol;
  }

  currentRow = row - dRow;
  currentCol = col - dCol;
  while (
    currentRow >= 0 &&
    currentRow < ROWS &&
    currentCol >= 0 &&
    currentCol < COLUMNS &&
    board[currentRow][currentCol] === player
  ) {
    cells.unshift([currentRow, currentCol]);
    count += 1;
    currentRow -= dRow;
    currentCol -= dCol;
  }

  return count >= 4 ? cells : null;
};

const evaluateWinner = (board, row, col) => {
  for (const direction of directions) {
    const cells = collectWinningCells(board, row, col, direction);
    if (cells) {
      return { winner: board[row][col], cells };
    }
  }

  return { winner: null, cells: [] };
};

const boardIsFull = (board) => board.every((row) => row.every((cell) => cell !== 0));

function App() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [hoverColumn, setHoverColumn] = useState(null);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [drawCount, setDrawCount] = useState(0);
  const [startingPlayer, setStartingPlayer] = useState(1);

  const totalMatches = scores[1] + scores[2] + drawCount;

  const statusMessage = useMemo(() => {
    if (winner === 'draw') {
      return "It's a dramatic draw!";
    }

    if (winner) {
      return `Player ${winner} locks in the win!`;
    }

    return `Player ${currentPlayer} is on the move.`;
  }, [winner, currentPlayer]);

  const statusDetail = useMemo(() => {
    if (winner === 'draw') {
      return 'No more moves left. Hit “Next Round” to relaunch the battle.';
    }

    if (winner) {
      return `${playerThemes[winner].label} just connected four in style.`;
    }

    return `Deploy a disc to the neon lanes. ${playerThemes[currentPlayer].label} is glowing.`;
  }, [winner, currentPlayer]);

  const leaderText = useMemo(() => {
    if (!totalMatches) {
      return 'No leaderboard yet—be the first to score.';
    }

    if (scores[1] === scores[2]) {
      return 'Neck and neck. Momentum is up for grabs.';
    }

    const leader = scores[1] > scores[2] ? 1 : 2;
    const gap = Math.abs(scores[1] - scores[2]);
    return `Player ${leader} is leading by ${gap}.`;
  }, [scores, totalMatches]);

  const momentumPercent = useMemo(() => {
    if (!totalMatches) {
      return 0;
    }

    return Math.round((scores[currentPlayer] / totalMatches) * 100);
  }, [scores, currentPlayer, totalMatches]);

  const metrics = useMemo(
    () => [
      {
        label: 'Rounds Played',
        value: totalMatches,
        hint: 'Matches logged in this session.',
      },
      {
        label: 'Draw Archive',
        value: drawCount,
        hint: 'Stalemates worth celebrating.',
      },
      {
        label: 'Momentum',
        value: `${momentumPercent}%`,
        hint: `Player ${currentPlayer} win rate right now.`,
      },
    ],
    [currentPlayer, drawCount, momentumPercent, totalMatches],
  );

  const handleDrop = (column) => {
    if (winner) {
      return;
    }

    if (board[0][column] !== 0) {
      return;
    }

    const nextBoard = board.map((row) => [...row]);
    let placedRow = null;

    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (nextBoard[row][column] === 0) {
        nextBoard[row][column] = currentPlayer;
        placedRow = row;
        break;
      }
    }

    if (placedRow === null) {
      return;
    }

    const { winner: detectedWinner, cells } = evaluateWinner(nextBoard, placedRow, column);
    if (detectedWinner) {
      setBoard(nextBoard);
      setWinner(detectedWinner);
      setWinningCells(cells);
      setScores((previous) => ({
        ...previous,
        [detectedWinner]: previous[detectedWinner] + 1,
      }));
      return;
    }

    if (boardIsFull(nextBoard)) {
      setBoard(nextBoard);
      setWinner('draw');
      setWinningCells([]);
      setDrawCount((value) => value + 1);
      return;
    }

    setBoard(nextBoard);
    setCurrentPlayer((player) => (player === 1 ? 2 : 1));
  };

  const startNextRound = () => {
    const nextStarter = startingPlayer === 1 ? 2 : 1;
    setBoard(createEmptyBoard());
    setWinner(null);
    setWinningCells([]);
    setHoverColumn(null);
    setStartingPlayer(nextStarter);
    setCurrentPlayer(nextStarter);
  };

  const resetSeason = () => {
    setBoard(createEmptyBoard());
    setWinner(null);
    setWinningCells([]);
    setHoverColumn(null);
    setScores({ 1: 0, 2: 0 });
    setDrawCount(0);
    setStartingPlayer(1);
    setCurrentPlayer(1);
  };

  return (
    <div className="app">
      <main className="layout">
        <section className="hero">
          <span className="hero-pill">Connect 4 as a Service</span>
          <h1>
            Neon Connect 4 <span>HQ</span>
          </h1>
          <p>
            Spin up a futuristic arena, rally your crew, and watch the leaderboards glow in real
            time.
          </p>
          <div className="hero-metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className="hero-metric">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="game-section">
          <div className="scoreboard-panel">
            <div className="status-header">
              <span className="status-pill">Live Match</span>
              <h2>{statusMessage}</h2>
              <p>{statusDetail}</p>
            </div>

            <div className="scoreboard">
              {[1, 2].map((playerId) => (
                <div
                  key={playerId}
                  className={`player-card player-${playerId} ${
                    !winner && currentPlayer === playerId ? 'active' : ''
                  } ${winner === playerId ? 'champion' : ''}`.trim()}
                  style={{
                    '--accent': playerThemes[playerId].accent,
                    '--glow': playerThemes[playerId].glow,
                  }}
                >
                  <div className="player-label">Player {playerId}</div>
                  <div className="player-theme">{playerThemes[playerId].label}</div>
                  <div className="player-score">{scores[playerId]}</div>
                  <div className="player-subtext">
                    {winner === playerId
                      ? 'Victory secured'
                      : !winner && currentPlayer === playerId
                      ? 'Your move'
                      : 'On standby'}
                  </div>
                </div>
              ))}
            </div>

            <div className="leaderboard-card">
              <h3>Leaderboard pulse</h3>
              <p>{leaderText}</p>
            </div>

            <div className="metrics-grid">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-value">{metric.value}</span>
                  <span className="metric-hint">{metric.hint}</span>
                </div>
              ))}
            </div>

            <div className="action-row">
              <button
                type="button"
                className="primary"
                onClick={startNextRound}
                disabled={!winner}
              >
                Launch next round
              </button>
              <button type="button" className="ghost" onClick={resetSeason}>
                Reset season
              </button>
            </div>
          </div>

          <div className="board-panel">
            <div className="board-frame">
              <div className="board" onMouseLeave={() => setHoverColumn(null)}>
                {board.map((row, rowIndex) =>
                  row.map((cell, columnIndex) => {
                    const isWinningCell = winningCells.some(
                      ([winningRow, winningColumn]) =>
                        winningRow === rowIndex && winningColumn === columnIndex,
                    );
                    const isFullColumn = board[0][columnIndex] !== 0;
                    const isActiveHover = hoverColumn === columnIndex && !winner;

                    return (
                      <button
                        key={`${rowIndex}-${columnIndex}`}
                        type="button"
                        className={`cell ${cell ? `player-${cell}` : 'empty'} ${
                          isWinningCell ? 'winner' : ''
                        } ${isActiveHover ? 'hover' : ''}`.trim()}
                        onClick={() => handleDrop(columnIndex)}
                        onMouseEnter={() => setHoverColumn(columnIndex)}
                        onMouseLeave={() => setHoverColumn(null)}
                        disabled={winner || isFullColumn}
                        aria-label={`Drop a disc in column ${columnIndex + 1}`}
                      />
                    );
                  }),
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          {featureHighlights.map((feature) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;

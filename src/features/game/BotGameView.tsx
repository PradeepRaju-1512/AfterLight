import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';
import { DIFFICULTY, Difficulty, MESSAGES, friendlyError } from '../../copy';
import confetti from 'canvas-confetti';
import { RotateCcw, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface BotGameViewProps {
  user: User;
  onMatchFinished?: () => void;
  onGoToOopLab?: () => void;
}

// The engine reports zero-based cells; players see cells numbered 1 to 9.
const humanizeCells = (text: string) =>
  String(text ?? '').replace(/\b(cell|corner)( cell)? (\d)\b/g, (_m, a, b, n) => `${a}${b ?? ''} ${Number(n) + 1}`);

const DIFFICULTIES: Difficulty[] = ['wanderer', 'sentinel', 'unbroken'];

export const BotGameView: React.FC<BotGameViewProps> = ({ user, onMatchFinished, onGoToOopLab }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('unbroken');
  const [humanMark, setHumanMark] = useState<'X' | 'O'>('X');
  const [gameId, setGameId] = useState<string>('');
  const [board, setBoard] = useState<string>('.........');
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');
  const [status, setStatus] = useState<'ACTIVE' | 'COMPLETED' | 'WAITING'>('ACTIVE');
  const [outcome, setOutcome] = useState<string>('IN_PROGRESS');
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [lastMovePos, setLastMovePos] = useState<number | null>(null);
  const [lastBotExplanation, setLastBotExplanation] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startNewGame = async (diff = difficulty, mark = humanMark) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createBotGame({
        humanName: user.username,
        difficulty: diff,
        humanMark: mark,
      });
      if (res.game) {
        setGameId(res.game.id);
        setBoard(res.game.boardState);
        setCurrentTurn(res.game.currentTurn);
        setStatus('ACTIVE');
        setOutcome('IN_PROGRESS');
        setWinner(null);
        setWinningLine(null);
        setLastMovePos(res.botFirstMove ? res.botFirstMove.move : null);
        setLastBotExplanation(res.botFirstMove?.explanation || null);
      } else {
        setError(MESSAGES.genericError);
      }
    } catch (err: any) {
      console.error('Failed to start game:', err);
      setError(friendlyError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startNewGame(difficulty, humanMark);
  }, []);

  const handleCellClick = async (position: number) => {
    if (status !== 'ACTIVE' || loading) return;
    if (board[position] !== '.') return;
    if (currentTurn !== humanMark) return;

    setLoading(true);
    setError(null);
    setLastMovePos(position);

    try {
      const res = await api.playBotMove({ gameId, board, position, humanMark, difficulty });

      if (res.board) setBoard(res.board);
      if (res.botMove !== undefined) setLastMovePos(res.botMove);
      if (res.botExplanation) setLastBotExplanation(res.botExplanation);

      if (res.status === 'COMPLETED') {
        setStatus('COMPLETED');
        setOutcome(res.outcome);
        setWinner(res.winner);
        setWinningLine(res.winningLine || null);

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (res.winner === user.username && !reduceMotion) {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#D99A4E', '#DCE8F5', '#91B7CE'],
          });
        }
        if (onMatchFinished) onMatchFinished();
      } else {
        setCurrentTurn(res.nextTurn || humanMark);
      }
    } catch (err: any) {
      console.error('Move error:', err);
      setError(friendlyError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const pickDifficulty = (d: Difficulty) => {
    if (d === difficulty) return;
    setDifficulty(d);
    startNewGame(d, humanMark);
  };

  const pickMark = (m: 'X' | 'O') => {
    if (m === humanMark) return;
    setHumanMark(m);
    startNewGame(difficulty, m);
  };

  const statusText =
    status === 'ACTIVE'
      ? currentTurn === humanMark
        ? 'Your turn'
        : "Opponent's turn"
      : outcome === 'DRAW'
      ? "It's a draw."
      : winner === user.username
      ? 'You won!'
      : 'You lost.';

  const markGlyph = (c: string) => (c === 'X' ? '✕' : '◯');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-bold text-[#DCE8F5]">Play vs Bot</h1>
      <p className="mt-1.5 text-base text-[#B4C2D1]">Choose your difficulty and make your move.</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] items-start">
        <fieldset>
          <legend className="text-sm text-[#9AA9BA] mb-2">Difficulty</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => {
              const selected = difficulty === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => pickDifficulty(d)}
                  aria-pressed={selected}
                  className={`text-left rounded-xl px-4 py-3 border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#172231] border-[#D99A4E]/70'
                      : 'bg-[#0B101B]/70 border-[#293748] hover:border-[#4A5C72]'
                  }`}
                >
                  <span className={`block text-sm font-semibold ${selected ? 'text-[#E2A65C]' : 'text-[#DCE8F5]'}`}>
                    {DIFFICULTY[d].label}
                  </span>
                  <span className="block text-xs text-[#9AA9BA] mt-0.5 leading-snug">{DIFFICULTY[d].description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm text-[#9AA9BA] mb-2">Your side</legend>
          <div className="flex gap-2">
            {(['X', 'O'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => pickMark(m)}
                aria-pressed={humanMark === m}
                className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                  humanMark === m
                    ? 'bg-[#172231] border-[#D99A4E]/70 text-[#E2A65C]'
                    : 'bg-[#0B101B]/70 border-[#293748] text-[#DCE8F5] hover:border-[#4A5C72]'
                }`}
              >
                Play as {m}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 flex flex-col items-center">
          <p className="mb-4 text-lg font-semibold text-[#DCE8F5]" role="status" aria-live="polite">
            {statusText}
          </p>

          <div className="p-4 rounded-2xl bg-[#080D16]/90 border border-[#293748]/70">
            <div className="grid grid-cols-3 gap-2.5 w-[17rem] h-[17rem] sm:w-[22rem] sm:h-[22rem]" role="grid" aria-label="Game board">
              {board.split('').map((cell, idx) => {
                const isWinningCell = winningLine?.includes(idx);
                const isLastMove = lastMovePos === idx;
                const isClickable = cell === '.' && status === 'ACTIVE' && currentTurn === humanMark && !loading;
                const label =
                  cell === '.' ? `Empty cell ${idx + 1}` : `Cell ${idx + 1}, ${cell}`;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isClickable}
                    onClick={() => handleCellClick(idx)}
                    aria-label={label}
                    className={`rounded-xl border flex items-center justify-center transition-colors select-none ${
                      isWinningCell
                        ? 'bg-[#D99A4E]/20 border-[#D99A4E]'
                        : isLastMove
                        ? 'bg-[#172231] border-[#91B7CE]/50'
                        : 'bg-[#111B2A]/80 border-[#293748]'
                    } ${isClickable ? 'cursor-pointer hover:bg-[#172231] hover:border-[#91B7CE]/50' : 'cursor-default'}`}
                  >
                    {cell !== '.' && (
                      <span
                        aria-hidden="true"
                        className={`text-4xl sm:text-5xl font-bold ${cell === 'X' ? 'text-[#DCE8F5]' : 'text-[#E2A65C]'}`}
                      >
                        {markGlyph(cell)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div role="alert" className="min-h-6 mt-3 text-sm text-[#FF9AA2]">
            {error}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {status === 'COMPLETED' ? (
              <button
                type="button"
                onClick={() => startNewGame(difficulty, humanMark)}
                className="btn-amber-primary px-5 py-2.5 rounded-lg text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Rematch
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startNewGame(difficulty, humanMark)}
                className="px-5 py-2.5 rounded-lg bg-[#111B2A] hover:bg-[#172231] border border-[#293748] text-sm text-[#DCE8F5] flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                New Game
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="surface-card rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAnalysis(!showAnalysis)}
              aria-expanded={showAnalysis}
              className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
            >
              <h2 className="text-base font-semibold text-[#DCE8F5]">AI Analysis</h2>
              {showAnalysis ? (
                <ChevronUp className="w-4 h-4 text-[#9AA9BA]" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#9AA9BA]" aria-hidden="true" />
              )}
            </button>

            {showAnalysis && (
              <div className="px-4 pb-5 space-y-4 text-sm">
                {lastBotExplanation ? (
                  <>
                    <div>
                      <h3 className="text-xs text-[#9AA9BA] mb-1">Why the bot played that move</h3>
                      <p className="text-[#DCE8F5] leading-relaxed">{humanizeCells(lastBotExplanation.rationale)}</p>
                    </div>

                    {lastBotExplanation.evaluations && (
                      <div>
                        <h3 className="text-xs text-[#9AA9BA] mb-1.5">Move scores (higher is better for the bot)</h3>
                        <ul className="grid grid-cols-3 gap-1.5">
                          {Object.entries(lastBotExplanation.evaluations).map(([pos, score]) => (
                            <li
                              key={pos}
                              className="px-2 py-1.5 rounded-md bg-[#080D16] border border-[#293748] text-center text-xs"
                            >
                              <span className="text-[#9AA9BA]">Cell {Number(pos) + 1}: </span>
                              <span
                                className={`font-semibold ${
                                  Number(score) > 0 ? 'text-[#32C997]' : Number(score) < 0 ? 'text-[#FF9AA2]' : 'text-[#91B7CE]'
                                }`}
                              >
                                {String(score)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {lastBotExplanation.nodesEvaluated !== undefined && (
                      <p className="text-xs text-[#9AA9BA]">
                        Positions checked: {lastBotExplanation.nodesEvaluated}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="py-4 text-[#9AA9BA]">Make a move to see how the bot responds.</p>
                )}

                {onGoToOopLab && (
                  <button
                    type="button"
                    onClick={onGoToOopLab}
                    className="flex items-center gap-2 text-sm text-[#91B7CE] hover:text-[#DCE8F5] cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                    See how the bots work in the OOP Learning Lab
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { MESSAGES } from '../../copy';
import confetti from 'canvas-confetti';
import { Copy, Check, RotateCcw, Send, LogOut } from 'lucide-react';

interface MultiplayerViewProps {
  user: User;
  onMatchFinished?: () => void;
  onSubStateChange?: (subState: 'create-join' | 'in-room') => void;
}

type Connection = 'connecting' | 'connected' | 'reconnecting' | 'closed';

const makeRoomCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
};

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({ user, onMatchFinished, onSubStateChange }) => {
  const [inRoom, setInRoom] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [myMark, setMyMark] = useState<'X' | 'O' | null>(null);
  const [players, setPlayers] = useState<Array<{ username: string; mark: 'X' | 'O' }>>([]);
  const [board, setBoard] = useState('.........');
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');
  const [status, setStatus] = useState<'WAITING' | 'ACTIVE' | 'COMPLETED'>('WAITING');
  const [outcome, setOutcome] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [rematchRequestedBy, setRematchRequestedBy] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection>('connecting');
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: number }>>([]);
  const [chatInput, setChatInput] = useState('');

  const [friendsList, setFriendsList] = useState<string[]>([]);
  const [inviteSent, setInviteSent] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const leavingRef = useRef(false);

  useEffect(() => {
    onSubStateChange?.(inRoom ? 'in-room' : 'create-join');
  }, [inRoom, onSubStateChange]);

  useEffect(() => {
    api
      .getSocialOverview()
      .then((res) => {
        if (res && res.friends) setFriendsList(res.friends);
      })
      .catch(console.error);

    return () => {
      leavingRef.current = true;
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectToRoom = (code: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    leavingRef.current = false;
    setConnection('connecting');
    setNotice(null);
    setOpponentLeft(false);

    ws.onopen = () => {
      setConnection('connected');
      ws.send(JSON.stringify({ action: 'JOIN_ROOM', roomCode: code, username: user.username }));
    };

    ws.onclose = () => {
      if (!leavingRef.current) setConnection('reconnecting');
    };

    ws.onerror = () => {
      if (!leavingRef.current) setNotice(MESSAGES.networkError);
    };

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        const { event, payload } = data;

        if (event === 'ROOM_STATE') {
          setPlayers(payload.players || []);
          const me = payload.players?.find((p: any) => p.username === user.username);
          if (me) setMyMark(me.mark);
          setBoard(payload.board || '.........');
          setCurrentTurn(payload.currentTurn || 'X');
          setStatus(payload.status || 'WAITING');
          setOpponentLeft(false);
        } else if (event === 'GAME_START') {
          setStatus('ACTIVE');
          setBoard(payload.board);
          setCurrentTurn(payload.currentTurn);
          const pList = [
            { username: payload.playerX, mark: 'X' as const },
            { username: payload.playerO, mark: 'O' as const },
          ];
          setPlayers(pList);
          const me = pList.find((p) => p.username === user.username);
          if (me) setMyMark(me.mark);
          setOpponentLeft(false);
        } else if (event === 'MOVE_MADE') {
          setBoard(payload.board);
          setCurrentTurn(payload.nextTurn);
        } else if (event === 'GAME_OVER') {
          setBoard(payload.board);
          setStatus('COMPLETED');
          setOutcome(payload.outcome);
          setWinner(payload.winner);
          setWinningLine(payload.winningLine);

          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (payload.winner === user.username && !reduceMotion) {
            confetti({
              particleCount: 90,
              spread: 75,
              origin: { y: 0.6 },
              colors: ['#D99A4E', '#DCE8F5', '#91B7CE'],
            });
          }
          if (onMatchFinished) onMatchFinished();
        } else if (event === 'REMATCH_REQUESTED') {
          setRematchRequestedBy(payload.player);
        } else if (event === 'REMATCH_STARTED') {
          setStatus('ACTIVE');
          setBoard(payload.board);
          setCurrentTurn(payload.currentTurn);
          setOutcome(null);
          setWinner(null);
          setWinningLine(null);
          setRematchRequestedBy(null);
          const pList = [
            { username: payload.playerX, mark: 'X' as const },
            { username: payload.playerO, mark: 'O' as const },
          ];
          setPlayers(pList);
          const me = pList.find((p) => p.username === user.username);
          if (me) setMyMark(me.mark);
        } else if (event === 'CHAT_MESSAGE') {
          setChatMessages((prev) => [...prev, payload]);
        } else if (event === 'PLAYER_LEFT') {
          setOpponentLeft(true);
          setChatMessages((prev) => [
            ...prev,
            { sender: 'System', text: `${payload.username} left the room.`, time: Date.now() },
          ]);
        } else if (event === 'ERROR') {
          const msg = String(payload?.message || '');
          if (/full/i.test(msg)) {
            setNotice(MESSAGES.roomFull);
            leavingRef.current = true;
            ws.close();
            setInRoom(false);
            setRoomCode('');
          } else if (msg) {
            setNotice(msg);
          }
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    wsRef.current = ws;
    setRoomCode(code);
    setInRoom(true);
  };

  const handleCreateRoom = () => connectToRoom(makeRoomCode());

  const handleJoinRoom = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputCode.trim()) return;
    connectToRoom(inputCode.trim().toUpperCase());
  };

  const send = (payload: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const handleMakeMove = (position: number) => {
    if (status !== 'ACTIVE' || !myMark || currentTurn !== myMark) return;
    if (board[position] !== '.') return;
    send({ action: 'MAKE_MOVE', roomCode, username: user.username, position });
  };

  const handleRequestRematch = () => {
    send({ action: 'REQUEST_REMATCH', roomCode, username: user.username });
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !wsRef.current) return;
    send({ action: 'CHAT', roomCode, username: user.username, text: chatInput.trim() });
    setChatInput('');
  };

  const handleLeaveRoom = () => {
    leavingRef.current = true;
    if (wsRef.current) {
      send({ action: 'LEAVE_ROOM', roomCode, username: user.username });
      wsRef.current.close();
    }
    setInRoom(false);
    setRoomCode('');
    setPlayers([]);
    setChatMessages([]);
    setBoard('.........');
    setStatus('WAITING');
    setOutcome(null);
    setWinner(null);
    setWinningLine(null);
    setMyMark(null);
    setRematchRequestedBy(null);
    setOpponentLeft(false);
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setNotice(MESSAGES.genericError);
    }
  };

  const handleInviteFriend = async (friendName: string) => {
    try {
      const res = await api.sendInvitation(friendName, roomCode);
      if (res && res.error) {
        setNotice(res.error);
        return;
      }
      setInviteSent(friendName);
      setTimeout(() => setInviteSent(null), 3000);
    } catch (e) {
      console.error(e);
      setNotice(MESSAGES.genericError);
    }
  };

  const statusLine = (() => {
    if (connection === 'connecting') return 'Connecting…';
    if (connection === 'reconnecting') return 'Reconnecting…';
    if (status === 'WAITING') return 'Waiting for another player';
    if (opponentLeft && status !== 'COMPLETED') return 'Opponent disconnected';
    if (status === 'ACTIVE') return currentTurn === myMark ? 'Your turn' : "Opponent's turn";
    if (outcome === 'DRAW') return "It's a draw.";
    return winner === user.username ? 'You won!' : 'You lost.';
  })();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-10">
      {!inRoom ? (
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-[#DCE8F5]">Play Online</h1>
          <p className="mt-1.5 text-base text-[#B4C2D1]">Create a room or join a friend for a match.</p>

          {notice && (
            <p role="alert" className="mt-4 text-sm text-[#FF9AA2]">
              {notice}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <section className="surface-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#DCE8F5]">Create Room</h2>
              <p className="text-sm text-[#9AA9BA] mt-1">Create a private room and share the code with a friend.</p>
              <button
                type="button"
                onClick={handleCreateRoom}
                className="btn-amber-primary mt-4 w-full py-3 rounded-lg text-sm cursor-pointer"
              >
                Create Room
              </button>
            </section>

            <section className="surface-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-[#DCE8F5]">Join Room</h2>
              <p className="text-sm text-[#9AA9BA] mt-1">Enter the room code to join the match.</p>
              <form onSubmit={handleJoinRoom} className="mt-4 flex gap-2">
                <label htmlFor="room-code" className="sr-only">Room code</label>
                <input
                  id="room-code"
                  type="text"
                  placeholder="Room code"
                  autoComplete="off"
                  autoCapitalize="characters"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-[#080D16] border border-[#3A4A5E] text-[#DCE8F5] font-mono text-base sm:text-sm uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder-[#7F90A3]"
                />
                <button
                  type="submit"
                  disabled={!inputCode.trim()}
                  className="px-6 py-3 rounded-lg bg-[#172231] hover:bg-[#203445] border border-[#3A4A5E] text-[#E2A65C] text-sm font-semibold disabled:opacity-50 cursor-pointer"
                >
                  Join Room
                </button>
              </form>
            </section>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#9AA9BA]">Room</span>
                <span className="font-mono text-lg font-semibold text-[#E2A65C]">{roomCode}</span>
                <button
                  type="button"
                  onClick={copyRoomCode}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#172231] hover:bg-[#203445] text-xs text-[#DCE8F5] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#32C997]" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                  {copied ? 'Copied' : 'Copy Room Code'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleLeaveRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#F16D78]/40 text-[#FF9AA2] hover:bg-[#F16D78]/10 text-sm cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Leave Room
              </button>
            </div>

            <p className="mb-1 text-lg font-semibold text-[#DCE8F5]" role="status" aria-live="polite">
              {statusLine}
            </p>
            {status === 'WAITING' && connection === 'connected' && (
              <p className="mb-4 text-sm text-[#9AA9BA] text-center">
                Share the code <span className="font-mono text-[#E2A65C]">{roomCode}</span> with a friend to start.
              </p>
            )}
            {status === 'ACTIVE' && myMark && <p className="mb-4 text-sm text-[#9AA9BA]">You are playing as {myMark}.</p>}
            {notice && (
              <p role="alert" className="mb-3 text-sm text-[#FF9AA2]">
                {notice}
              </p>
            )}

            <div className="p-4 rounded-2xl bg-[#080D16]/90 border border-[#293748]/70">
              <div className="grid grid-cols-3 gap-2.5 w-[17rem] h-[17rem] sm:w-[22rem] sm:h-[22rem]" role="grid" aria-label="Game board">
                {board.split('').map((cell, idx) => {
                  const isWinningCell = winningLine?.includes(idx);
                  const isClickable = cell === '.' && status === 'ACTIVE' && currentTurn === myMark && connection === 'connected';

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => handleMakeMove(idx)}
                      aria-label={cell === '.' ? `Empty cell ${idx + 1}` : `Cell ${idx + 1}, ${cell}`}
                      className={`rounded-xl border flex items-center justify-center transition-colors select-none ${
                        isWinningCell ? 'bg-[#D99A4E]/20 border-[#D99A4E]' : 'bg-[#111B2A]/80 border-[#293748]'
                      } ${isClickable ? 'cursor-pointer hover:bg-[#172231] hover:border-[#91B7CE]/50' : 'cursor-default'}`}
                    >
                      {cell !== '.' && (
                        <span aria-hidden="true" className={`text-4xl sm:text-5xl font-bold ${cell === 'X' ? 'text-[#DCE8F5]' : 'text-[#E2A65C]'}`}>
                          {cell === 'X' ? '✕' : '◯'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {status === 'COMPLETED' && (
              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="sr-only">Match complete</p>
                <button
                  type="button"
                  onClick={handleRequestRematch}
                  disabled={rematchRequestedBy === user.username}
                  className="btn-amber-primary px-6 py-2.5 rounded-lg text-sm flex items-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  {rematchRequestedBy === user.username
                    ? 'Waiting for opponent…'
                    : rematchRequestedBy
                    ? 'Accept Rematch'
                    : 'Rematch'}
                </button>
                {rematchRequestedBy && rematchRequestedBy !== user.username && (
                  <span className="text-sm text-[#E2A65C]">Your opponent wants a rematch.</span>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-4 w-full">
            {friendsList.length > 0 && status === 'WAITING' && (
              <section className="surface-card rounded-2xl p-4">
                <h2 className="text-base font-semibold text-[#DCE8F5] mb-2">Invite a Friend</h2>
                <ul className="space-y-1.5">
                  {friendsList.map((f) => (
                    <li key={f} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#080D16]">
                      <span className="text-sm text-[#DCE8F5] truncate">{f}</span>
                      <button
                        type="button"
                        onClick={() => handleInviteFriend(f)}
                        className="px-3 py-1.5 rounded-lg bg-[#D99A4E]/15 hover:bg-[#D99A4E]/25 text-[#E2A65C] border border-[#D99A4E]/40 text-xs font-medium cursor-pointer"
                      >
                        {inviteSent === f ? 'Invitation sent' : 'Invite'}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="surface-card rounded-2xl flex flex-col h-80 overflow-hidden">
              <h2 className="px-4 py-3 text-base font-semibold text-[#DCE8F5] border-b border-[#293748]/60">Chat</h2>

              <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm" aria-live="polite">
                {chatMessages.length === 0 ? (
                  <p className="py-10 text-center text-[#9AA9BA]">No messages yet.</p>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg ${
                        msg.sender === user.username
                          ? 'bg-[#172231] text-[#DCE8F5] ml-6'
                          : msg.sender === 'System'
                          ? 'text-[#9AA9BA] text-center text-xs'
                          : 'bg-[#080D16] text-[#B9D3E3] mr-6'
                      }`}
                    >
                      {msg.sender !== 'System' && (
                        <div className="flex justify-between text-xs text-[#9AA9BA] mb-0.5">
                          <span className="font-semibold">{msg.sender}</span>
                          <span>{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                      <p className="leading-relaxed break-words">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendChat} className="p-2.5 border-t border-[#293748]/60 flex gap-2">
                <label htmlFor="chat-input" className="sr-only">Message</label>
                <input
                  id="chat-input"
                  type="text"
                  placeholder="Type a message"
                  autoComplete="off"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#080D16] border border-[#3A4A5E] text-[#DCE8F5] text-base sm:text-sm placeholder-[#7F90A3]"
                />
                <button
                  type="submit"
                  aria-label="Send message"
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#D99A4E] text-[#080D16] hover:bg-[#E2A65C] cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};

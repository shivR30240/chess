import React, { useState } from 'react';
import { Users, Trophy, Plus, X, ChevronRight, Award } from 'lucide-react';

export default function ChessTournamentApp() {
    const [players, setPlayers] = useState([
        { id: 1, name: 'Magnus Carlsen', rating: 2850 },
        { id: 2, name: 'Hikaru Nakamura', rating: 2830 },
        { id: 3, name: 'Fabiano Caruana', rating: 2820 },
        { id: 4, name: 'Ding Liren', rating: 2810 },
        { id: 5, name: 'Ian Nepomniachtchi', rating: 2800 },
        { id: 6, name: 'Alireza Firouzja', rating: 2790 },
        { id: 7, name: 'Wesley So', rating: 2780 },
        { id: 8, name: 'Levon Aronian', rating: 2775 },
    ]);

    const [newPlayer, setNewPlayer] = useState({ name: '', rating: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [tournamentStarted, setTournamentStarted] = useState(false);
    const [currentRound, setCurrentRound] = useState(1);
    const [pairings, setPairings] = useState([]);
    const [roundHistory, setRoundHistory] = useState([]);

    const addPlayer = () => {
        if (newPlayer.name && newPlayer.rating && !tournamentStarted) {
            const player = {
                id: Date.now(),
                name: newPlayer.name,
                rating: parseInt(newPlayer.rating)
            };
            setPlayers([...players, player]);
            setNewPlayer({ name: '', rating: '' });
            setShowAddForm(false);
        }
    };

    const removePlayer = (id) => {
        if (!tournamentStarted) {
            setPlayers(players.filter(p => p.id !== id));
        }
    };

    const startTournament = () => {
        if (players.length < 2) {
            alert('Need at least 2 players to start tournament');
            return;
        }
        setTournamentStarted(true);
        createPairings(players);
    };

    const createPairings = (activePlayers) => {
        const sorted = [...activePlayers].sort((a, b) => b.rating - a.rating);
        const newPairings = [];

        // If odd number of players, lowest rated gets a BYE (auto-advance)
        let byePlayer = null;
        let playersToMatch = sorted;

        if (sorted.length % 2 !== 0) {
            byePlayer = sorted[sorted.length - 1];
            playersToMatch = sorted.slice(0, -1);
        }

        for (let i = 0; i < playersToMatch.length; i += 2) {
            if (playersToMatch[i] && playersToMatch[i + 1]) {
                newPairings.push({
                    id: Date.now() + i,
                    player1: playersToMatch[i],
                    player2: playersToMatch[i + 1],
                    winner: null
                });
            }
        }

        // Add BYE player as auto-winner
        if (byePlayer) {
            newPairings.push({
                id: Date.now() + 999,
                player1: byePlayer,
                player2: null,
                winner: byePlayer.id,
                bye: true
            });
        }

        setPairings(newPairings);
    };

    const reportResult = (pairingId, winnerId) => {
        setPairings(pairings.map(p =>
            p.id === pairingId ? { ...p, winner: winnerId } : p
        ));
    };

    const allMatchesCompleted = () => {
        return pairings.length > 0 && pairings.every(p => p.winner !== null);
    };

    const advanceToNextRound = () => {
        const winners = pairings
            .filter(p => p.winner) // Include BYE winners too
            .map(p => {
                if (p.bye) return p.player1; // BYE player advances
                if (p.winner === p.player1?.id) return p.player1;
                return p.player2;
            });

        setRoundHistory([...roundHistory, { round: currentRound, pairings: [...pairings] }]);

        if (winners.length === 1) {
            // Tournament complete
            setPairings([{
                id: Date.now(),
                player1: winners[0],
                player2: null,
                winner: winners[0].id,
                champion: true
            }]);
        } else {
            setCurrentRound(currentRound + 1);
            createPairings(winners);
        }
    };

    const resetTournament = () => {
        setTournamentStarted(false);
        setCurrentRound(1);
        setPairings([]);
        setRoundHistory([]);
    };

    const getRatingColor = (rating) => {
        if (rating >= 2800) return 'text-purple-400';
        if (rating >= 2700) return 'text-red-400';
        if (rating >= 2600) return 'text-orange-400';
        if (rating >= 2500) return 'text-yellow-400';
        return 'text-green-400';
    };

    const isChampion = pairings.length === 1 && pairings[0].champion;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-10 h-10 text-yellow-500" />
                            <div>
                                <h1 className="text-4xl font-bold">Chess Tournament</h1>
                                {tournamentStarted && (
                                    <p className="text-slate-400 text-sm mt-1">
                                        {isChampion ? '🏆 Tournament Complete!' : `Round ${currentRound}`}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {!tournamentStarted && (
                                <button
                                    onClick={() => setShowAddForm(!showAddForm)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {showAddForm ? 'Cancel' : 'Add Player'}
                                </button>
                            )}
                            {tournamentStarted ? (
                                <button
                                    onClick={resetTournament}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Reset Tournament
                                </button>
                            ) : (
                                <button
                                    onClick={startTournament}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg transition-colors font-semibold"
                                >
                                    Start Tournament
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Player Form */}
                {showAddForm && !tournamentStarted && (
                    <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
                        <h3 className="text-xl font-semibold mb-4">Add New Player</h3>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Player name"
                                value={newPlayer.name}
                                onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                            />
                            <input
                                type="number"
                                placeholder="Rating"
                                value={newPlayer.rating}
                                onChange={(e) => setNewPlayer({ ...newPlayer, rating: e.target.value })}
                                className="w-32 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                            />
                            <button
                                onClick={addPlayer}
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                )}

                {!tournamentStarted ? (
                    /* Players Registration */
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-6 h-6 text-blue-400" />
                                <h2 className="text-2xl font-semibold">Registered Players ({players.length})</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {players.map(player => (
                                <div key={player.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">{player.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Trophy className={`w-4 h-4 ${getRatingColor(player.rating)}`} />
                                            <span className={`font-bold ${getRatingColor(player.rating)}`}>
                                                {player.rating}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removePlayer(player.id)}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Tournament Pairings */
                    <div>
                        {isChampion ? (
                            /* Champion Display */
                            <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-xl p-8 border-4 border-yellow-400 text-center">
                                <Award className="w-24 h-24 mx-auto mb-4 text-yellow-200" />
                                <h2 className="text-4xl font-bold mb-2">Tournament Champion!</h2>
                                <h3 className="text-3xl font-bold mb-2">{pairings[0].player1.name}</h3>
                                <p className="text-2xl text-yellow-200">Rating: {pairings[0].player1.rating}</p>
                            </div>
                        ) : (
                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h2 className="text-2xl font-semibold mb-6">Current Matches</h2>
                                <div className="space-y-4">
                                    {pairings.map(pairing => (
                                        <div key={pairing.id} className="bg-slate-700 rounded-lg p-6">
                                            {pairing.bye ? (
                                                /* BYE - Auto Advance */
                                                <div className="flex items-center justify-center gap-4 py-4">
                                                    <div className="flex-1 bg-slate-600 rounded-lg p-4 ring-2 ring-blue-500">
                                                        <h3 className="font-semibold text-xl mb-1">{pairing.player1?.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <Trophy className={`w-4 h-4 ${getRatingColor(pairing.player1?.rating)}`} />
                                                            <span className={`font-bold ${getRatingColor(pairing.player1?.rating)}`}>
                                                                {pairing.player1?.rating}
                                                            </span>
                                                        </div>
                                                        <span className="inline-block mt-2 bg-blue-600 text-xs px-2 py-1 rounded font-semibold">
                                                            BYE - AUTO ADVANCE
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Normal Match */
                                                <div className="flex items-center justify-between gap-6">
                                                    {/* Player 1 */}
                                                    <div
                                                        className={`flex-1 bg-slate-600 rounded-lg p-4 cursor-pointer transition-all ${pairing.winner === pairing.player1?.id ? 'ring-2 ring-green-500 bg-green-900/30' : 'hover:bg-slate-500'
                                                            }`}
                                                        onClick={() => reportResult(pairing.id, pairing.player1?.id)}
                                                    >
                                                        <h3 className="font-semibold text-xl mb-1">{pairing.player1?.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <Trophy className={`w-4 h-4 ${getRatingColor(pairing.player1?.rating)}`} />
                                                            <span className={`font-bold ${getRatingColor(pairing.player1?.rating)}`}>
                                                                {pairing.player1?.rating}
                                                            </span>
                                                        </div>
                                                        {pairing.winner === pairing.player1?.id && (
                                                            <span className="inline-block mt-2 bg-green-600 text-xs px-2 py-1 rounded font-semibold">
                                                                WINNER
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="text-2xl font-bold text-slate-500">VS</div>

                                                    {/* Player 2 */}
                                                    <div
                                                        className={`flex-1 bg-slate-600 rounded-lg p-4 cursor-pointer transition-all ${pairing.winner === pairing.player2?.id ? 'ring-2 ring-green-500 bg-green-900/30' : 'hover:bg-slate-500'
                                                            }`}
                                                        onClick={() => reportResult(pairing.id, pairing.player2?.id)}
                                                    >
                                                        <h3 className="font-semibold text-xl mb-1">{pairing.player2?.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <Trophy className={`w-4 h-4 ${getRatingColor(pairing.player2?.rating)}`} />
                                                            <span className={`font-bold ${getRatingColor(pairing.player2?.rating)}`}>
                                                                {pairing.player2?.rating}
                                                            </span>
                                                        </div>
                                                        {pairing.winner === pairing.player2?.id && (
                                                            <span className="inline-block mt-2 bg-green-600 text-xs px-2 py-1 rounded font-semibold">
                                                                WINNER
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            {!pairing.bye && pairing.player1 && pairing.player2 && (
                                                <p className="text-center text-slate-400 text-sm mt-3">
                                                    Rating Difference: ±{Math.abs(pairing.player1.rating - pairing.player2.rating)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {allMatchesCompleted() && (
                                    <button
                                        onClick={advanceToNextRound}
                                        className="w-full mt-6 bg-green-600 hover:bg-green-700 px-6 py-4 rounded-lg transition-colors font-semibold text-lg flex items-center justify-center gap-2"
                                    >
                                        Advance to Next Round
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Round History */}
                        {roundHistory.length > 0 && (
                            <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
                                <h2 className="text-2xl font-semibold mb-4">Previous Rounds</h2>
                                <div className="space-y-4">
                                    {roundHistory.map((round, idx) => (
                                        <div key={idx} className="bg-slate-700 rounded-lg p-4">
                                            <h3 className="font-semibold mb-3 text-lg">Round {round.round}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {round.pairings.map(p => {
                                                    if (p.bye) {
                                                        return (
                                                            <div key={p.id} className="bg-slate-600 rounded p-3 text-sm">
                                                                <span className="text-blue-400 font-semibold">{p.player1?.name}</span>
                                                                <span className="text-slate-400"> received BYE</span>
                                                            </div>
                                                        );
                                                    }
                                                    const winner = p.winner === p.player1?.id ? p.player1 : p.player2;
                                                    const loser = p.winner === p.player1?.id ? p.player2 : p.player1;
                                                    return (
                                                        <div key={p.id} className="bg-slate-600 rounded p-3 text-sm">
                                                            <span className="text-green-400 font-semibold">{winner?.name}</span>
                                                            <span className="text-slate-400"> defeated </span>
                                                            <span className="text-slate-300">{loser?.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
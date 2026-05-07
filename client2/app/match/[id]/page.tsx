'use client';

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Trophy, Users, UserPlus } from "lucide-react";
import Image from "next/image";

interface Player {
  _id?: { $oid: string };
  name: string;
  number: number | null;
  position: string;
}

interface Event {
  type: string;
  team: string;
  player: string;
  minute: number;
}

interface LiveScore {
  tournamentName: string;
  status: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  startedAt: string;
  events: Event[];
  playersA: Player[];
  playersB: Player[];
  subsA: Player[];
  subsB: Player[];
  venue?: string;
}

interface Fixture {
  matchDate: { $date: string } | string;
  venue?: string;
  tournament?: { name: string; location: string };
}

export default function MatchDetailsPage() {
    const params = useParams();
    const fixtureId = params?.id as string;
    
    const [liveScore, setLiveScore] = useState<LiveScore | null>(null);
    const [fixture, setFixture] = useState<Fixture | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [liveTime, setLiveTime] = useState(0);

    const orderedPlayerPositions = [
        'Goalkeeper',
        'Defender', 'Center-back', 'Full-back', 'Wing-back',
        'Midfielder', 'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
        'Forward', 'Winger', 'Striker', 'Center Forward',
    ];

    useEffect(() => {
        const fetchMatchData = async () => {
            if (!fixtureId) return;
            try {
                setLoading(true);
                setError(null);

                const [liveScoreRes, fixtureRes] = await Promise.all([
                    axios.get(`https://api.footimes.com/api/livescore/fixture/${fixtureId}`),
                    axios.get(`https://api.footimes.com/api/fixtures/${fixtureId}`)
                ]);
                
                setLiveScore(liveScoreRes.data);
                setFixture(fixtureRes.data);

            } catch (err: any) {
                console.error("Failed to fetch match details:", err);
                setError("Failed to load match data. It might not be available yet.");
            } finally {
                setLoading(false);
            }
        };

        fetchMatchData();
    }, [fixtureId]);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (liveScore && liveScore.status === 'live' && liveScore.startedAt) {
            const startTime = new Date(liveScore.startedAt).getTime();
            interval = setInterval(() => {
                const now = new Date().getTime();
                setLiveTime(Math.floor((now - startTime) / 1000));
            }, 1000);
        } else {
            setLiveTime(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [liveScore]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <span className="loading loading-spinner text-pink-500"></span>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500 bg-black min-h-screen text-center mt-20">{error}</div>;
    }

    if (!liveScore || !fixture) {
        return <div className="p-4 text-gray-400 bg-black min-h-screen text-center mt-20">Match data not found.</div>;
    }

    const homeGoals = liveScore.events?.filter(event => event.type === 'goal' && event.team === liveScore.teamA) || [];
    const awayGoals = liveScore.events?.filter(event => event.type === 'goal' && event.team === liveScore.teamB) || [];

    const groupPlayersByPosition = (players: Player[]) => {
        const grouped: Record<string, Player[]> = {};
        players.forEach(player => {
            const rawPosition = player.position ? player.position.trim() : null;
            let normalizedPosition = 'Unassigned';

            if (rawPosition) {
                const matchedKnownPosition = orderedPlayerPositions.find(
                    (p) => p.toLowerCase() === rawPosition.toLowerCase()
                );
                if (matchedKnownPosition) {
                    normalizedPosition = matchedKnownPosition;
                } else {
                    normalizedPosition = rawPosition.charAt(0).toUpperCase() + rawPosition.slice(1).toLowerCase();
                }
            }

            if (!grouped[normalizedPosition]) {
                grouped[normalizedPosition] = [];
            }
            grouped[normalizedPosition].push(player);
        });
        return grouped;
    };

    const groupedPlayersA = groupPlayersByPosition(liveScore.playersA || []);
    const groupedPlayersB = groupPlayersByPosition(liveScore.playersB || []);

    const PlayerItem = ({ player }: { player: Player }) => (
        <li className="flex items-center text-sm py-2 px-3 bg-zinc-800/50 rounded-lg mb-1 border border-white/5">
            <span className="font-bold text-pink-500 w-8 text-center mr-2">
                {player.number !== null ? player.number : '-'}
            </span>
            <span className="flex-grow text-gray-200">{player.name || 'N/A'}</span>
        </li>
    );

    const renderPositionLineup = (groupedPlayers: Record<string, Player[]>) => {
        return (
            <div className="space-y-6">
                {orderedPlayerPositions.map(position => {
                    const playersAtPosition = groupedPlayers[position] || [];
                    if (playersAtPosition.length === 0) return null;

                    return (
                        <div key={position}>
                            <h5 className="text-xs font-bold text-pink-400/80 mb-2 uppercase tracking-widest">{position}</h5>
                            <ul className="space-y-1">
                                {playersAtPosition.map((player, idx) => (
                                    <PlayerItem key={idx} player={player} />
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSubstitutes = (subs: Player[], teamName: string) => {
        if (!subs || subs.length === 0) return null;
        return (
            <div className="mt-8">
                <h4 className="text-sm font-bold mb-4 flex items-center text-yellow-500 uppercase tracking-wider">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Substitutes
                </h4>
                <ul className="space-y-1">
                    {subs.map((player, idx) => (
                        <li key={idx} className="flex items-center text-sm py-2 px-3 bg-zinc-800/30 rounded-lg border border-white/5">
                            <span className="font-bold text-yellow-500 w-8 text-center mr-2">
                                {player.number !== null ? player.number : '-'}
                            </span>
                            <span className="text-gray-300">{player.name || 'N/A'}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const rawDate = typeof fixture.matchDate === 'string' ? fixture.matchDate : fixture.matchDate?.$date;
    const matchDateTime = new Date(rawDate);
    const formattedMatchDate = matchDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedKickoffTime = matchDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const displayVenue = liveScore.venue || fixture.venue || fixture.tournament?.location || 'Unknown Location';

    const formatLiveTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="p-4 bg-black min-h-screen text-white">
            <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-2xl mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                        <span className="text-lg">🏅</span>
                        {liveScore.tournamentName || fixture.tournament?.name}
                    </div>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                        liveScore.status === 'live' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        liveScore.status === 'ended' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                        {liveScore.status}
                    </span>
                </div>

                <div className="flex justify-between items-center text-center mb-8">
                    <div className="w-1/3">
                        <div className="text-lg font-bold mb-2">{liveScore.teamA}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Home</div>
                    </div>
                    <div className="w-1/3 flex flex-col items-center">
                        <div className="text-5xl font-black text-pink-500 mb-2">
                            {liveScore.scoreA} - {liveScore.scoreB}
                        </div>
                        {liveScore.status === 'live' ? (
                            <div className="flex items-center gap-2 text-xs text-green-400 font-bold">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                                {formatLiveTime(liveTime)}
                            </div>
                        ) : (
                            <div className="text-[10px] text-gray-500 font-medium">
                                {formattedMatchDate} • {formattedKickoffTime}
                            </div>
                        )}
                    </div>
                    <div className="w-1/3">
                        <div className="text-lg font-bold mb-2">{liveScore.teamB}</div>
                        <div className="text-[10px] text-gray-500 uppercase">Away</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-4 border-t border-white/5">
                    <div className="space-y-2">
                        {homeGoals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                                <Trophy className="w-3 h-3 text-yellow-500" />
                                <span className="text-gray-300">{goal.player}</span>
                                <span className="text-gray-500 font-bold">{goal.minute}'</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 text-right">
                        {awayGoals.map((goal, index) => (
                            <div key={index} className="flex items-center gap-2 justify-end text-xs">
                                <span className="text-gray-500 font-bold">{goal.minute}'</span>
                                <span className="text-gray-300">{goal.player}</span>
                                <Trophy className="w-3 h-3 text-yellow-500" />
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="text-center mt-6 text-[10px] text-gray-500 font-medium flex items-center justify-center gap-2">
                    <span className="text-gray-400">📍</span> {displayVenue}
                </div>
            </div>

            <div className="space-y-8 pb-20">
                <h3 className="text-2xl font-black text-center text-white uppercase tracking-tighter">Match Lineups</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-bold text-white">{liveScore.teamA}</h4>
                            <Users className="w-5 h-5 text-pink-500" />
                        </div>
                        {renderPositionLineup(groupedPlayersA)}
                        {renderSubstitutes(liveScore.subsA, liveScore.teamA)}
                    </div>

                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-xl font-bold text-white">{liveScore.teamB}</h4>
                            <Users className="w-5 h-5 text-pink-500" />
                        </div>
                        {renderPositionLineup(groupedPlayersB)}
                        {renderSubstitutes(liveScore.subsB, liveScore.teamB)}
                    </div>
                </div>
            </div>
        </div>
    );
}

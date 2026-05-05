import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Trophy, Users, UserPlus } from "lucide-react";

export default function MatchDetails() {
    const { id: fixtureId } = useParams();
    const [liveScore, setLiveScore] = useState(null);
    const [fixture, setFixture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liveTime, setLiveTime] = useState(0); // State to hold live match duration in seconds

    // Define major player positions for structured display.
    // Ensure these match the *expected* standardized format (e.g., "Central Midfielder").
    const orderedPlayerPositions = [
        'Goalkeeper',
        'Defender', 'Center-back', 'Full-back', 'Wing-back',
        'Midfielder', 'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
        'Forward', 'Winger', 'Striker', 'Center Forward',
    ];

    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("Frontend: Fetching match details for fixtureId:", fixtureId);

                const liveScoreRes = await axios.get(`https://api.footimes.com/api/livescore/fixture/${fixtureId}`);
                console.log("Frontend: Live score data fetched:", liveScoreRes.data);
                setLiveScore(liveScoreRes.data);

                // Assuming your fixture API can also return tournament details if populated
                // Or you might need a separate call to fetch tournament details if `fixture.tournament` is just an ID
                const fixtureRes = await axios.get(`https://api.footimes.com/api/fixtures/${fixtureId}`);
                console.log("Frontend: Fixture data fetched:", fixtureRes.data);
                setFixture(fixtureRes.data);

            } catch (err) {
                console.error("Frontend: Failed to fetch match details:", err);
                let errorMessage = "Failed to load match data. Please check the ID or try again later.";

                if (err.response) {
                    console.error("Frontend: Server response error:", err.response.data);
                    if (err.response.status === 404) {
                        errorMessage = "Match or live score data not found for this ID. It might not exist or the ID is incorrect.";
                    } else if (err.response.status === 400) {
                        errorMessage = "Invalid Match ID provided. Please check the URL.";
                    } else {
                        errorMessage = `Server error: ${err.response.status} - ${err.response.data?.error || err.response.statusText}`;
                    }
                } else if (err.request) {
                    errorMessage = "Network error: No response from server. Is the backend running and accessible?";
                } else {
                    errorMessage = `Request setup error: ${err.message}`;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (fixtureId) {
            fetchMatchData();
        } else {
            setError("Match ID not provided in the URL.");
            setLoading(false);
        }
    }, [fixtureId]);

    // Effect for real-time live match duration
    useEffect(() => {
        let interval = null;
        if (liveScore && liveScore.status === 'live' && liveScore.startedAt) {
            const startTime = new Date(liveScore.startedAt).getTime();
            interval = setInterval(() => {
                const now = new Date().getTime();
                setLiveTime(Math.floor((now - startTime) / 1000)); // Time in seconds
            }, 1000);
        } else {
            if (interval) {
                clearInterval(interval);
            }
            setLiveTime(0); // Reset if not live or startedAt is missing
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [liveScore]);

    if (loading) {
        return <div className="p-4 text-white bg-black min-h-screen text-center">Loading match details...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 bg-black min-h-screen text-center">{error}</div>;
    }

    if (!liveScore || !fixture) {
        return <div className="p-4 text-gray-400 bg-black min-h-screen text-center">Match data not fully loaded or found.</div>;
    }

    const homeGoals = liveScore.events?.filter(event => event.type === 'goal' && event.team === liveScore.teamA) || [];
    const awayGoals = liveScore.events?.filter(event => event.type === 'goal' && event.team === liveScore.teamB) || [];

    // --- CRITICAL FIX: Enhanced Helper function to group players by position ---
    const groupPlayersByPosition = (players) => {
        const grouped = {};
        players.forEach(player => {
            // Trim spaces and convert to a consistent casing (e.g., Title Case)
            // This ensures "central midfielder " (with space) or "central midfielder" matches "Central Midfielder"
            const rawPosition = player.position ? player.position.trim() : null;
            let normalizedPosition = 'Unassigned'; // Default for players without a position

            if (rawPosition) {
                // Find if the raw position matches any of our known positions (case-insensitive, space-insensitive)
                const matchedKnownPosition = orderedPlayerPositions.find(
                    (p) => p.toLowerCase() === rawPosition.toLowerCase()
                );

                if (matchedKnownPosition) {
                    normalizedPosition = matchedKnownPosition; // Use the exact string from our ordered list
                } else {
                    // If it's not in our ordered list, but still has a name, use its own name (Title Case)
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

    // Helper function to render a single player item
    const PlayerItem = ({ player }) => (
        <li className="flex items-center text-sm py-1 px-2 bg-zinc-700 rounded mb-1 last:mb-0">
            <span className="font-bold text-yellow-300 w-6 text-center mr-2">
                {player.number !== null ? player.number : '-'}
            </span>
            <span className="flex-grow text-gray-100">{player.name || 'N/A'}</span>
        </li>
    );

    // Helper function to render lineup section by position
    const renderPositionLineup = (groupedPlayers) => {
        return (
            <div className="space-y-4">
                {orderedPlayerPositions.map(position => {
                    const playersAtPosition = groupedPlayers[position] || [];

                    if (playersAtPosition.length === 0) {
                        return null; // Don't render this position if no players
                    }

                    return (
                        <div key={position}>
                            <h5 className="text-md font-medium text-blue-300 mb-1">{position}</h5>
                            <ul className="divide-y divide-zinc-600">
                                {playersAtPosition.map((player) => (
                                    <PlayerItem key={player._id?.$oid || player.name + player.number} player={player} />
                                ))}
                            </ul>
                        </div>
                    );
                })}
                {/* Render 'Unassigned' players if any */}
                {groupedPlayers['Unassigned'] && groupedPlayers['Unassigned'].length > 0 && (
                    <div>
                        <h5 className="text-md font-medium text-red-300 mb-1">Unassigned Players</h5>
                        <ul className="divide-y divide-zinc-600">
                            {groupedPlayers['Unassigned'].map((player) => (
                                <PlayerItem key={player._id?.$oid || player.name + player.number} player={player} />
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    // Helper function to render substitutes
    const renderSubstitutes = (subs, teamName) => {
        if (!subs || subs.length === 0) {
            return (
                <div className="text-gray-500 text-sm italic">
                    <UserPlus className="inline-block w-4 h-4 mr-1 text-gray-600" />
                    No substitutes listed for {teamName}.
                </div>
            );
        }
        return (
            <div>
                <h4 className="text-lg font-semibold mb-2 flex items-center text-yellow-200">
                    <UserPlus className="w-5 h-5 mr-2 text-yellow-400" />
                    Substitutes
                </h4>
                <ul className="space-y-1">
                    {subs.map((player) => (
                        <li key={player._id?.$oid || player.name + player.number} className="flex items-center text-sm">
                            <span className="font-bold text-yellow-300 w-6 text-right mr-2">
                                {player.number !== null ? player.number : '-'}
                            </span>
                            <span className="text-gray-200">{player.name || 'N/A'}</span>
                            {player.position && (
                                <span className="ml-2 text-xs text-gray-400 italic">({player.position})</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // Format match date and kickoff time
    const matchDateTime = new Date(fixture.matchDate.$date);
    const formattedMatchDate = matchDateTime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedKickoffTime = matchDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Determine venue (fixture venue or tournament location)
    const displayVenue = fixture.venue || (fixture.tournament && fixture.tournament.location) || 'Unknown Location';

    // Format live time
    const formatLiveTime = (seconds) => {
        if (seconds < 60) {
            return `${seconds}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <div className="p-4 bg-black min-h-screen">
            {/* Main Score Card */}
            <div className="bg-zinc-900 text-white rounded-lg p-4 w-full max-w-full shadow-lg mb-6">
                <div className="flex justify-between items-center mb-2 text-sm">
                    <div className="flex items-center gap-1">
                        <span className="text-white-500">🏅{liveScore.tournamentName || fixture.tournament?.name || 'Unknown Tournament'}</span>
                    </div>
                    <span className={`text-black text-xs px-2 py-0.5 rounded-full font-semibold ${
                        liveScore.status === 'live' ? 'bg-green-500 animate-pulse' :
                        liveScore.status === 'ended' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}>
                        ● {liveScore.status ? liveScore.status.toUpperCase() : 'N/A'}
                    </span>
                </div>

                <div className="flex justify-between items-center text-center">
                    <div className="flex flex-col items-center justify-center w-1/3">
                        {/* Add img tags for team logos here if you have them */}
                        <span className="text-sm sm:text-base font-medium">{liveScore.teamA}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center w-1/3">
                        <div className="text-3xl sm:text-4xl font-bold text-red-400">
                            {liveScore.scoreA} - {liveScore.scoreB}
                        </div>
                        {liveScore.status === 'live' && liveScore.startedAt ? (
                            <span className="text-xs text-gray-400 mt-1">Live: {formatLiveTime(liveTime)}</span>
                        ) : (
                            <span className="text-xs text-gray-400 mt-1">
                                {formattedMatchDate} at {formattedKickoffTime}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-center w-1/3">
                        {/* Add img tags for team logos here if you have them */}
                        <span className="text-sm sm:text-base font-medium">{liveScore.teamB}</span>
                    </div>
                </div>

                <div className="mt-3 border-t border-zinc-700 pt-2 text-xs text-gray-300 flex justify-between items-center">
                    <div className="text-left w-1/2 pr-2">
                        {homeGoals.length > 0 ? (
                            homeGoals.map((goal, index) => (
                                <div key={`home-goal-${index}`} className="flex justify-between items-center">
                                    <span>{goal.player || 'Unknown'}</span>
                                    <span className="text-yellow-400 ml-1"><Trophy className="inline-block w-3 h-3"/> {goal.minute}'</span>
                                </div>
                            ))
                        ) : (
                                // No goals yet
                            <div className="text-gray-500 text-center italic"></div>
                        )}
                    </div>
                    <div className="text-right w-1/2 pl-2">
                        {awayGoals.length > 0 ? (
                            awayGoals.map((goal, index) => (
                                <div key={`away-goal-${index}`} className="flex justify-between items-center">
                                    <span className="text-yellow-400 mr-1"><Trophy className="inline-block w-3 h-3"/> {goal.minute}'</span>
                                    <span>{goal.player || 'Unknown'}</span>
                                </div>
                            ))
                        ) : (
                                // No goals yet
                            <div className="text-gray-500 text-center italic"></div>
                        )}
                    </div>
                </div>
                
                {/* Venue Display */}
                <div className="text-center mt-3 text-xs text-gray-400">
                    <span className="font-semibold">Venue:</span> {displayVenue}
                </div>
            </div>

            {/* Team Lineups Section */}
            <div className="bg-zinc-900 mb-20 text-white rounded-lg p-4 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-center text-blue-300">Team Lineups</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Team A Lineup */}
                    <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <h4 className="text-2xl font-bold text-center mb-4 text-blue-400">{liveScore.teamA}</h4>
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2 flex items-center text-green-300">
                                <Users className="w-5 h-5 mr-2 text-green-400" />
                                Starting XI
                            </h4>
                            {renderPositionLineup(groupedPlayersA)}
                        </div>
                        {renderSubstitutes(liveScore.subsA, liveScore.teamA)}
                    </div>

                    {/* Team B Lineup */}
                    <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                        <h4 className="text-2xl font-bold text-center mb-4 text-green-400">{liveScore.teamB}</h4>
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2 flex items-center text-green-300">
                                <Users className="w-5 h-5 mr-2 text-green-400" />
                                Starting XI
                            </h4>
                            {renderPositionLineup(groupedPlayersB)}
                        </div>
                        {renderSubstitutes(liveScore.subsB, liveScore.teamB)}
                    </div>
                </div>
            </div>
        </div>
    );
}
import React from "react";
import axios from "axios";
import Image from "next/image";
import { Metadata } from "next";
import TournamentDetailsClient from "./TournamentDetailsClient";
import { extractIdFromSlug } from "@/utils/slugify";

interface Tournament {
  _id: string;
  name: string;
  logo?: string;
  location?: string;
}

async function getTournament(slugArray: string[]): Promise<Tournament | null> {
  try {
    if (!slugArray || slugArray.length === 0) return null;
    const slug = slugArray[0];
    const id = extractIdFromSlug(slug);
    const res = await axios.get(`https://api.footimes.com/api/tournaments/${id}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await getTournament(slug);
  if (!tournament) return { title: "Tournament Not Found | Footimes" };

  return {
    title: `${tournament.name} - Fixtures, Live Scores & Standings`,
    description: `Follow ${tournament.name} on Footimes. Get live scores, match fixtures, team standings, and location details for ${tournament.location || 'this tournament'}.`,
    openGraph: {
      title: `${tournament.name} | Footimes`,
      description: `Live updates and fixtures for ${tournament.name}.`,
      images: [{ url: tournament.logo || "/assets/tournament-default.jpg" }],
    },
  };
}

export default async function TournamentDetailsPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const tournament = await getTournament(slug);

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#121212] text-white">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-zinc-500">Tournament not found</p>
      </div>
    );
  }

  return <TournamentDetailsClient id={tournament._id} initialInfo={tournament} />;
}

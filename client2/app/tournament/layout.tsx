import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Football Tournaments & Leagues",
  description: "Explore all active and upcoming football tournaments, leagues, and championships on Footimes. View match schedules, standings, and tournament history.",
  openGraph: {
    title: "Football Tournaments | Footimes",
    description: "Browse major football tournaments and local leagues. Stay updated with fixtures and results.",
  },
};

export default function TournamentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

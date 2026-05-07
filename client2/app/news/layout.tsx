import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latest Football News & Updates | Footimes",
  description: "Stay updated with the latest football news, match reports, and tournament updates from around the world on Footimes.",
  openGraph: {
    title: "Latest Football News | Footimes",
    description: "Real-time football updates, tournament news, and exclusive match reports.",
    images: ["/assets/news-banner.jpg"], // Ensure this asset exists or use a valid URL
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

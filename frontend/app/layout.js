import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "NextMovies 🎬",
  description: "Explore the latest movies built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white font-sans">
        <Navbar />
        <main className="max-w-6xl mx-auto py-8 px-4">{children}</main>
      </body>
    </html>
  );
}

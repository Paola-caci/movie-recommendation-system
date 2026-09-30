export const metadata = {
  title: "About | NextMovies",
  description: "Learn more about the NextMovies project, its features, and technology stack.",
};

export default function AboutPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-8 text-center">About NextMovies 🎬</h1>

      <div className="space-y-6">
        {/* What is NextMovies */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-3">What is NextMovies?</h2>
          <p className="text-gray-300">
            NextMovies is a web application designed to help users discover and explore movies easily. 
            It combines <span className="text-yellow-400 font-medium">real-time search</span>, 
            <span className="text-yellow-400 font-medium"> AI-powered recommendations</span>, 
            and a <span className="text-yellow-400 font-medium">modern responsive interface</span>.
          </p>
        </div>

        {/* Features */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-3">Features</h2>
          <ul className="text-gray-300 space-y-2 list-disc list-inside">
            <li>Real-time movie search with suggestions and filtering</li>
            <li>Personalized recommendations using <span className="text-yellow-400 font-medium">collaborative filtering</span> (SVD) and <span className="text-yellow-400 font-medium">content-based TF-IDF</span> algorithms</li>
            <li>Hybrid recommendation combining user tags and AI predictions</li>
            <li>Responsive UI built with Tailwind CSS</li>
          </ul>
        </div>

        {/* Technology */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-3">Technology Stack</h2>
          <p className="text-gray-300">
            This project is built using <span className="text-yellow-400 font-medium">Next.js 14</span> for server-side rendering and routing, 
            <span className="text-yellow-400 font-medium"> Tailwind CSS</span> for styling, 
            and <span className="text-yellow-400 font-medium">React Hooks</span> for dynamic functionality. 
            The recommendation engine leverages <span className="text-yellow-400 font-medium">TF-IDF</span>, 
            <span className="text-yellow-400 font-medium"> SVD</span>, and <span className="text-yellow-400 font-medium">cosine similarity</span> 
            to suggest movies based on user preferences and movie content.
          </p>
        </div>

        {/* Why Choose NextMovies */}
        <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 shadow-lg">
          <h2 className="text-xl font-bold text-white mb-3">Why Choose NextMovies?</h2>
          <ul className="text-gray-300 space-y-2 list-disc list-inside">
            <li>Discover hidden gems with AI-powered recommendations</li>
            <li>Fast and interactive search across thousands of movies</li>
            <li>Hybrid algorithm ensures personalized results for every user</li>
            <li>Clean, modern design optimized for all devices</li>
            <li>Open-source project for learning and experimentation</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

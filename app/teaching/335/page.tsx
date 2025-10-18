import Link from "next/link";

export default function Teaching335() {
  const chapters = [
    { number: 1, title: "Chapter 1", path: "/teaching/335/chapter-1" },
    { number: 2, title: "Chapter 2", path: "/teaching/335/chapter-2" },
    { number: 3, title: "Chapter 3", path: "/teaching/335/chapter-3" },
    { number: 4, title: "Chapter 4", path: "/teaching/335/chapter-4" },
    { number: 5, title: "Chapter 5", path: "/teaching/335/chapter-5" },
    { number: 6, title: "Chapter 6", path: "/teaching/335/chapter-6" },
    { number: 7, title: "Chapter 7", path: "/teaching/335/chapter-7" },
    { number: 8, title: "Chapter 8", path: "/teaching/335/chapter-8" },
    { number: 9, title: "Chapter 9: Incremental Earnings Game", path: "/teaching/335/chapter-9" },
  ];

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Finance 335 - Teaching Materials</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => (
            <Link
              key={chapter.number}
              href={chapter.path}
              className="block p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 shadow-[4px_4px_0_#000] hover:shadow-[8px_8px_0_#000] transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-semibold mb-2">{chapter.title}</h2>
              <p className="text-sm opacity-75">
                {chapter.number === 9 
                  ? "Interactive game for learning incremental earnings calculations with typewriter lesson and practice exercises."
                  : `Week ${chapter.number} materials and exercises.`
                }
              </p>
              <div className="mt-4 text-sm font-medium">
                Go to Chapter {chapter.number} →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 border-2 border-black bg-neutral-50">
          <h3 className="text-xl font-semibold mb-4">About Chapter 9</h3>
          <p className="text-sm leading-relaxed">
            The Incremental Earnings game provides an interactive way to learn financial calculations. 
            It features a typewriter-style lesson that explains the formula, followed by hands-on practice 
            with randomly generated examples. Students learn to calculate EBIT and incremental earnings 
            while understanding how taxes affect cash flows.
          </p>
        </div>
      </div>
    </div>
  );
}
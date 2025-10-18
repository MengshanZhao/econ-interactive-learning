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
    { number: 9, title: "Chapter 9", path: "/teaching/335/chapter-9" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Finance 335 - Teaching Materials</h1>
          <p className="text-xl max-w-3xl text-foreground mb-12">
            Course materials and interactive exercises for Business Finance. Access weekly chapters and practice problems.
          </p>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-foreground">Course Chapters</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <Link
                key={chapter.number}
                href={chapter.path}
                className="bg-card rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 border border-border"
              >
                <h3 className="text-xl font-semibold mb-2 text-foreground">{chapter.title}</h3>
                <p className="text-foreground text-sm mb-4">
                  {chapter.number === 9 
                    ? "Interactive Incremental Earnings game with typewriter lesson and practice exercises."
                    : `Week ${chapter.number} materials and exercises.`
                  }
                </p>
                <div className="text-sm font-medium text-foreground">
                  Go to Chapter {chapter.number} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
export default function Chapter1Page() {
  return (
    <div className="min-h-screen bg-background">
      <section className="metallic-bg text-foreground py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Chapter 1: Tax of Corporation Earning</h1>
          <p className="text-foreground mt-2">ECONS 335 Interactive Practice</p>
        </div>
      </section>

      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="rounded-lg overflow-hidden border border-[color:hsl(var(--border))] bg-card">
            <iframe
              src="/games/chapter-1.html"
              title="Chapter 1 Game: Tax of Corporation Earning"
              className="w-full"
              style={{ height: "90vh", border: 0 }}
            />
          </div>
        </div>
      </section>
    </div>
  )
}


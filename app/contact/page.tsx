import { Mail, MapPin, Phone, Linkedin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Me</h1>
          <p className="text-xl max-w-3xl">
            Feel free to reach out if you're interested in my research, potential collaborations, or have any questions
            about my work.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div>
              <h2 className="text-3xl font-bold mb-8 text-foreground">Contact Information</h2>
              <div className="bg-card rounded-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-3 rounded-lg mr-4">
                      <MapPin className="h-6 w-6 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Location</h3>
                      <p className="text-foreground">
                        School of Economic Sciences
                        <br />
                        Washington State University
                        <br />
                        Pullman, Washington, US
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-3 rounded-lg mr-4">
                      <Mail className="h-6 w-6 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Email</h3>
                      <a href="mailto:mengshan.zhao@wsu.edu" className="text-foreground hover:text-shine-purple">
                        mengshan.zhao@wsu.edu
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-3 rounded-lg mr-4">
                      <Phone className="h-6 w-6 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Phone</h3>
                      <a href="tel:+16083347814" className="text-foreground hover:text-shine-purple">
                        (608) 334-7814
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-yellow-400 p-3 rounded-lg mr-4">
                      <Linkedin className="h-6 w-6 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">LinkedIn</h3>
                      <a
                        href="https://www.linkedin.com/in/mengshan-zhao-222422194/"
                        className="text-foreground hover:text-shine-purple"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        linkedin.com/in/mengshan-zhao-222422194
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-foreground">Office Hours</h3>
                <div className="bg-card rounded-lg p-6">
                  <p className="text-foreground mb-4">
                    I'm available for meetings by appointment. Please email me to schedule a time.
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold">Virtual Office Hours:</span> Monday-Friday, 10:00 am - 5:00 PM (Pacific Time)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

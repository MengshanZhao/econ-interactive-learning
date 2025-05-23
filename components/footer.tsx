import { Mail, Phone, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-700 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-center md:text-left">© {new Date().getFullYear()} Mengshan Zhao. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="mailto:mengshan.zhao@wsu.edu" className="text-gray-600 hover:text-shine-dark">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </a>
            <a href="tel:+16083347814" className="text-gray-600 hover:text-shine-dark">
              <Phone className="h-5 w-5" />
              <span className="sr-only">Phone</span>
            </a>
            <a
              href="https://www.linkedin.com/in/mengshan-zhao-222422194/"
              className="text-gray-600 hover:text-shine-dark"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

#!/bin/bash

# Script to compile CV from LaTeX to PDF
# Make sure you have LaTeX installed (e.g., texlive-full on Ubuntu/Debian)

echo "Compiling CV from LaTeX to PDF..."

# Navigate to the public directory where CV.tex is located
cd public

# Compile the LaTeX file to PDF
pdflatex -interaction=nonstopmode CV.tex

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "✅ CV compiled successfully! PDF generated: public/CV.pdf"
    echo "You can now download the PDF from your website."
else
    echo "❌ LaTeX compilation failed. Please check for errors above."
    echo "Make sure you have LaTeX installed (e.g., sudo apt-get install texlive-full)"
fi

#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p public/images
 
# Download marker images
curl -o public/images/marker-icon.png https://raw.githubusercontent.com/Leaflet/Leaflet/main/dist/images/marker-icon.png
curl -o public/images/marker-icon-2x.png https://raw.githubusercontent.com/Leaflet/Leaflet/main/dist/images/marker-icon-2x.png
curl -o public/images/marker-shadow.png https://raw.githubusercontent.com/Leaflet/Leaflet/main/dist/images/marker-shadow.png 
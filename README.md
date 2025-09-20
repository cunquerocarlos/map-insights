# Vercel URL
https://map-insights.vercel.app/

# What I built vs AI
AI generated the score calculations, render the map and some css styles, I did the other things

# Approach about solving the problem
### The Problem
I wanted to build something that tells you if a location is actually walkable and has good amenities nearby. Like, is this apartment in a food desert or can you actually walk to stuff?

### My Approach
1. **Getting the address right**
   - Used LocationIQ to autocomplete addresses as you type
   - Added a delay so it doesn't cause rate limit to the API 
   - Extract the coordinates once you pick an address

2. **Finding what's nearby**
   - Hit up the Overpass API to get all the restaurants, schools, etc. around that spot
   - Look at different distances (1km for walking, 3km for driving)

3. **Making sense of the data**
   - Created a scoring system where schools and hospitals matter more than restaurants
   - Counted streets to figure out if it's urban or suburban
   - Turned everything into easy-to-read scores out of 100

4. **Showing it all off**
   - Interactive map with custom markers for each type of amenity
   - Color-coded scores so you can quickly see if it's good or bad
   - Save your searches so you can compare different places

# Assumptions or design decisions

### Technical Stuff I Decided
- **APIs**: Went with LocationIQ + Overpass instead of Google Maps because it's free and has good data
- **State management**: Used React Context instead of Redux because this app isn't huge and Context is simpler
- **Map library**: Picked Leaflet over Google Maps - it's free and I can customize the markers however I want

### UX
- 1km is a good "walking distance" - not too far, not too close
- Colors make scores way easier to understand than just numbers

# Heal Leaf

A responsive wellbeing-support prototype for a hackathon/demo.

## Included flow
- Register / sign in with name, email and date of birth (no age field)
- 15-question non-diagnostic wellbeing check-in
- LOW / MODERATE / HIGH / CRITICAL report
- Category breakdown for Stress, Mood, Difficult experiences and Wellbeing
- Recommendations matched to the latest completed check-in
- 4–5 routines in each activity section
- Individual routine duration + countdown timer + instructions
- Each routine can be recorded only once for a given test; a new 15-question test unlocks a fresh set
- Dashboard shows Test 1, Test 2, etc. with date/time and score
- Clicking a test opens activity categories; clicking a category expands only the routines completed for that test
- Recorded time is shown even when it is 0 minutes
- About/team section
- Mobile-friendly navigation

## Logo
The supplied logo is already included at `client/public/logo.jpeg`. The UI loads `/logo.jpeg` first and has safe filename fallbacks.

## Run locally
```bash
npm install
npm run build
npm start
```
Open `http://localhost:4000`.

## Important
This is a non-diagnostic wellbeing screening prototype. It does not diagnose depression, trauma, or any other condition and its activity suggestions are general wellbeing options, not medical treatment.

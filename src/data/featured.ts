// The centerpiece project, shown identically on the home page and the projects
// page. Defined once here so the two cannot drift apart.
export const cinemetrics = {
  title: 'cinemetrics',
  tagline: 'Eight years of film-watching, end to end',
  description:
    'A full analytics pipeline over my own Letterboxd history. I enrich the ratings from the TMDB and OMDb APIs, model them in DuckDB with dbt, and serve the result as a static cross-filtered dashboard with an ML recommendation engine. Every stage runs in a CI runner or in your browser, avoiding the need for an application server or a hosted database.',
  highlights: [
    'Every chart responds to every filter in real time and every view generates a shareable URL.',
    'Guided stories surface a finding in one tap. Each one filters the charts and annotates what they show.',
    'The recommendation engine ranks candidates by cosine similarity to a taste vector built from my ratings, then explains why each one surfaced.',
    'A GitHub Action pulls new ratings every day, retrains the embeddings, and redeploys.',
  ],
  tags: ['Python', 'dbt', 'DuckDB', 'scikit-learn', 'Next.js', 'D3', 'Cloudflare R2'],
  href: 'https://www.featheranalytics.dev/cinemetrics/',
};

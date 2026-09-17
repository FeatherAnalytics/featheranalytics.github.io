import type { ImageMetadata } from 'astro';
import urbanstackImage from '../assets/projects/urbanstack.png';
import worldcupImage from '../assets/projects/worldcup-2026.png';
import capitalFlowsImage from '../assets/projects/capital-flows-city.png';
import coachesImage from '../assets/projects/coaches-challenge.png';

export interface Headliner {
  eyebrow: string;
  title: string;
  description: string;
  proofPoints: string[];
  stack: string[];
  href: string;
  linkText: string;
}

export interface Project {
  title: string;
  description: string;
  stack: string[];
  href: string;
  image?: ImageMetadata;
}

export const zoneHistory: Headliner = {
  eyebrow: 'Zone History',
  title: 'Fourteen years of territory, scrubbed in the browser.',
  description:
    'Every zone of the mobile game QONQR, 2.68 million of them, across 14 years of faction control, compressed so a visitor can drag to any date and watch control shift in well under a second, served as static Parquet with DuckDB running in the browser.',
  proofPoints: ['13.7B cells made linear', '526 ms to scrub eleven years'],
  stack: ['Python', 'polars', 'DuckDB', 'dbt', 'Next.js', 'deck.gl', 'Cloudflare'],
  href: 'https://znhstry.com',
  linkText: 'Open znhstry.com',
};

export { default as zoneHistoryImage } from '../assets/projects/znhstry.png';

export const cinemetrics: Headliner = {
  eyebrow: 'cinemetrics',
  title: 'Eight years of film-watching, end to end',
  description:
    'A full analytics pipeline over my own Letterboxd history. I enrich the ratings from the TMDB and OMDb APIs, model them in DuckDB with dbt, and serve the result as a static cross-filtered dashboard with an ML recommendation engine, all from a CI runner and your browser.',
  proofPoints: [
    'Every chart responds to every filter in real time and every view generates a shareable URL.',
    'A GitHub Action pulls new ratings every day, retrains the embeddings, and redeploys.',
  ],
  stack: ['Python', 'dbt', 'DuckDB', 'scikit-learn', 'Next.js', 'D3', 'Cloudflare R2'],
  href: 'https://www.featheranalytics.dev/cinemetrics/',
  linkText: 'Open cinemetrics',
};

export const projects: Project[] = [
  {
    title: 'UrbanStack',
    description: 'Multi-layer urban data platform combining transportation, infrastructure, walkability, and demographic data for major US cities.',
    stack: ['Next.js', 'deck.gl', 'DuckDB'],
    href: 'https://www.featheranalytics.dev/urbanstack/',
    image: urbanstackImage,
  },
  {
    title: 'World Cup 2026',
    description: 'Interactive map exploring where every player was born versus which national team they represent.',
    stack: ['Next.js', 'deck.gl', 'MapLibre'],
    href: 'https://www.featheranalytics.dev/worldcup-2026/',
    image: worldcupImage,
  },
  {
    title: 'Capital Flow Cityscape',
    description: 'A 3D cityscape where buildings represent financial securities and capital flows become visible paths through a living city. Unique city every page load.',
    stack: ['Three.js', 'Procedural Generation'],
    href: 'https://www.featheranalytics.dev/capital-flows-city/',
    image: capitalFlowsImage,
  },
  {
    title: "Coach's Challenge",
    description: 'NFL coaching decision quality analyzer that grades play-calling against 27 years of EPA-optimal baselines.',
    stack: ['Next.js', 'Recharts', 'DuckDB'],
    href: 'https://www.featheranalytics.dev/coaches-challenge/',
    image: coachesImage,
  },
];

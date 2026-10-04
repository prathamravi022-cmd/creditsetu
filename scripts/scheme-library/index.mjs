// Aggregates the curated real-scheme library parts into a single array.
// `refresh-schemes.mjs` consumes this to emit the vendored dataset.
import business from './part1-business.mjs';
import education from './part2-education.mjs';
import social from './part3-social.mjs';
import agri from './part4-agri-state.mjs';

export const LIBRARY = [...business, ...education, ...social, ...agri];

/** Demographics the dataset must always cover with at least one scheme. */
export const REQUIRED_COVERAGE = {
  occupations: ['student', 'farmer', 'business', 'salaried', 'artisan', 'looking'],
  indicators: ['woman', 'senior', 'bpl', 'disability', 'rural', 'urban', 'universal'],
  categories: ['sc', 'st', 'obc', 'minority'],
};

export default LIBRARY;

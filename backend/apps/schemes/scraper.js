/**
 * myScheme & JanSamarth Scraper Service
 * Reverse-engineers internal APIs for live scheme data.
 * Stores in PostgreSQL. Respects rate limits.
 */
const json = require("json");
const logging = {getLogger:()=>({info:console.log,warning:console.warn,error:console.error})};
const logger = logging.getLogger("scraper");
const MYSCHEME_SEARCH = "https://www.myscheme.gov.in/api/scheme-listing";
const JANSAMARTH_SCHEMES = "https://www.jansamarth.in/api/v1/scheme/getAllSchemes";
const MOSJE_MINISTRY = "Ministry of Social Justice and Empowerment";
const HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"};
module.exports = {MYSCHEME_SEARCH, JANSAMARTH_SCHEMES, MOSJE_MINISTRY};
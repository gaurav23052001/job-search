const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (query) => {
  const googleKey = process.env.GOOGLE_API_KEY;
  const googleCx = process.env.GOOGLE_CX;
  const apiKey = process.env.SERP_API_KEY;

  // Option 1: Google Custom Search Engine (CSE) - Free 100 searches/day
  if (googleKey && googleCx) {
    console.log(`Searching using Google Custom Search for query: "${query}"`);
    try {
      const url = `https://customsearch.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${encodeURIComponent(query)}&dateRestrict=d1`;
      const response = await axios.get(url);
      const items = response.data.items || [];
      return items.map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet || item.htmlSnippet || ''
      }));
    } catch (err) {
      console.error('Google Custom Search error, falling back to other methods:', err.message);
    }
  }

  // Option 2: SerpAPI (100 free searches/month)
  if (apiKey) {
    console.log(`Searching using SerpAPI for query: "${query}"`);
    try {
      const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${apiKey}&tbs=qdr:d`;
      const response = await axios.get(url);
      const results = response.data.organic_results || [];
      return results.map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet || r.description || ''
      }));
    } catch (err) {
      console.error('SerpAPI error, falling back to DuckDuckGo:', err.message);
    }
  }

  // Option 3: Fallback to free DuckDuckGo HTML search (Unlimited, no keys)
  console.log(`Searching using DuckDuckGo (Free/No-Key) for query: "${query}"`);
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&df=d`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.result').each((i, el) => {
      const title = $(el).find('.result__title').text().trim();
      const rawLink = $(el).find('.result__url').attr('href');
      const snippet = $(el).find('.result__snippet').text().trim();

      if (title && rawLink) {
        let link = rawLink;
        if (link.startsWith('//')) {
          link = 'https:' + link;
        } else if (link.startsWith('/')) {
          link = 'https://html.duckduckgo.com' + link;
        }
        
        try {
          const parsedUrl = new URL(link);
          if (parsedUrl.searchParams.has('uddg')) {
            link = decodeURIComponent(parsedUrl.searchParams.get('uddg'));
          }
        } catch (e) {
          // Ignore URL parsing errors
        }

        results.push({
          title,
          link,
          snippet
        });
      }
    });

    return results;
  } catch (err) {
    console.error('DuckDuckGo search error:', err.message);
    return [];
  }
};
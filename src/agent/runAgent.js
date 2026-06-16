const constants = require('../config/constants');
const serpapi = require('../services/serpapi.service');
const gemini = require('../services/gemini.service');
const telegram = require('../services/telegram.service');
const storage = require('../storage/jobs');
const extractSource = require('../utils/extractSource');

const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const isActualJobPost = (url) => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    // LinkedIn check: must be a job view page
    if (hostname.includes('linkedin.com')) {
      return (pathname.includes('/jobs/view') || pathname.includes('/jobs-guest/jobs/api/job')) && 
             !pathname.includes('/jobs/search') && 
             !pathname.includes('/company/');
    }

    // Naukri check: must be a specific job listings page
    if (hostname.includes('naukri.com')) {
      return pathname.includes('/job-listings-') && !pathname.includes('/company/');
    }

    // Indeed check: must be a specific job view page
    if (hostname.includes('indeed.com')) {
      return (pathname.includes('/viewjob') || pathname.includes('/rc/clk') || pathname.includes('/job/')) && 
             !pathname.includes('/q-') && 
             !pathname.includes('/cmp/');
    }

    return false;
  } catch (e) {
    return false;
  }
};

const isOldJob = (title, snippet) => {
  const text = `${title} ${snippet}`.toLowerCase();
  
  if (
    text.includes('week ago') || text.includes('weeks ago') ||
    text.includes('month ago') || text.includes('months ago') ||
    text.includes('year ago') || text.includes('years ago')
  ) {
    return true;
  }

  const daysAgoMatch = text.match(/(\d+)\s+days?\s+ago/);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10);
    if (days >= 2) {
      return true;
    }
  }

  return false;
};

const isClosedJob = (title, snippet) => {
  const text = `${title} ${snippet}`.toLowerCase();
  const closedPhrases = [
    'no longer accepting applications',
    'application closed',
    'job closed',
    'hiring closed',
    'hiring has ended',
    'expired'
  ];
  return closedPhrases.some(phrase => text.includes(phrase));
};

module.exports = async () => {
  try {
    console.log('Starting job search agent...');
    const existing = storage.getJobs() || [];
    const existingLinks = new Set(existing.map(j => j.link).filter(Boolean));
    const newJobs = [];

    for (const q of constants) {
      const results = await serpapi(q) || [];
      for (const r of results) {
        const link = r.link || r.url || r.applyUrl || r.jobLink || null;
        if (!link) continue;
        if (existingLinks.has(link)) continue;

        if (!isActualJobPost(link)) {
          console.log(`Skipped non-job/filter/company page link: ${link}`);
          continue;
        }

        const title = r.title || r.jobTitle || 'Untitled';
        const snippet = r.snippet || r.description || '';

        if (isClosedJob(title, snippet)) {
          console.log(`Skipped closed job: ${title}`);
          continue;
        }

        if (isOldJob(title, snippet)) {
          console.log(`Skipped job older than 24 hours: ${title}`);
          continue;
        }

        const source = extractSource(link);
        const meta = await gemini(r).catch(() => ({ score: 0, apply: false }));

        const job = {
          title,
          link,
          snippet,
          source,
          score: meta.score || 0,
          apply: meta.apply || false,
          foundAt: new Date().toISOString()
        };

        existing.push(job);
        existingLinks.add(link);
        newJobs.push(job);
      }
    }

    if (newJobs.length) {
      storage.saveJobs(existing);
      let notifiedCount = 0;
      for (const j of newJobs) {
        // Only notify on telegram if the AI flags it as relevant
        if (!j.apply) {
          console.log(`Skipped notifying job with score ${j.score}: ${j.title}`);
          continue;
        }

        const escapedTitle = escapeHtml(j.title);
        const escapedSource = escapeHtml(j.source);

        const msg = [
          `🔔 <b>NEW JOB ALERT</b>`,
          ``,
          `💼 <b>${escapedTitle}</b>`,
          `📍 <b>Source:</b> ${escapedSource}`,
          `🎯 <b>Match Score:</b> ${j.score}%`,
          ``,
          `🔗 <b>Apply:</b>`,
          j.link,
          ``,
          `━━━━━━━━━━━━━`
        ].join('\n');

        await telegram(msg).catch(err => console.error('Telegram error:', err));
        notifiedCount++;
      }
      console.log(`Saved ${newJobs.length} new jobs. Notified Telegram for ${notifiedCount} relevant jobs.`);
    } else {
      console.log('No new jobs found');
    }
  } catch (err) {
    console.error('runAgent error:', err);
  }
};
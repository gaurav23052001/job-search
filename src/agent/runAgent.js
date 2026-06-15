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

        const source = extractSource(link);
        const meta = await gemini(r).catch(() => ({ score: 0, apply: false }));

        const job = {
          title: r.title || r.jobTitle || 'Untitled',
          link,
          snippet: r.snippet || r.description || '',
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
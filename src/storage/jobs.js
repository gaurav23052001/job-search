const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'jobs.json');

module.exports = {
  getJobs: () => {
    try {
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '[]', 'utf8');
        return [];
      }
      const content = fs.readFileSync(file, 'utf8').trim();
      return content ? JSON.parse(content) : [];
    } catch (e) {
      console.error('Error reading jobs file, returning empty list:', e.message);
      return [];
    }
  },
  saveJobs: (jobs) => {
    try {
      fs.writeFileSync(file, JSON.stringify(jobs, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving jobs:', e.message);
    }
  }
};
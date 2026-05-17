/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://openhuman.ai",
  changefreq: "daily",
  generateRobotsTxt: true, // (optional)
};

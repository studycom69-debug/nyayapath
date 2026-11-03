import { chromium } from "playwright";

async function scrapeNJDGCases() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  // Example NJDG search or listing URL (adjust as per exact target)
  await page.goto("https://njdg.ecourts.gov.in/", { waitUntil: "networkidle" });

  // Sample: Wait for the case list table selector
  await page.waitForSelector("#caseListTable");

  const cases = await page.$$eval("#caseListTable tbody tr", (rows) =>
    rows.map((row) => {
      const caseNum = row.querySelector("td:nth-child(1)")?.textContent.trim();
      const caseYear = row.querySelector("td:nth-child(2)")?.textContent.trim();
      const caseStatus = row
        .querySelector("td:nth-child(5)")
        ?.textContent.trim();
      return { caseNum, caseYear, caseStatus };
    }),
  );

  console.log("NJDG Cases:", cases);

  await browser.close();
  return cases;
}

scrapeNJDGCases().catch(console.error);

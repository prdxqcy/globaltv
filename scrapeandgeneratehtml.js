const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = 'https://www.livesports088.com/';

async function scrapeAndGenerateHtml() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scrape only live matches and format team names
    const matches = await page.evaluate(() => {
        const matchItems = document.querySelectorAll('a.match-item');

        return Array.from(matchItems)
            .filter(item => item.querySelector('.icon-live')) // Only include matches with the 'icon-live' class
            .map(item => {
                const link = item.href;
                const matchPath = new URL(link).pathname;
                const matchName = matchPath.split('/').pop().replace('.html', '');

                // Extract team names from the slug, format and join them with "VS"
                const [team1, team2] = matchName.split('-vs-').map(team => {
                    return team
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, char => char.toUpperCase())
                        .trim();
                });

                const formattedMatchWords = `${team1} VS ${team2}`;

                return { link, formattedMatchWords };
            });
    });

    await browser.close();

    if (matches.length === 0) {
        console.log('No live matches found. Check the selector or content.');
        return;
    }

    // Create HTML content with refined styling and instructions
    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Sports Matches</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-image: url('https://www.huck-net.co.uk/media/img/images/Types_Of_Lines_On_A_Football_Pitch.jpg');
            background-size: cover;
            background-position: center;
            color: #fff;
            text-align: center;
            padding-top: 50px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: rgba(0, 0, 0, 0.7); /* Slightly darker semi-transparent background */
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }
        h1 {
            margin-top: 0;
            font-size: 2.5em;
            color: #fff;
        }
        .instructions-box {
            background: rgba(255, 255, 255, 0.9);
            color: #000;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .button-container {
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin: 10px;
            font-size: 18px;
            font-weight: bold;
            color: #fff;
            background-color: #28a745; /* Green color */
            text-decoration: none;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            transition: background-color 0.3s, box-shadow 0.3s, transform 0.3s;
            text-transform: capitalize; /* Capitalize text */
            letter-spacing: 1px; /* Add space between letters */
        }
        .button:hover {
            background-color: #218838; /* Darker green on hover */
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
            transform: translateY(-2px); /* Lift effect on hover */
        }
        .button:active {
            background-color: #1e7e34; /* Even darker green when active */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            transform: translateY(0); /* Reset lift effect */
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Live Sports Matches</h1>
        <div class="instructions-box">
            <h2>Instructions</h2>
            <p>To watch a match, follow these steps:</p>
            <ol>
                <li>Click the button of the match you want to watch.</li>
                <li>Wait for 6 seconds for the page to load.</li>
                <li>If a captcha appears, drag the puzzle into the correct spot.</li>
                <li>Enjoy the match!</li>
            </ol>
        </div>
        <div class="button-container">
`;

    matches.forEach(match => {
        // Use the formattedMatchWords as the button label
        htmlContent += `        <a href="${match.link}" class="button" target="_blank">${match.formattedMatchWords || 'View Match'}</a>\n`;
    });

    htmlContent += `
        </div>
    </div>
</body>
</html>
`;

    // Write the HTML content to a file
    const outputPath = path.join(__dirname, 'index.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log('HTML file generated as index.html');
}

// Run the scraping function immediately and then every 1.5 minutes
scrapeAndGenerateHtml();
setInterval(scrapeAndGenerateHtml, 90 * 1000); // 90 seconds = 1.5 minutes

const puppeteer = require('puppeteer');
const BugReport = require("../model/index.js");
const Chart = require('chart.js');

const bugReport = async (req, res, next) => {
    try {
        // Retrieve all BugReport documents from the database
        const bugReports = await BugReport.find();
        console.log(bugReports)
        res.json(bugReports);

    } catch (err) {
        console.log("Error: ", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const submitBug = async (req, res, next) => {
    const bugReportData = req.body;
    try {
        // Create a new BugReport document and save it to the database
        const bugReport = new BugReport(bugReportData);
        await bugReport.save();
        res.json({ message: 'Bug report submitted successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const generatePdf = async (req, res, next) => {
    try {
        const bugReports = await BugReport.find({});
        // Create a new browser instance and open a new blank page
        const browser = await puppeteer.launch({
            headless: 'new',
        });
        const page = await browser.newPage();

        // set page dimension and margins
        const margin = { top: '50px', right: '50px', bottom: '50px', left: '50px' };


        // set the content of the pdf
        let content = '<h1> Bug Report Summary12345 </h1>';
        await page.addStyleTag({
            content: `
            @page {
                margin: ${margin.top} ${margin.right} ${margin.left} ${margin.bottom}
            }
            `
        });


        // Create HTML template with dynamic table of contents
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Report</title>
                <style>
                    /* CSS for table of contents */
                </style>
            </head>
            <body>
                <h1>Report Title</h1>
                <h2>Table of Contents</h2>
                <ol>
                    ${bugReports.map(section => `<li><a>${section.Status}</a>
                        <ol>
                            ${bugReports.map(item => `<li><a>${item.Status}</a></li>`).join('')}
                        </ol>
                    </li>`).join('')}
                </ol>
                
                </body>
            </html>
        `;


        const tableContent =  `
            <ol>
            <li>Executive Summary</li>
            <ul type="none" >
                <li>1.1 Strategic Recommendation</li>
                <li>1.2 Scope of work</li>
                <li>1.3 Summary of findings</li>
            </ul>
            <li>
                CVSS: Score Vulnerabilities
                <ul type="none">
                    <li>2.1 How to use this report</li>
                </ul>
            </li>
            <li>Findings Overview</li>
            <li>Technical Reports</li>
                <ul type="none">
                    <li>4.1 Application Does Not Implement HSTS Best Practices</li>
                    <li>4.2 Inadequate, Inconsistent or Missing Cookie Attributes</li>
                    <li>4.3 Missing Content Security Policy Header</li>
                    <li>4.4 Application Displays Web Server Banner</li>
                    <li>4.5 Misconfigured Content Security Policy</li>
                    <li>4.6 Application does not have a strong password policy</li>
                    <li>4.7 Application is Vulnerable to Clickjacking</li>
                    <li>4.8 Application is vulnerable to Improper Session Management</li>
                    <li>4.9 Application is vulnerable to Session Fixation Attack</li>
                    <li>4.10 Application is vulnerable to Session Hijacking</li>
                    <li>4.11 Application is vulnerable to browser's back refresh attack</li>
                    <li>4.12 Application's Apache Server - Status Enabled </li>
                    <li>4.13 Cache best practices not followed</li>
                    <li>4.14 HTTP Methods enabled on server(HEAD, PUT, DELETE, TRACE, TRACK, OPTIONS, DEBUG, PROPFIND)</li>
                    <li>4.15 No Rate Limiting Policy</li>
                    <li>4.16 Insufficient transport layer security</li>
                    <li>4.17 Programming language and version disclosure</li>
                    <li>4.18 Application Display web server info</li>
                    <li>4.19 Application accessible by ip address</li>
                    <li>4.20 Cookie http secure flag not set</li>
                    <li>4.21 Double Extension Bypass</li>
                    <li>4.22 LFI</li>
                    <li>4.23 Path disclose</li>
                    <li>4.24 Privilege escalation</li>
                    <li>4.25 Reset Password Link not expire</li>
                    <li>4.26 Response modification</li>
                    <li>4.27 jquery version disclose</li>
                    <li>4.28 After Session logout able to add member</li>
                    <li>4.29 Simultaneous login</li>
                    <li>4.30 Time based sql injection in remove user </li>
                    <li>4.31 User id and password in clear text </li>
                </ul>
            <li>Copyright Notice</li>
        </ol>
      `;
        

        const chartData = {
            labels: ['Low', 'Medium', 'High'], // Adjust based on your data categories
            data: [10, 20, 50], // Extract counts from your bug reports
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
        };



        const chartScript = `
            const ctx = document.getElementById('myChart');

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
        `;

        const contents = await Promise.all(bugReports.map(async (report, index) => {
            return `
            <h2>Bug ${index + 1}:</h2>
            <p><strong>Description:</strong> ${report.Status}</p>
            <p><strong>Severity:</strong> ${report.Severity}</p>
            <p><strong>Steps to Reproduce:</strong> ${report.OWASP_Category}</p>
            <p><strong>Reported By:</strong> ${report.CVSS_Score}</p>
            <p><strong>Status:</strong> ${report.Summary}</p>
            <br/> 
            `;
        }));

        content +=
            `${html}
            <table>
                <tbody>
                    ${tableContent}
                </tbody>
            </table>
            
            <div>
                <canvas id="myChart"></canvas>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
                ${chartScript}
            </script>
            ${contents.join('')}
            `

        // generate pdf
        await page.setContent(content);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '60px',
                bottom: '60px',
                left: '60px',
            }
        });

        // close the browser
        await browser.close();

        //send the generated pdf as a response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=BugReport.pdf');
        res.send(pdfBuffer);

        console.log("bug report generated");

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({ err: "Internal Server Error" });
    }
}

const updateBug = async (req, res, next) => {
    const updateValues = req.body;
    const bugId = req.params.id;
    try {
        const bug = await bugReport.findByIdAndUpdate(bugId, updateValues);
        res.json({ bug });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ err: "Internal Servre Error" });
    }
}

const getBugById = async (req, res, next) => {
    const id = req.params.id;
    try {
        const bug = await bugReport.findById(id);
        res.json({ bug });
    } catch (err) {
        console.log("Error:", err);
        res.status(500).json({ err: "Internal Servre Error" });
    }
}
module.exports = { bugReport, submitBug, generatePdf, updateBug, getBugById };


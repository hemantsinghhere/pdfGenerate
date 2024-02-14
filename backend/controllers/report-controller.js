const puppeteer = require('puppeteer');
const BugReport = require("../model/index.js");
const fs = require("fs");

const Chart = require('chart.js');
const { spawnSync } = require('child_process');

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
        const margin = { top: '50px', right: '50px', bottom: '50px', left: '50px' };

        // LaTeX template
        const latexContent = `
            \\documentclass{article}
            \\usepackage{enumitem}
            \\begin{document}
            \\title{Bug Report Summary}
            \\maketitle
            
            \\tableofcontents
            
            \\section{Executive Summary}
            \\begin{itemize}[noitemsep]
                \\item Strategic Recommendation
                \\item Scope of work
                \\item Summary of findings
            \\end{itemize}
            
            \\section{CVSS: Score Vulnerabilities}
            \\subsection{How to use this report}
            
            \\section{Findings Overview}
            \\begin{itemize}[noitemsep]
                ${bugReports.map(report => `\\item ${report.Status}`).join('\n')}
            \\end{itemize}
            
            \\section{Technical Reports}
            ${bugReports.map((report, index) => `
                \\subsection{Bug ${index + 1}}
                \\begin{itemize}[noitemsep]
                    \\item Status: ${report.Status}
                    \\item Severity: ${report.Severity}
                    \\item OWASP Category: ${report.OWASP_Category}
                    \\item CVSS Score: ${report.CVSS_Score}
                    \\item Affected Hosts/URLs: 
                    \\item Summary: ${report.Summary}
                    \\item proof od concept: ${report.Proof_of_concept}
                    \\item Reference: ${report.Proof_of_concept}
                \\end{itemize}`).join('\n')}
            
            \\end{document}
        `;

        // Write LaTeX content to .tex file
        fs.writeFileSync('bug_report.tex', latexContent);

        // Compile LaTeX to PDF
        const pdflatex = spawnSync('pdflatex', ['bug_report.tex']);
        if (pdflatex.status === 0) {
            console.log('PDF report generated successfully.');
        } else {
            console.error('Error generating PDF report:', pdflatex.stderr.toString());
            throw new Error('Failed to generate PDF report.');
        }

        // Send the generated PDF as a response
        const pdfBuffer = fs.readFileSync('bug_report.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=BugReport.pdf');
        res.send(pdfBuffer);

        console.log("Bug report generated");

    } catch (err) {
        console.log("Error :", err);
        res.status(500).json({ err: "Internal Server Error" });
    } finally {
        // Clean up temporary files
        fs.unlinkSync('bug_report.tex');
        fs.unlinkSync('bug_report.log');
        fs.unlinkSync('bug_report.aux');
        fs.unlinkSync('bug_report.pdf');
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


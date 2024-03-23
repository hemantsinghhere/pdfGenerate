require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const { router } = require('./routes/bug-routes');
const fs = require("fs");
const { spawnSync } = require('child_process');
const BugReport = require("../backend/model/index.js")

const app = express();
app.use(express.json());
mongoose.connect("mongodb+srv://admin:9zNBhxNG56ua13sg@cluster0.oj7avns.mongodb.net/pdfGenerate?retryWrites=true&w=majority")
    .then(() => app.listen(5000))
    .then(() => console.log("Connected to database"))
    .catch((err) => console.log(err));

    
app.use("/api/getReport", router);
app.use("/api", (req, res, next) => {
    res.send("Hello world");
});

app.get('/', async function (req, res) {

    const bugReports = await BugReport.find({});
    // LaTeX code
    const textContent = `
          \\documentclass{article}
          \\usepackage{graphicx}
          \\usepackage{roboto}
            \\linespread{1.5}
            \\usepackage{xcolor}
            \\usepackage{longtable}
            \\usepackage{pgf-pie}
            \\usepackage[table]{xcolor}
            \\usepackage{colortbl}
            \\usepackage{geometry}
            \\usepackage{hyperref}
            \\usepackage{fancyhdr}
            \\usepackage{lastpage}
            \\usepackage{tikz}
            \\usetikzlibrary{calc}
            \\usetikzlibrary{fadings}
            \\usepackage{adjustbox}
            \\usepackage{subfigure}
            \\usepackage{pagecolor}
            \\usepackage{background}
            \\usepackage[T1]{fontenc}
            \\usepackage[scaled]{uarial}
            \\usepackage{titletoc}
            \\usetikzlibrary{pie, fit}
            \\definecolor{darkgray}{RGB}{64,64,64}
            \\definecolor{tablecol}{RGB}{15, 117, 114}
            \\definecolor{tableco2}{RGB}{44, 163, 135}
            \\definecolor{textbold}{RGB}{5, 122, 119}
            \\definecolor{lightgray}{RGB}{245, 245, 245}
            \\definecolor{textcolor}{RGB}{5, 38, 37}
            \\definecolor{sectioncolor}{RGB}{5, 38, 37}
            \\definecolor{subsectioncolor}{RGB}{5, 122, 119}


            \\color{textcolor}
            \\renewcommand{\\rmdefault}{phv}
            \\renewcommand{\\sfdefault}{phv}
            \\pagecolor{white}
            \\pagestyle{fancy}
            \\fancyhf{}
            \\fancyhead[R]{\\large \\textbf{PSG | Penetration Testing Services}}
            \\fancyfoot[R]{\\textbf{\\thepage}}
            \\fancyfoot[c]{ \\textbf{Company Confidential}} 
            \\fancyfoot[l]{ \\textbf{VAPTLabs Report}} 
            \\renewcommand{\\headrulewidth}{0pt}
            
      
            \\geometry{
                left=2.5cm,
                right=2.5cm,
                top=3cm,
                bottom=3cm,
            }
            
            \\backgroundsetup{
                scale=1,
                angle=0,
                opacity=1,
                color=black,
                contents={
                    \\begin{tikzpicture}
            [remember picture, overlay] \\draw[line width=1pt] ($(current page.north west)+(0.3in, -0.3in)$) rectangle ($(current page.south east)+(-0.3in, 0.3in)$);
            \\end{tikzpicture}
                }
            }


            \\makeatletter
            \\renewcommand{\\section}{\\@startsection{section}{1}{\\z@}%
            {-3.5ex \\@plus -1ex \\@minus -.2ex}%
            {2.3ex \\@plus.2ex}%
            {\\normalfont\\normalsize\\bfseries\\color{sectioncolor}}}

            
            \\renewcommand{\\subsection}{\\@startsection{subsection}{2}{\\z@}%
            {-3.25ex\\@plus -1ex \\@minus -.2ex}%
            {1.5ex \\@plus .2ex}%
            {\\normalfont\\large\\color{subsectioncolor}}}
            \\makeatother

            \\renewcommand{\\contentsname}{My Table of Contents}
            \\titlecontents{section}
            [0pt] 
            {} 
            {\\contentslabel{2em}}
            {} % numberless format
            {\\titlerule*[0.5pc]{.}\\contentspage}

            \\begin{document}

            
            Hello, \\LaTeX!
            \\begin{figure}
            \\centering
            \\includegraphics[width=1.0\\textwidth]{1.png}
            \\end{figure}
            Hello, \\LaTeX!
            \\begin{figure}
            \\centering
            \\includegraphics[width=1.0\\textwidth]{2.png}
            \\end{figure}
            \\begin{figure}
            \\centering
            \\includegraphics[width=1.0\\textwidth]{vapt.jpeg}
            \\end{figure}

            \\newpage
            
            
            \\clearpage
            \\tableofcontents
            
            \\newpage
            \\section{Executive Summary}
                \\subsection{\\large Strategic Recommendation }
                \\large It is recommended to fix all critical, high and medium vulnerabilities before releasing the application to
                    customer.
                \\subsection{\\large Scope of Work}
                \\normalsize The scope of this penetration test was limited to the URL mentioned below: \\\\
                    


            

            ${bugReports.map((report, index) => `
                \\newpage
          
                \\begin{description}
                    \\item \\large \\textbf{\\textcolor{black} Status:} ${report.Status}
                    \\item \\large \\textbf{Severity: \\textcolor{blue}{${report.Severity}}}
                    \\item \\large \\textbf{OWASP Category: ${report.OWASP_Category}}
                    \\item \\large \\textbf{CVSS Score:} ${report.CVSS_Score} 
                    \\item \\large \\textbf{Affected Hosts/URLs:} \\\\ \\href{${report.Affected_Hosts}} {${report.Affected_Hosts}}
                    \\item \\large \\textbf{Summary:} \\\\${report.Summary}
                    \\item \\large \\textbf{proof of concept: \\\\ \\includegraphics[width=1.0\\textwidth]{1.png}} \\\\ 
                    \\item \\large \\textbf{Reference:\\\\} \\large \\href{${report.Links}} {${report.Links.toString()}} \\\\ 
                \\end{description}`).join('\n')}
          \\end{document}
        `;
  
    // Write LaTeX content to .tex file
    fs.writeFileSync('bug_report.tex', textContent);
  
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
  })
console.log("Hello");

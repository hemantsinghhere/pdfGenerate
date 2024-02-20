const puppeteer = require('puppeteer');
const BugReport = require("../model/index.js");

const fs = require("fs");

const Chart = require('chart.js');
const { spawnSync } = require('child_process');
const sharp = require('sharp');

const bugReport = async (req, res, next) => {
    try {
        // Retrieve all BugReport documents from the database
        const bugReports = await BugReport.find({});

        // for (const bugReport of bugReports) {
        //     for (const image of bugReport.Proof_of_concept) {
        //         // Process each image here
        //         const base64Image = image.data.toString('base64');
        //         res.json({
        //             ...bugReport,
        //             images: bugReport.Proof_of_concept.map(image => ({
        //                 data: base64Image,
        //                 contentType: image.contentType
        //             }))
        //         });
        //     }
        // }
       
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

        // Extract image data and content type
        const images = req.files.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        }));

        
        
        // Add images to the bug report data
        bugReportData.Proof_of_concept = images;

        // Create a new BugReport document and save it to the database
        const bugReport = new BugReport(bugReportData);
        await bugReport.save();
        console.log(req.files);
        res.json({ message: 'Bug report submitted successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const generatePdf = async (req, res, next) => {
    try {
        const bugReports = await BugReport.find({});
       
        let table4 = `\\begin{longtable}{|p{30em}|p{10em}|}
            \\hline
            \\textbf{Finding Name} & \\textbf{Remediation Effort}  \\\\
            \\hline
            \\textbf{Critical Severity Findings} & \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\textcolor{blue}{\\textbf{High Severity Findings}}} \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\textcolor{blue}{\\textbf{Medium Severity Findings}}} \\\\
            \\hline
            \\textbf{Reflected Cross Site Scripting (XSS) } & {Quick}\\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\textcolor{blue}{\\textbf{Low Severity Findings}}} \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\textcolor{blue}{\\textbf{Informational Findings}}} \\\\
            \\hline
            `;

            bugReports.forEach(report => {
                table4 += `
                    ${report.Title} & ${report.Remediation_effort} \\\\
                    \\hline`;
            });

            table4 += `\\end{longtable}`;
        
        // LaTeX template
        const latexContent = `
            \\documentclass{article}
            \\usepackage{enumitem}
            \\usepackage{roboto}
            \\linespread{1.5}
            \\usepackage{xcolor}
            \\usepackage{longtable}
            \\usepackage{pgf-pie}
            \\usepackage[table]{xcolor}
            \\usepackage{colortbl}
            \\usepackage{graphicx}
            \\usepackage{geometry}
            \\usepackage{hyperref}
            \\usepackage{fancyhdr}
            \\usepackage{lastpage}

            \\pagestyle{fancy}
            \\fancyhf{}
            \\fancyhead[R]{\\large \\textbf{PSG | Penetration Testing Services}}
            \\fancyfoot[R]{\\textbf{\\thepage}}
            \\fancyfoot[c]{ \\textbf{Company Confidential}} 
            \\renewcommand{\\headrulewidth}{0pt}
      
            \\geometry{
                left=2.5cm,
                right=2.5cm,
                top=3cm,
                bottom=3cm,
            }

            \\begin{document}
            \\title{\\large Bug Report Summary}
            \\maketitle
            
            
            \\tableofcontents


            \\newpage
            \\section{\\large Executive Summary}
                \\subsection{ \\large Strategic Recommendation }
                    \\ It is recommended to fix all critical, high and medium vulnerabilities before releasing the application to
                    customer.
                \\subsection{\\large Scope of Work}
                    \\textbf{The scope of this penetration test was limited to the URL mentioned below:}
                    \\begin{center}
                        \\begin{longtable} {|p{4em}|p{7em}|p{10em}|p{20em}|}
                        \\hline 
                        \\multicolumn{4}{|p{45em}|}{\\large \\cellcolor{blue!70} \\textcolor{white}{\\textbf{Scope Details}}} \\\\
                        \\hline
                        \\large \\cellcolor{blue!30} \\textbf{Sr. No.} & \\large \\cellcolor{blue!30} \\textbf{Application Name} & \\large \\cellcolor{blue!30} \\textbf{Application URL} & \\large \\cellcolor{blue!30} \\textbf{Scope}  \\\\    
                        \\hline
                        \\large 1. & \\large Callyzer & \\large http://65.21.6.24/ & \\large Callyzer web Application Manually \\& using Burpsuite \\\\
                        \\hline
                        \\end{longtable}   
                    \\end{center}

                \\subsection{\\large Summary of Findings}
                \\begin{itemize}[noitemsep]
                    \\item \\large Graphical Summary
                \\end{itemize}


                \\begin{figure}
                    \\centering
                    \\begin{tikzpicture}
                        \\pie
                            [
                                /tikz/every pin/.style={align=center, text=black, font=\\normalfont},
                                sum=auto,
                                color={ blue!70, green!70, orange!70, red!70, purple!70}
                            ]
                            {
                                0/High,
                                0/Critical,
                                10/Medium,
                                6/Low,
                                16/Info
	                        }
                            \\node at (4,1) {High};
                            \\node at (4,0.5) {Critical};
                            
                    \\end{tikzpicture}
                    \\caption{Pie Chart}
                    \\label{fig:pie-chart}
               \\end{figure}

            \\begin{tabular}{|p{8em}|c|}
                
               \\hline
                \\large \\cellcolor{black!10} \\textcolor{blue}{\\textbf{Severity}} & \\large \\cellcolor{black!10} \\textcolor{blue}{\\textbf{Count}} \\\\
                \\hline
                \\large \\textcolor{blue}{Critical} & \\large \\cellcolor{red!100} \\textcolor{blue}{0} \\\\
                \\hline
                \\large \\textcolor{blue}{High} & \\large \\cellcolor{orange} \\textcolor{blue}{0} \\\\
                \\hline
                \\large \\textcolor{blue}{Medium} & \\large \\cellcolor{yellow} \\textcolor{blue}{12} \\\\
                \\hline
                \\large \\textcolor{blue}{Low} & \\large \\cellcolor{green} \\textcolor{blue}{6} \\\\
                \\hline
                \\large \\textcolor{blue}{Informational} & \\large \\cellcolor{black!10} \\textcolor{blue}{16} \\\\
                \\hline
                \\large \\textcolor{blue!100}{Total} & \\large \\cellcolor{blue!30} \\textcolor{blue}{34} \\\\
                \\hline
                
            \\end{tabular}

            \\newpage
            \\section{\\large CVSS: Score Vulnerabilities}
            \\large there are three types of scores that can be calculated: a base score, a temporal score and an environmental score. For purposes of reporting in this document, the CVSS base score will be provided. The base score assesses the following characteristics:
            \\begin{center}
                \\begin{longtable} {|p{8em}|p{30em}|}
                \\hline 
                \\large \\cellcolor{blue!30} \\textcolor{white}{\\textbf{Characteristics}} & \\large \\cellcolor{blue!30} \\textcolor{white}{\\textbf{Description}}   \\\\    
                \\hline
                \\large Attack Vector & \\large Assesses whether or an adversary can mount attack from a remote network, a local
                network or if an adversary must be logged on to the target of evaluation or physically
                connected.  \\\\
                \\hline
                \\large Attack Complexity  & \\large Assesses the complexity of an attack dependent on how many of the attack variables are
                within the control of the adversary.  \\\\
                \\hline
                \\large Privileges Required  & \\large Assesses the level of access that an attacker needs to mount a successful attack. \\\\
                \\hline
                \\large User Interaction & \\large Assesses the extent to which actions of the victim are required for an attack to be
                successful. \\\\
                \\hline
                \\large Scope & \\large Assess whether the impact of an attack is limited to the target of evaluation or if the attack
                has impact on other systems as well. \\\\
                \\hline
                \\large Confidentiality & \\large Assesses the negative impact that an attack can have on the target of evaluation's
                confidentiality. \\\\
                \\hline
                \\large Integrity & \\large Assesses the negative impact that an attack can have on the target of evaluation's
                integrity. \\\\
                \\hline
                \\large Availability & \\large Assesses the negative impact that an attack can have on the target of evaluation's
                availability. \\\\
                \\hline
                \\end{longtable}   
            \\end{center} 

            \\large As indicated above, the assessment of these characteristics results in a severity score which ranges
            from 1-10. This score can be further broken down into the following rating levels:

            \\begin{center}
                \\begin{longtable} {|p{4.5em}|p{4.5em}|p{30em}|}
                \\hline 
                \\large \\cellcolor{blue!30} \\textcolor{white}{\\textbf{Range}} & \\large \\cellcolor{blue!30} \\textcolor{white}{\\textbf{Rating}} & \\large \\textcolor{white}{\\cellcolor{blue!30} \\textbf{Description}}   \\\\    
                \\hline
                \\large 9.0 - 10.0 & \\large Critical & \\large These types of vulnerabilities should be reviewed immediately for impact to the
                business. This rating usually indicates that an exploit exists that could easily be use
                severely impact confidentiality, integrity and/or availability.  \\\\
                \\hline
                \\large 7.0 - 8.9 & \\large High & \\large These types of vulnerabilities need to be assessed in the short term for impact to the
                business. A score in this range indicates that a vulnerability could be exploited with
                low to medium complexity and could have moderate or high impact on confidentiality,
                integrity and/or availability.  \\\\
                \\hline
                \\large 4.0 - 6.9 & \\large Medium & \\large These vulnerabilities should also be evaluated for impact to the business, but the
                base score shows that these types of vulnerabilities may be only exploitable with
                increased effort or have little impact to confidentiality, integrity and/or availability.  \\\\
                \\hline
                \\large 0.1 - 3.9  & \\large Low & \\large These vulnerabilities should also be evaluated, but from evaluating the base
                characteristics, the exploitation of these vulnerabilities is likely to result in little
                negative impact to confidentiality, integrity and/or availability.  \\\\
                \\hline
                \\end{longtable}   
            \\end{center}
            \\large The CVSS score provided in this report is meant to serve as a tool to assist with the prioritizing
            vulnerability resolution. This score, however, does not take into consideration the context of the
            business. For some business IT contexts some lower-scored vulnerabilities could have serious
            business impact. Hence, all of the reported vulnerabilities should be taken into consideration.

            \\subsection{\\large How to use this report}

            \\large The vulnerabilities reported in this document provide a view of the target of evaluation's security posture
            at the time of testing. This timeframe, "at the time of testing", is important to highlight because the report
            cannot address future changes to the target of evaluation, changes in the systems that support the target of evaluation and emerging, publicly disclosed exploits that could have an impact on the target
            of evaluation.

            \\large The goal of this document is to provide input to help identify and prioritize the vulnerabilities that were
            detected at the time of testing and to provide some guidance as to how the vulnerabilities might be
            mitigated.
            
            \\begin{center}
                \\begin{longtable} {|p{8em}|p{30em}|}
                \\hline 
                \\large \\cellcolor{blue!30} \\textcolor{white}{\\textbf{Characteristics}} & \\large \\cellcolor{blue!30} \\textcolor{white}{\\textbf{Description}}   \\\\    
                \\hline
                \\large Status & \\large This field will contain either "Verified" or "Detected". If this value is "Verified", then the tester exploited this vulnerability during the penetration test. If it is "Detected",
                then evidence of the vulnerability was found, but it was not exploited during testing. There are many reasons why a tester may not be able to exploit a vulnerability
                during testing. Examples include threat of system instability after exploit, lack of time during testing and/or inability to find a vector by which a vulnerability could be exploited.  \\\\
                \\hline
                \\large CVSSv3.1 Scoring  & \\large This provides the overall severity score for a vulnerability including the individual
                assessments for attack vector, attack complexity, privileges required, user interaction, scope, confidentiality, integrity and availability.  \\\\
                \\hline
                \\large Vulnerability Description  & \\large This provides an overview of the identified vulnerability including how it could be useful to an adversary. \\\\
                \\hline
                \\large Proof of Concept & \\large This provides a description of how the vulnerability was detected and/or a description of how it can be reproduced for testing purposes. \\\\
                \\hline
                \\large Affected Uri  & \\large This provides a list of the url that are relevant to the vulnerability. \\\\
                \\hline
                \\large Recommendation & \\large This provides suggestions on how to mitigate the vulnerability. \\\\
                \\hline
                \\large References & \\large This provides links to CVEs, CWEs and other known resources to learn more about the vulnerability and how to mitigate the vulnerability. \\\\
                \\hline
                \\end{longtable}   
            \\end{center}
            
            \\large The report is broken up into three major sections: an executive summary, a technical detail report and an appendix. The executive summary will provide a high-level overview of the vulnerabilities detected
            during the penetration test.

            \\large The technical detail report will provide the details of the vulnerabilities identified during the penetration test. Each vulnerability will include the following descriptors.
            
            \\large The appendix will contain information about the testing environment and further details gathered during testing that do not fit within the first three chapters. 
            This information is necessary to have a complete picture of the penetration test, but it is in the appendix to make accessing the testing results more userfriendly.

            \\newpage
            \\section{\\large Findings Overview}
            \\ \\  \\ The following table summarizes the list of findings discovered during the security assessment
            \\begin{center}
                \\begin{longtable} {|p{3em}|p{15em}|p{7em}|p{5em}|c|}
                    \\hline 
                    \\multicolumn{5}{|p{20em}|}{\\large \\textcolor{blue}{\\textbf{Summary Table}}} \\\\
                    \\hline
                    \\textbf{Sr. No.} & \\textbf{Vulnerability Name} & \\textbf{OWASP Category} & \\textbf{Severity} & \\textbf{CVSS Score++} \\\\    
                    \\hline
                    ${bugReports.map((report, index) => `
                    \\center ${index+1} & ${report.Title} & ${report.OWASP_Category} & ${report.Severity} &  ${report.CVSS_Score} \\\\
                    \\hline
                    `).join('\n')} 
                \\end{longtable}   
            \\end{center}

            \\newpage
            \\section{\\large Technical Reports}
            \\ \\ \\ The following findings were made during the assessment.    
            \\begin{center}
                ${table4}
            \\end{center}  

            ${bugReports.map((report, index) => `
                \\newpage
                \\subsection{\\large ${report.Title} }
                \\begin{description}
                    \\item \\large \\textbf{\\textcolor{black} Status:} ${report.Status}
                    \\item \\large \\textbf{Severity: \\textcolor{blue}{${report.Severity}}}
                    \\item \\large \\textbf{OWASP Category: ${report.OWASP_Category}}
                    \\item \\large \\textbf{CVSS Score:} ${report.CVSS_Score} 
                    \\item \\large \\textbf{Affected Hosts/URLs:} \\\\ ${report.Affected_Hosts} 
                    \\item \\large \\textbf{Summary:} \\\\${report.Summary}
                    \\item \\large \\textbf{proof of concept:} \\\\ 
                    \\item \\large \\textbf{Remediation:} \\\\${report.Remediation}
                    \\item \\large \\textbf{Remediation effect:} \\\\${report.Remediation_effort}
                \\end{description}`).join('\n')}
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
        // fs.unlinkSync('bug_report.pdf');
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

// let imagesContent = ''; // Initialize imagesContent variable

//         // Iterate through each bug report
//         for (const report of bugReports) {
//             // Check if the report has proof of concept images
//             if (report.Proof_of_concept && report.Proof_of_concept.length > 0) {
//                 // Iterate through each proof of concept image
//                 for (const [imageIndex, image] of report.Proof_of_concept.entries()) {
//                     // Convert binary data to Base64
//                     const base64Image = image.data.toString('base64');
//                     // Add LaTeX code for including the image to imagesContent
//                     imagesContent += `
//                         \\includegraphics[width=0.5\\textwidth]{data:${image.contentType};base64,${base64Image}}
//                     `;
//                 }
//             }
//         } ${report.Proof_of_concept.map(image => `\\includegraphics[width=0.5\\textwidth]{data:${image.contentType};base64,${image.data.toString('base64')}}`).join('\n')} 
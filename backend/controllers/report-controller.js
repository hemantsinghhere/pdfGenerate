const BugReport = require("../model/index.js");
const fs = require("fs");

const { spawnSync } = require('child_process');

const bugReport = async (req, res, next) => {
    try {
        // Retrieve all BugReport documents from the database
        const bugReports = await BugReport.find({});

        // const image = bugReports.map(report)
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
        const images = {
            data: req.file.buffer,
            contentType: req.file.mimetype
        };


        // Add images to the bug report data
        bugReportData.Proof_of_concept = images;

        // Create a new BugReport document and save it to the database
        const bugReport = new BugReport(bugReportData);
        await bugReport.save();
        console.log(req.files);
        res.json({ message: 'Bug report submitted successfully.'});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const generatePdf = async (req, res, next) => {

    const bugReports = await BugReport.find({});

   

    let low = 0; let medium = 0; let high = 0; let critical = 0; let info = 0; let total = 0;
    for (const report of bugReports) {
        const cvssScore = parseFloat(report.CVSS_Score.toString());
        if (cvssScore >= 0.0 && cvssScore < 4.0) {
            low += cvssScore;
        }
        else if (cvssScore >= 4.0 && cvssScore < 7.0) {
            medium += cvssScore;
        }
        else if (cvssScore >= 7.0 && cvssScore < 9.0) {
            high += cvssScore;
        }
        else {
            critical += cvssScore;
        }
    }
    const lo = Math.floor(low);
    const med = Math.floor(medium);
    const hi = Math.floor(high);
    const cri = Math.floor(critical);
    total = lo + med + hi + cri + info;
    const low_per = (lo / total) * 100;
    const medium_per = (med / total) * 100;
    const high_per = (hi / total) * 100;
    const critical_per = (cri / total) * 100;
    const info_per = (info / total) * 100;


    let table4 = `\\begin{longtable}{|p{30em}|p{10em}|}
            \\hline
            \\textbf{Finding Name} & \\textbf{Remediation Effort}  \\\\
            \\hline
            \\normalsize \\textcolor{critical}{\\textbf{Critical Severity Findings}} & \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{high}{\\textbf{High Severity Findings}}} \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{medium}{\\textbf{Medium Severity Findings}}} \\\\
            \\hline
            \\normalsize \\textbf{Reflected Cross Site Scripting (XSS) } & {Quick}\\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{low}{\\textbf{Low Severity Findings}}} \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{infotext}{\\textbf{Informational Findings}}} \\\\
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
            \\usepackage{tcolorbox}
            \\usepackage{tikz}
            \\usepackage{background}
            \\usetikzlibrary{calc}
            \\usetikzlibrary{fadings}
            \\usepackage{titletoc}
            \\usepackage{adjustbox}
            \\usepackage{subfigure}
            \\usepackage{pagecolor}
            \\usepackage{titletoc}
            \\usepackage[T1]{fontenc}
            \\usepackage[scaled]{uarial}
            \\usetikzlibrary{pie, fit}
            \\usepackage[calc,useregional]{datetime2}
            \\usepackage{datetime}
            \\usepackage{array}
            \\usepackage{wheelchart}
            \\usetikzlibrary{decorations.markings}
            \\usepackage{siunitx}
            \\usetikzlibrary{shapes.geometric, positioning}
            \\definecolor{darkgray}{RGB}{64,64,64}
            \\definecolor{tablecol}{RGB}{54,127,140}
            \\definecolor{tableco2}{RGB}{140,207,183}
            \\definecolor{textbold}{RGB}{9,62,82}
            \\definecolor{lightgray}{RGB}{245, 245, 245}
            \\definecolor{textcolor}{RGB}{9,62,82}
            \\definecolor{sectioncolor}{RGB}{5, 38, 37}
            \\definecolor{subsectioncolor}{RGB}{64,110,140}
            \\definecolor{critical}{RGB}{192,0,0}
            \\definecolor{high}{RGB}{255,0,0}
            \\definecolor{medium}{RGB}{255,192,0}
            \\definecolor{low}{RGB}{146,208,80}
            \\definecolor{info}{RGB}{242,242,242}
            \\definecolor{total}{RGB}{218,238,243}
            \\definecolor{shadow}{RGB}{227,227,227}
            \\definecolor{infotext}{RGB}{0,176,240}
            

            
            \\color{textcolor}
            \\renewcommand{\\rmdefault}{phv}
            \\renewcommand{\\sfdefault}{phv}
            \\pagecolor{white}
            \\pagestyle{fancy}
            \\fancyhf{}
            \\fancyheadoffset[R]{0cm}
            \\fancyhead[R]{\\includegraphics[width=.18\\textwidth]{vapt.jpeg}}
            \\fancyfoot[R]{\\textbf{\\thepage}}
            \\fancyfoot[c]{ \\textbf{Company Confidential}} 
            \\fancyfoot[l]{ \\textbf{VAPTLabs Report}} 
            \\renewcommand{\\headrulewidth}{0pt}
            \\renewcommand{\\footrule}{\\hspace{-2cm}\\makebox[\\dimexpr\\paperwidth\\relax]{\\rule{\\dimexpr\\paperwidth-1.5cm}{1.0pt}} }
            

            
            \\fancypagestyle{plain}{
            \\fancyhf{} 
            \\fancyhead{} 
            \\renewcommand{\\headrulewidth}{0pt}
            \\fancyfoot[R]{\\textbf{\\thepage}}
            \\fancyfoot[c]{ \\textbf{Company Confidential}} 
            \\fancyfoot[l]{ \\textbf{VAPTLabs Report}} 
            }

            \\thispagestyle{plain}
      
            \\geometry{
                left=2.0cm,
                right=2.0cm,
                top=3cm,
                bottom=3cm,
            }

            \\backgroundsetup{
                scale=1,
                angle=0,
                opacity=1,
                color=black,
                contents={
                    \\begin{tikzpicture}[remember picture, overlay] 
                    \\draw[line width=1pt] ($(current page.north west)+(0.3in, -0.3in)$) rectangle ($(current page.south east)+(-0.3in, 0.3in)$);
                    \\end{tikzpicture}
                    }
                }

            

            \\makeatletter
            \\renewcommand{\\section}{\\@startsection{section}{1}{\\z@}%
            {-1ex \\@plus -.1ex \\@minus -.01ex}%
            {1.0ex \\@plus  .01ex}%
            {\\normalfont\\large\\bfseries\\color{sectioncolor}}}

            
            \\renewcommand{\\subsection}{\\@startsection{subsection}{2}{\\z@}%
            {-.5ex\\@plus -.1ex \\@minus -.01ex}%
            {1.0ex \\@plus .01ex}%
            {\\normalfont\\large\\color{subsectioncolor}}}
            \\makeatother


            \\renewcommand{\\contentsname}{Table of Contents}
            \\titlecontents{section}
            [15pt] 
            {} 
            {\\contentslabel{2em}}
            {} % numberless format
            {\\titlerule*[0.5pc]{.}\\contentspage}

            \\begin{document}


            \\begin{minipage}{.30\\textwidth}
            \\begin{center}
            \\includegraphics[width=.8\\textwidth]{vapt.jpeg} 
            \\end{center}
            \\end{minipage}
            \\begin{minipage}{.60\\textwidth}
            \\huge XYZ Web Applications Security Assessment Report.                
            \\end{minipage}
            \\vspace{80pt}

            \\large XYZ Web App
            \\begin{tcolorbox}[colback=blue!10!white,colframe=white,width=1.0\\textwidth,height=5pt]
            \\end{tcolorbox}
            

            \\begin{minipage}{.40\\textwidth}
            \\textbf{REPORT PUBLISH DATE}
            \\end{minipage}
            \\begin{minipage}{.60\\textwidth}
            \\textbf{
            \\dayofweekname{\\day}{\\month}{\\year}
            \\shortmonthname[\\month] 
            \\the\\day \\
            \\the\\year \\
            \\currenttime~GMT+0000~(UTC)
            }
            \\end{minipage}


            \\vfill
            \\clearpage
            \\title{\\large Bug Report Summary}
            
            \\tableofcontents
            \\newpage
            \\section{\\large Executive Summary}
                \\subsection{\\large Strategic Recommendation }
                \\large It is recommended to fix all critical, high and medium vulnerabilities before releasing the application to
                    customer.
                \\subsection{\\large Scope of Work}
                \\normalsize The scope of this penetration test was limited to the URL mentioned below: 

                        \\begin{longtable}[l] {|p{4em}|p{7em}|p{10em}|p{18em}|}
                        \\hline 
                        \\multicolumn{4}{|p{42.7em}|}{\\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Scope Details}}} \\\\
                        \\hline
                        \\normalsize \\cellcolor{tableco2} \\textbf{Sr. No.} & \\normalsize \\cellcolor{tableco2} \\textbf{Application Name} & \\normalsize \\cellcolor{tableco2} \\textbf{Application URL} & \\normalsize \\cellcolor{tableco2} \\textbf{Scope}  \\\\    
                        \\hline
                        \\normalsize 1. & \\normalsize XYZ & \\normalsize http://65.21.6.24/ & \\normalsize XYZ web Application Manually \\& using Burpsuite \\\\
                        \\hline
                        \\end{longtable}   
                    
                \\subsection{\\large Summary of Findings}
                \\begin{itemize}[noitemsep]
                    \\item \\large Graphical Summary
                \\end{itemize}
                
                \\begin{minipage}{.55\\textwidth}
                \\normalsize \\textbf{Vulnerability v/s Severity Pie Chart} 
                \\end{minipage}
                \\begin{minipage}{.40\\textwidth}
                \\normalsize \\textbf{Vulnerability Summary}                
                \\end{minipage}

                \\vspace{20pt}
                \\begin{minipage} {0.50\\textwidth}                     
                \\begin{tcolorbox}[colback=blue!10!white,colframe=white,width=0.85\\textwidth]
                \\begin{tikzpicture}
                \\centering
                \\pie[color={critical, high, medium, low, info}, text=inside]{
                    0/Critical,
                    57/High,
                    29/Medium,
                    14/Low,
                    0/Info
                }
                \\end{tikzpicture}

                \\begin{minipage} {.025\\textwidth}
                \\colorbox{critical}{}
                \\end{minipage}
                \\begin{minipage} {.165\\textwidth}
                Critical
                \\end{minipage}
                \\begin{minipage} {.025\\textwidth}
                \\colorbox{high}{}
                \\end{minipage}
                \\begin{minipage} {.12\\textwidth}
                High
                \\end{minipage}
                \\begin{minipage} {.025\\textwidth}
                \\colorbox{medium}{}
                \\end{minipage}
                \\begin{minipage} {.19\\textwidth}
                Medium
                \\end{minipage}
                \\begin{minipage} {.03\\textwidth}
                \\colorbox{low}{}
                \\end{minipage}
                \\begin{minipage} {.11\\textwidth}
                Low
                \\end{minipage}
                \\begin{minipage} {.02\\textwidth}
                \\colorbox{info}{}
                \\end{minipage}
                \\begin{minipage} {.14\\textwidth}
                Info
                \\end{minipage}
                
                \\end{tcolorbox}
                \\end{minipage}
                \\begin{minipage}{.40\\textwidth}
                \\renewcommand{\\arraystretch}{1.63}
                \\begin{tabular}{|p{11em}|>{\\centering\\arraybackslash}p{6em}|}
                \\hline
                \\normalsize \\cellcolor{black!10} \\textbf{Severity} & \\normalsize \\cellcolor{black!10} \\textbf{Count} \\\\
                 \\hline
                 \\normalsize Critical &   \\normalsize \\cellcolor{critical} ${cri}  \\\\
                 \\hline
                 \\normalsize High & \\normalsize \\cellcolor{high} ${hi} \\\\
                 \\hline
                 \\normalsize Medium & \\normalsize \\cellcolor{medium} ${med} \\\\
                 \\hline
                 \\normalsize Low & \\normalsize \\cellcolor{low} ${lo} \\\\
                 \\hline
                 \\normalsize Informational & \\normalsize \\cellcolor{info} ${info} \\\\
                 \\hline
                 \\normalsize Total & \\normalsize \\cellcolor{total} ${total} \\\\
                 \\hline    
                \\end{tabular}
                \\end{minipage}

 

            \\newpage
            \\section{\\large CVSS: Score Vulnerabilities}
            \\large there are three types of scores that can be calculated: a base score, a temporal score and an environmental score. For purposes of reporting in this document, the CVSS base score will be provided. The base score assesses the following characteristics:
            \\begin{center}
                \\begin{longtable} {|p{8em}|p{30em}|}
                \\hline 
                \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Characteristics}} & \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Description}}   \\\\    
                \\hline
                \\normalsize Attack Vector & \\normalsize Assesses whether or an adversary can mount attack from a remote network, a local
                network or if an adversary must be logged on to the target of evaluation or physically
                connected.  \\\\
                \\hline
                \\normalsize Attack Complexity  & \\normalsize Assesses the complexity of an attack dependent on how many of the attack variables are
                within the control of the adversary.  \\\\
                \\hline
                \\normalsize Privileges Required  & \\normalsize Assesses the level of access that an attacker needs to mount a successful attack. \\\\
                \\hline
                \\normalsize User Interaction & \\normalsize Assesses the extent to which actions of the victim are required for an attack to be
                successful. \\\\
                \\hline
                \\normalsize Scope & \\normalsize Assess whether the impact of an attack is limited to the target of evaluation or if the attack
                has impact on other systems as well. \\\\
                \\hline
                \\normalsize Confidentiality & \\normalsize Assesses the negative impact that an attack can have on the target of evaluation's
                confidentiality. \\\\
                \\hline
                \\normalsize Integrity & \\normalsize Assesses the negative impact that an attack can have on the target of evaluation's
                integrity. \\\\
                \\hline
                \\normalsize Availability & \\normalsize Assesses the negative impact that an attack can have on the target of evaluation's
                availability. \\\\
                \\hline
                \\end{longtable}   
            \\end{center} 

            \\large As indicated above, the assessment of these characteristics results in a severity score which ranges
            from 1-10. This score can be further broken down into the following rating levels: \\\\
            \\newpage
            \\begin{center}
                \\begin{longtable} {|p{4.5em}|p{4.5em}|p{30em}|}
                \\hline 
                \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Range}} & \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Rating}} & \\large \\textcolor{white}{\\cellcolor{tablecol} \\textbf{Description}}   \\\\    
                \\hline
                \\normalsize \\textbf{9.0 - 10.0} & \\normalsize \\textcolor{critical}{\\textbf{Critical}} & \\normalsize These types of vulnerabilities should be reviewed immediately for impact to the
                business. This rating usually indicates that an exploit exists that could easily be use
                severely impact confidentiality, integrity and/or availability.  \\\\
                \\hline
                \\normalsize \\textbf{7.0 - 8.9} & \\normalsize \\textcolor{high}{\\textbf{High}} & \\normalsize These types of vulnerabilities need to be assessed in the short term for impact to the
                business. A score in this range indicates that a vulnerability could be exploited with
                low to medium complexity and could have moderate or high impact on confidentiality,
                integrity and/or availability.  \\\\
                \\hline
                \\normalsize \\textbf{4.0 - 6.9} & \\normalsize \\textcolor{medium}{\\textbf{Medium}} & \\normalsize These vulnerabilities should also be evaluated for impact to the business, but the
                base score shows that these types of vulnerabilities may be only exploitable with
                increased effort or have little impact to confidentiality, integrity and/or availability.  \\\\
                \\hline
                \\normalsize \\textbf{0.1 - 3.9}  & \\normalsize \\textcolor{low}{\\textbf{Low}} & \\normalsize These vulnerabilities should also be evaluated, but from evaluating the base
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
                \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Characteristics}} & \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Description}}   \\\\    
                \\hline
                \\normalsize Status & \\normalsize This field will contain either "Verified" or "Detected". If this value is "Verified", then the tester exploited this vulnerability during the penetration test. If it is "Detected",
                then evidence of the vulnerability was found, but it was not exploited during testing. There are many reasons why a tester may not be able to exploit a vulnerability
                during testing. Examples include threat of system instability after exploit, lack of time during testing and/or inability to find a vector by which a vulnerability could be exploited.  \\\\
                \\hline
                \\normalsize CVSSv3.1 Scoring  & \\normalsize This provides the overall severity score for a vulnerability including the individual
                assessments for attack vector, attack complexity, privileges required, user interaction, scope, confidentiality, integrity and availability.  \\\\
                \\hline
                \\normalsize Vulnerability Description  & \\normalsize This provides an overview of the identified vulnerability including how it could be useful to an adversary. \\\\
                \\hline
                \\normalsize Proof of Concept & \\normalsize This provides a description of how the vulnerability was detected and/or a description of how it can be reproduced for testing purposes. \\\\
                \\hline
                \\normalsize Affected Uri  & \\normalsize This provides a list of the url that are relevant to the vulnerability. \\\\
                \\hline
                \\normalsize Recommendation & \\normalsize This provides suggestions on how to mitigate the vulnerability. \\\\
                \\hline
                \\normalsize References & \\normalsize This provides links to CVEs, CWEs and other known resources to learn more about the vulnerability and how to mitigate the vulnerability. \\\\
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
                \\begin{longtable} {|p{3em}|p{15em}|p{6em}|c|c|}
                    \\hline 
                    \\multicolumn{5}{|p{40em}|}{\\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Summary Table}}} \\\\
                    \\hline
                    \\normalsize \\cellcolor{tableco2} \\textbf{Sr. No.} & \\normalsize \\cellcolor{tableco2} \\textbf{Vulnerability Name} & \\normalsize \\cellcolor{tableco2} \\textbf{OWASP Category} & \\normalsize \\cellcolor{tableco2} \\textbf{Severity} & \\normalsize \\cellcolor{tableco2} \\textbf{CVSS Score++} \\\\    
                    \\hline
                    ${bugReports.map((report, index) => `
                    \\normalsize \\center \\textbf{${index + 1}} & \\normalsize \\textbf{${report.Title}} & \\normalsize \\textbf{A05-security Misconfiguration} & \\normalsize \\textbf{${report.Severity === 'Informational' ? `\\textcolor{infotext}{Info}` : report.Severity === 'Medium' ? `\\textcolor{medium}{Medium}` : report.Severity === 'High' ? `\\textcolor{high}{High}` : report.Severity === 'Critical' ? `\\textcolor{critical}{Critical}` : `\\textcolor{low}{Low}`}} &  ${report.CVSS_Score} \\\\
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
                \\subsection{\\large ${report.Title}}
                \\begin{description}[itemsep=2pt, leftmargin=0.2cm]
                    \\item \\large \\textbf{Status:} ${report.Status}
                    \\item \\large \\textbf{Severity: \\textcolor{infotext} {${report.Severity}}}
                    \\item \\large \\textbf{OWASP Category: ${report.OWASP_Category}}
                    \\item \\large \\textbf{CVSS Score:} ${report.CVSS_Score} 
                    \\item \\large \\textbf{Affected Hosts/URLs:}
                           \\begin{itemize} 
                           \\item \\large \\href{${report.Affected_Hosts}} {${report.Affected_Hosts}}
                           \\end{itemize}
                    \\item \\large \\textbf{Summary:} \\\\  ${report.Summary}

                    \\item \\large \\textbf{Steps of Reproduce:}
                            \\linespread{1.0}
                            \\begin{enumerate}[leftmargin=0.5cm]
                             ${report.Steps_of_Reproduce.map((step) => `
                             \\item \\large ${step}`).join('\n')}
                             \\end{enumerate}

                    \\item \\large \\textbf{proof of concept: \\\\ \\includegraphics[width=1.0\\textwidth]{2.png}} 


                    

                    \\item \\large \\textbf{Impact:}
                            \\linespread{1.0}
                            \\begin{enumerate}[leftmargin=0.5cm]
                             ${report.Impact.map((impactItem) =>
        `\\item \\large ${impactItem.toString()}`).join('\n')} 
                            \\end{enumerate}  
                            
                            
                    \\item \\large \\textbf{Remediation:}
                            \\linespread{1.0}
                            \\begin{enumerate}[leftmargin=0.5cm]
                             ${report.Remediation.map((remediation, index) => `
                                \\item \\large ${remediation.toString()}`).join('\n')}
                            \\end{enumerate}

                    \\item \\large \\textbf{Reference:}
                            \\linespread{1.0}
                            \\begin{enumerate}[leftmargin=0.5cm, ]
                                ${report.Links.map((link, index) => `
                            \\item \\large \\underline{\\href{${link}} {${link.toString()}}}`).join('\n')}
                            \\end{enumerate}
                    
                \\end{description}`).join('\n')}


            \\newpage
            \\section{\\large Annexures}
                \\subsection{\\large OWASP TOP 10:2021}

                \\begin{center}
                \\begin{longtable} {|p{9em}|p{30em}|}
                \\hline
                \\multicolumn{2}{|p{40em}|} {\\cellcolor{tablecol}\\textbf{OWASP TOP 10:2021}} \\\\
                \\hline
                \\large \\cellcolor{tableco2} \\textbf{Name} & \\large \\cellcolor{tableco2} \\textbf{Description} \\\\
                \\hline
                \\normalsize \\textbf{A01:2021-Broken Access Control} & 
                \\normalsize Access control enforces policy such that users cannot act outside of their intended
                permissions. Failures typically lead to unauthorized information disclosure, modification,
                or destruction of all data or performing a business function outside the user's limits. \\\\
                \\hline
                \\normalsize \\textbf{A02:2021 - Cryptographic Failures} & 
                \\normalsize Previously known as Sensitive Data Exposure, Cryptographic Failures involve protecting
                data in transit and at rest. This includes passwords, credit card numbers, health records,
                personal information, and business secrets that require extra protection, especially if that
                data falls under privacy. \\\\
                \\hline
                \\normalsize \\textbf{A03:2021-Injection} & 
                \\normalsize Injection flaws, such as SQL, OS, XXE, XSS and LDAP injection occur when untrusted
                data is sent to an interpreter as part of a command or query. The attacker's hostile data
                can trick the interpreter into executing unintended commands or accessing data without
                proper authorization. \\\\
                \\hline
                \\normalsize \\textbf{A04:2021-Insecure Design (Currently out of scope) } & 
                \\normalsize Insecure design is a broad category representing different weaknesses, expressed as
                "missing or ineffective control design." Secure design is a culture and methodology that
                constantly evaluates threats and ensures that code is robustly designed and tested to
                prevent known attack methods. \\\\
                \\hline
                \\normalsize \\textbf{A05:2021-Security Misconfiguration} & 
                \\normalsize Security misconfiguration is the most commonly seen issue. This is commonly a result of
                insecure default configurations, incomplete or ad hoc configurations, open cloud storage,
                misconfigured HTTP headers, and verbose error messages containing sensitive
                information. Not only must all operating systems, frameworks, libraries, and applications
                be securely configured, but they must be patched/upgraded in a timely fashion. \\\\
                \\hline
                \\normalsize \\textbf{A06:2021-Vulnerable and Outdated Components} & 
                \\normalsize Components, such as libraries, frameworks, and other software modules, almost always
                run with full privileges. If a vulnerable component is exploited, such an attack can facilitate
                serious data loss or server takeover. Applications using components with known
                vulnerabilities may undermine application defences and enable a range of possible attacks
                and impacts. \\\\
                \\hline
                \\normalsize \\textbf{A07:2021- Identification and Authentication Failures} & 
                \\normalsize Application functions related to authentication and session management are often
                implemented incorrectly, allowing attackers to compromise passwords, keys, or session
                tokens, or to exploit other implementation flaws to assume other users' identities
                (temporarily or permanently). \\\\
                \\hline
                \\normalsize \\textbf{A08:2021 - Software and Data Integrity Failures (Currently out of scope)} & 
                \\normalsize Software and data integrity failures relate to code and infrastructure that does not protect
                against integrity violations. This new category is making assumptions related to software
                updates, critical data, and CI/CD pipelines without verifying integrity. \\\\
                \\hline
                \\normalsize \\textbf{A09:2021-Security Logging and Monitoring Failures} & 
                \\normalsize Insufficient logging and monitoring, coupled with missing or ineffective integration with
                incident response, allows attackers to further attack systems, maintain persistence, pivot
                to more systems, and tamper, extract, or destroy data. Most breach studies show time to
                detect a breach is over 200 days, typically detected by external parties rather than internal
                processes or monitoring. \\\\
                \\hline
                \\normalsize \\textbf{A10:2021-ServerSide Request Forgery(SSRF)} & 
                \\normalsize SSRF flaws occur whenever a web application is fetching a remote resource without
                validating the user-supplied URL. It allows an attacker to coerce the application to send a
                crafted request to an unexpected destination, even when protected by a firewall, VPN, or
                another type of network access control list (ACL). \\\\
                \\hline
                \\end{longtable}
                \\end{center}


                \\subsection{\\large Tools Used}

                \\begin{center}
                \\begin{longtable} {|p{5em}|p{28em}|}
                \\hline
                \\multicolumn{2}{|p{34em}|} {\\cellcolor{tablecol} \\textbf{Tools:}} \\\\
                \\hline
                \\large \\cellcolor{tableco2} \\textbf{Name} & \\large \\cellcolor{tableco2} \\textbf{Description} \\\\
                \\hline
                \\normalsize \\textbf{Burp suite} & \\normalsize \\textbf{Burp Suite is an integrated platform for attacking web applications.} \\large http://portswigger.net/suite \\\\
                \\hline
                \\normalsize \\textbf{Nmap} & \\normalsize \\textbf{Nmap is a network mapper tool to scan for SSL related vulnerabilities} \\large https://nmap.org \\\\
                \\hline
                \\end{longtable}
                \\end{center}


                
            \\end{document}
        `;


    // Write LaTeX content to .tex file
    fs.writeFileSync('bug_report.tex', latexContent);

    // Compile LaTeX to PDF
    const pdflatex = spawnSync('pdflatex', ['bug_report.tex']);

    // if (pdflatex.status === 0) {
    //     console.log('PDF report generated successfully.');
    // } else {
    //     console.error('Error generating PDF report:', pdflatex.stderr.toString());
    //     throw new Error('Failed to generate PDF report.');
    // }

    // Send the generated PDF as a response
    const pdfBuffer = fs.readFileSync('bug_report.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=BugReport.pdf');
    res.send(pdfBuffer);

    console.log("Bug report generated");


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



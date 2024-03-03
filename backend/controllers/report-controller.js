const puppeteer = require('puppeteer');
const BugReport = require("../model/index.js");

const fs = require("fs");

const { spawnSync } = require('child_process');

const bugReport = async (req, res, next) => {
    try {
        // Retrieve all BugReport documents from the database
        const bugReports = await BugReport.find({});

        const image = bugReports.map(report)
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
        res.json({ message: 'Bug report submitted successfully.' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const generatePdf = async (req, res, next) => {
    try {
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
            \\normalsize \\textbf{Critical Severity Findings} & \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{blue}{\\textbf{High Severity Findings}}} \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{blue}{\\textbf{Medium Severity Findings}}} \\\\
            \\hline
            \\normalsize \\textbf{Reflected Cross Site Scripting (XSS) } & {Quick}\\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{blue}{\\textbf{Low Severity Findings}}} \\\\
            \\hline
            \\multicolumn{2}{|p{20em}|}{\\normalsize \\textcolor{blue}{\\textbf{Informational Findings}}} \\\\
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
            \\usepackage{tikz}
            \\usetikzlibrary{calc}
            \\usetikzlibrary{fadings}
            \\usepackage{adjustbox}
            \\usepackage{subfigure}
            \\usepackage{graphicx}
            \\usepackage{pagecolor}
            \\usepackage[T1]{fontenc}
            \\usepackage[scaled]{uarial}
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

            \\pgfkeys{
                /piechartthreed/.cd,
                scale/.code                =  {\\def\\piechartthreedscale{#1}},
                mix color/.code            =  {\\def\\piechartthreedmixcolor{#1}},
                background color/.code     =  {\\def\\piechartthreedbackcolor{#1}},
                name/.code                 =  {\\def\\piechartthreedname{#1}}
            }

            \\newcommand\\piechartthreed[2][]{ 
                \\pgfkeys{/piechartthreed/.cd,
                    scale            = 1,
                    mix color        = gray,
                    background color = white,
                    name             = pc
                } 

                \\pgfqkeys{/piechartthreed}{#1}
                \\begin{scope}[scale=\\piechartthreedscale] 
                \\begin{scope}[xscale=5,yscale=3] 
                    \\path[preaction={fill=black,opacity=.8,
                        path fading=circle with fuzzy edge 20 percent,
                        transform canvas={yshift=-15mm*\\piechartthreedscale}}] (0,0) circle (1cm);
                    \\pgfmathsetmacro\\totan{0} 
                    \\global\\let\\totan\\totan 
                    \\pgfmathsetmacro\\bottoman{180} \\global\\let\\bottoman\\bottoman 
                    \\pgfmathsetmacro\\toptoman{0}   \\global\\let\\toptoman\\toptoman 
                    \\begin{scope}[draw=black,thin]
                        \\foreach \\an/\\col [count=\\xi] in {#2}{%
                            \\def\\space{ } 
                            \\coordinate (\\piechartthreedname\\space\\xi) at (\\totan+\\an/2:0.75cm); 
                            \\ifdim 180pt>\\totan pt 
                                \\ifdim 0pt=\\toptoman pt
                                    \\pgfmathsetmacro\\toptoman{180} 
                                    \\global\\let\\toptoman\\toptoman         
                                \\else
                                \\fi
                            \\fi   
                            \\fill[\\col!80!gray,draw=black] (0,0)--(\\totan:1cm)  arc(\\totan:\\totan+\\an:1cm) --cycle;     
                            \\pgfmathsetmacro\\finan{\\totan+\\an}
                            \\ifdim 180pt<\\finan pt 
                                \\ifdim 180pt=\\bottoman pt
                                    \\shadedraw[left color=\\col!20!\\piechartthreedmixcolor,
                                        right color=\\col!5!\\piechartthreedmixcolor,
                                        draw=black,very thin] (180:1cm) -- ++(0,-3mm) arc (180:\\totan+\\an:1cm) -- ++(0,3mm) arc (\\totan+\\an:180:1cm);
                                    \\pgfmathsetmacro\\bottoman{0}
                                    \\global\\let\\bottoman\\bottoman
                                \\else
                                    \\shadedraw[left color=\\col!20!\\piechartthreedmixcolor,
                                        right color=\\col!5!\\piechartthreedmixcolor,
                                        draw=black,very thin](\\totan:1cm)-- ++(0,-3mm) arc(\\totan:\\totan+\\an:1cm) -- ++(0,3mm)  arc(\\totan+\\an:\\totan:1cm); 
                                \\fi
                            \\fi
                            \\pgfmathsetmacro\\totan{\\totan+\\an}  
                            \\global\\let\\totan\\totan 
                        } 
                    \\end{scope}
                \\end{scope}  
                \\end{scope}
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


            \\begin{document}
            \\title{\\large Bug Report Summary}
            \\maketitle

            
            \\tableofcontents

            \\newpage
            \\section{Executive Summary}
                \\subsection{\\large Strategic Recommendation }
                \\large It is recommended to fix all critical, high and medium vulnerabilities before releasing the application to
                    customer.
                \\subsection{\\large Scope of Work}
                \\normalsize The scope of this penetration test was limited to the URL mentioned below: \\\\
                    \\begin{center}
                        \\begin{longtable} {|p{4em}|p{7em}|p{10em}|p{18em}|}
                        \\hline 
                        \\multicolumn{4}{|p{42.8em}|}{\\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Scope Details}}} \\\\
                        \\hline
                        \\normalsize \\cellcolor{tableco2} \\textbf{Sr. No.} & \\normalsize \\cellcolor{tableco2} \\textbf{Application Name} & \\normalsize \\cellcolor{tableco2} \\textbf{Application URL} & \\normalsize \\cellcolor{tableco2} \\textbf{Scope}  \\\\    
                        \\hline
                        \\normalsize 1. & \\normalsize Callyzer & \\normalsize http://65.21.6.24/ & \\normalsize Callyzer web Application Manually \\& using Burpsuite \\\\
                        \\hline
                        \\end{longtable}   
                    \\end{center}

                \\subsection{\\large Summary of Findings}
                \\begin{itemize}[noitemsep]
                    \\item \\large Graphical Summary
                \\end{itemize}
                
                \\begin{minipage}{.50\\textwidth}
                \\normalsize \\textbf{Vulnerability v/s Severity Pie Chart} 
                \\end{minipage}
                \\begin{minipage}{.50\\textwidth}
                \\normalsize \\textbf{Vulnerability Summary}                
                \\end{minipage}

                

                \\begin{minipage} {0.30\\textwidth}
             
                \\begin{tikzpicture}
                \\piechartthreed[scale= 0.3, mix color= darkgray]{${low_per}*3.6/red, ${medium_per}*3.6/blue, ${critical_per}*3.6 /green, ${high_per}*3.6/purple, ${info_per}*3.6/darkgray}
                \\foreach \\i in {1,...,5} { \\fill (pc \\i) circle (.5mm);}
                \\draw[darkgray] (pc 1)  -- ++(3,0) coordinate (s1) node[anchor=south east] {\\colorbox{black!60}{\\textcolor{white}{Low}}} node[anchor=north east] {\\colorbox{black!60}{\\textcolor{white}{ ${low_per}\\%, ${lo}}} };
                \\draw[darkgray] (pc 2)  -- ++(-3, 0) coordinate (s2)  node[anchor=south west] {Medium} node[anchor=north west] {${medium_per}\\% ,${med}}; 
                \\draw[darkgray] (pc 3)  -- ++(-1.5,-2.5) coordinate (s3) -- ++(1,0) node[anchor=south west] {Critical} node[anchor=north west] {${critical_per}\\%,${cri}}; 
                \\draw[darkgray] (pc 4)  -- ++(-2, -2) coordinate (s4) -- ++(-1,0) node[anchor=south west] {High} node[anchor=north west] {${high_per}\\%, ${hi}}; 
                \\draw[darkgray] (pc 5)  -- ++(1,-1) coordinate (s5) -- ++(1,0) node[anchor=south west] {Info} node[anchor=north west] {${info_per}\\%, ${info}}; 
                \\end{tikzpicture}
                
                \\end{minipage}

                
                \\begin{minipage} {0.40\\textwidth}
                \\begin{tabular}{|p{7em}|c|}
                \\hline
                \\normalsize \\cellcolor{black!10} \\textbf{Severity} & \\normalsize \\cellcolor{black!10} \\textbf{Count} \\\\
                 \\hline
                 \\normalsize Critical & \\normalsize \\cellcolor{red!100} ${cri} \\\\
                 \\hline
                 \\normalsize High & \\normalsize \\cellcolor{orange} ${hi} \\\\
                 \\hline
                 \\normalsize Medium & \\normalsize \\cellcolor{yellow} ${med} \\\\
                 \\hline
                 \\normalsize Low & \\normalsize \\cellcolor{green!100} ${lo} \\\\
                 \\hline
                 \\normalsize Informational & \\normalsize \\cellcolor{black!10} ${info} \\\\
                 \\hline
                 \\normalsize Total & \\normalsize \\cellcolor{blue!30} ${total} \\\\
                 \\hline    
                \\end{tabular}
               
                \\end{minipage}
            
                
            \\begin{figure}
            \\centering
                
            \\end{figure}    
                
            

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

            \\begin{center}
                \\begin{longtable} {|p{4.5em}|p{4.5em}|p{30em}|}
                \\hline 
                \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Range}} & \\large \\cellcolor{tablecol} \\textcolor{white}{\\textbf{Rating}} & \\large \\textcolor{white}{\\cellcolor{tablecol} \\textbf{Description}}   \\\\    
                \\hline
                \\normalsize \\textbf{9.0 - 10.0} & \\normalsize \\textcolor{red!100}{\\textbf{Critical}} & \\normalsize These types of vulnerabilities should be reviewed immediately for impact to the
                business. This rating usually indicates that an exploit exists that could easily be use
                severely impact confidentiality, integrity and/or availability.  \\\\
                \\hline
                \\normalsize \\textbf{7.0 - 8.9} & \\normalsize \\textcolor{orange}{\\textbf{High}} & \\normalsize These types of vulnerabilities need to be assessed in the short term for impact to the
                business. A score in this range indicates that a vulnerability could be exploited with
                low to medium complexity and could have moderate or high impact on confidentiality,
                integrity and/or availability.  \\\\
                \\hline
                \\normalsize \\textbf{4.0 - 6.9} & \\normalsize \\textcolor{yellow}{\\textbf{Medium}} & \\normalsize These vulnerabilities should also be evaluated for impact to the business, but the
                base score shows that these types of vulnerabilities may be only exploitable with
                increased effort or have little impact to confidentiality, integrity and/or availability.  \\\\
                \\hline
                \\normalsize \\textbf{0.1 - 3.9}  & \\normalsize \\textcolor{green}{\\textbf{Low}} & \\normalsize These vulnerabilities should also be evaluated, but from evaluating the base
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
                    \\normalsize \\center \\textbf{${index + 1}} & \\normalsize \\textbf{${report.Title}} & \\normalsize \\textbf{A05-security Misconfiguration} & \\normalsize \\textbf{${report.Severity === 'Informational' ? `\\textcolor{blue}{Info}` : report.Severity === 'Medium' ? `\\textcolor{yellow}{Medium}`: report.Severity ==='High' ? `\\textcolor{orange}{High}` : report.Severity === 'Critical' ? `\\textcolor{red!100}{Critical}` : `\\textcolor{green}{Low}` }} &  ${report.CVSS_Score} \\\\
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
                \\begin{description}
                    \\item \\large \\textbf{\\textcolor{black} Status:} ${report.Status}
                    \\item \\large \\textbf{Severity: \\textcolor{blue}{${report.Severity}}}
                    \\item \\large \\textbf{OWASP Category: ${report.OWASP_Category}}
                    \\item \\large \\textbf{CVSS Score:} ${report.CVSS_Score} 
                    \\item \\large \\textbf{Affected Hosts/URLs:} \\\\ \\href{${report.Affected_Hosts}} {${report.Affected_Hosts}}
                    \\item \\large \\textbf{Summary:} \\\\${report.Summary}
                    \\item \\large \\textbf{proof of concept: } \\\\ 
                    \\item \\large \\textbf{Reference:\\\\} \\large \\href{${report.Links}} {${report.Links.toString()}} \\\\ 
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
                \\begin{longtable} {|p{5em}|p{34em}|}
                \\hline
                \\multicolumn{2}{|p{40em}|} {\\cellcolor{tablecol} \\textbf{Tools:}} \\\\
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
//             }  \\includegraphics[width=0.5\\textwidth]{data:image/png;base64,${Buffer.from(report.proof_of_concept.data).toString('base64')}}
//         } ${report.Proof_of_concept.map(image => `\\includegraphics[width=0.5\\textwidth]{data:${image.contentType};base64,${image.data.toString('base64')}}`).join('\n')} 


// \\begin{ figure } [htbp]
// \\includegraphics[width = 0.5\\textwidth]{ data:${ bugReports.Proof_of_concept.contentType }; base64, ${ base64Image } }
// \\end{ figure }

// \begin{figure}[htbp]
//     \centering
//     \includegraphics[width=0.5\textwidth]{https://example.com/image.png}
//     \caption{Caption of the image}
//     \label{fig:image}
// \end{figure}
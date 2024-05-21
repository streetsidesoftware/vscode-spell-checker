"use strict";(self.webpackChunkmy_website=self.webpackChunkmy_website||[]).push([[472],{3799:(e,s,n)=>{n.r(s),n.d(s,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>t,metadata:()=>o,toc:()=>d});var i=n(4848),l=n(8453);const t={layout:"default",title:"Release Notes v2.0",categories:"release-notes",parent:"Release Notes",nav_order:4},r="Version 2.0",o={id:"release-notes/releasenotes_v2",title:"Release Notes v2.0",description:"Highlights",source:"@site/docs/release-notes/releasenotes_v2.md",sourceDirName:"release-notes",slug:"/release-notes/releasenotes_v2",permalink:"/vscode-spell-checker/docs2/docs/release-notes/releasenotes_v2",draft:!1,unlisted:!1,editUrl:"https://github.com/streetsidesoftware/vscode-spell-checker/tree/main/website/docs/docs/release-notes/releasenotes_v2.md",tags:[],version:"current",frontMatter:{layout:"default",title:"Release Notes v2.0",categories:"release-notes",parent:"Release Notes",nav_order:4},sidebar:"tutorialSidebar",previous:{title:"Release Notes",permalink:"/vscode-spell-checker/docs2/docs/release-notes/"},next:{title:"Release Notes v4.0",permalink:"/vscode-spell-checker/docs2/docs/release-notes/releasenotes_v4"}},c={},d=[{value:"Highlights",id:"highlights",level:2},{value:"Manual Installation",id:"manual-installation",level:2},{value:"Previous and Next Issue Commands",id:"previous-and-next-issue-commands",level:2},{value:"Turning on case sensitive spell checking",id:"turning-on-case-sensitive-spell-checking",level:2},{value:"Making Words Forbidden",id:"making-words-forbidden",level:2}];function a(e){const s={a:"a",code:"code",h1:"h1",h2:"h2",img:"img",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,l.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(s.h1,{id:"version-20",children:"Version 2.0"}),"\n",(0,i.jsx)(s.h2,{id:"highlights",children:"Highlights"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsx)(s.li,{children:"By default, only files in a workspace are spell checked."}),"\n",(0,i.jsxs)(s.li,{children:["Be able to specify which files to check by adding globs to ",(0,i.jsx)(s.code,{children:"files"})," setting."]}),"\n",(0,i.jsx)(s.li,{children:"Spelling suggestions available from the context menu."}),"\n",(0,i.jsx)(s.li,{children:"Improved context menu options."}),"\n",(0,i.jsxs)(s.li,{children:["Upgrades ",(0,i.jsx)(s.a,{href:"https://www.npmjs.com/package/cspell",children:"cspell"})," to version 5.9.0."]}),"\n",(0,i.jsxs)(s.li,{children:["Supports case sensitive dictionaries. See: ",(0,i.jsx)(s.a,{href:"#turning-on-case-sensitive-spell-checking",children:"Turning on case sensitive spell checking"})]}),"\n",(0,i.jsxs)(s.li,{children:["Full support of Yaml configuration files: ",(0,i.jsx)(s.code,{children:"cspell.config.yaml"})]}),"\n",(0,i.jsxs)(s.li,{children:["Full support of configuration in ",(0,i.jsx)(s.code,{children:"package.json"})," under ",(0,i.jsx)(s.code,{children:"cspell"})," section."]}),"\n",(0,i.jsxs)(s.li,{children:["Partial support of JavaScript configuration files: ",(0,i.jsx)(s.code,{children:"cspell.config.js"}),"\nThe extension supports reading the configuration but can only write to ",(0,i.jsx)(s.code,{children:".json"})," and ",(0,i.jsx)(s.code,{children:".yaml"})," files."]}),"\n",(0,i.jsx)(s.li,{children:"Supports dictionary entries that have numbers and mixed case."}),"\n",(0,i.jsxs)(s.li,{children:["Supports more word splitting formats\nIt correctly splits both ",(0,i.jsx)(s.code,{children:"ERRORcode"})," and ",(0,i.jsx)(s.code,{children:"ERRORCode"})]}),"\n",(0,i.jsx)(s.li,{children:"Reduced installation size and faster loading"}),"\n",(0,i.jsxs)(s.li,{children:["Added Commands to move between issues in a document. See: ",(0,i.jsx)(s.a,{href:"#previous-and-next-issue-commands",children:"Previous and Next Issue Commands"})]}),"\n"]}),"\n",(0,i.jsx)(s.h2,{id:"manual-installation",children:"Manual Installation"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:["Download and decompress ",(0,i.jsx)(s.code,{children:"code-spell-checker.zip"})," from ",(0,i.jsx)(s.a,{href:"https://github.com/streetsidesoftware/vscode-spell-checker/releases",children:"VS Code Spell Checker Releases"})]}),"\n",(0,i.jsxs)(s.li,{children:["From VS Code Install from VSIX ",(0,i.jsx)(s.code,{children:"code-spell-checker-2.0.2.vsix"}),"\n",(0,i.jsx)(s.img,{src:"https://user-images.githubusercontent.com/3740137/120071300-f0a27600-c08e-11eb-9828-155be0405510.png",alt:"image"})]}),"\n"]}),"\n",(0,i.jsx)(s.h1,{id:"features",children:"Features"}),"\n",(0,i.jsx)(s.h2,{id:"previous-and-next-issue-commands",children:"Previous and Next Issue Commands"}),"\n",(0,i.jsxs)(s.table,{children:[(0,i.jsx)(s.thead,{children:(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.th,{children:"Command"}),(0,i.jsx)(s.th,{children:"Description"})]})}),(0,i.jsxs)(s.tbody,{children:[(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"cSpell.goToNextSpellingIssue"})}),(0,i.jsx)(s.td,{children:"Go to Next Spelling Issue"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"cSpell.goToPreviousSpellingIssue"})}),(0,i.jsx)(s.td,{children:"Go to Previous Spelling Issue"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"cSpell.goToNextSpellingIssueAndSuggest"})}),(0,i.jsx)(s.td,{children:"Go to Next Spelling Issue and Suggest"})]}),(0,i.jsxs)(s.tr,{children:[(0,i.jsx)(s.td,{children:(0,i.jsx)(s.code,{children:"cSpell.goToPreviousSpellingIssueAndSuggest"})}),(0,i.jsx)(s.td,{children:"Go to Previous Spelling Issue and Suggest"})]})]})]}),"\n",(0,i.jsx)(s.h2,{id:"turning-on-case-sensitive-spell-checking",children:"Turning on case sensitive spell checking"}),"\n",(0,i.jsxs)(s.p,{children:["See: ",(0,i.jsx)(s.a,{href:"https://streetsidesoftware.github.io/cspell/docs/case-sensitive/",children:"Case Sensitivity - CSpell"})]}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.strong,{children:"VS Code UI"})}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.img,{src:"https://user-images.githubusercontent.com/3740137/129460586-498f1bf4-3b53-43d6-b525-7ad283b8e8bf.png",alt:"image"})}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsxs)(s.strong,{children:["VS Code ",(0,i.jsx)(s.code,{children:"settings.json"})]})}),"\n",(0,i.jsx)(s.pre,{children:(0,i.jsx)(s.code,{className:"language-jsonc",children:'"cSpell.caseSensitive": true\n'})}),"\n",(0,i.jsx)(s.p,{children:(0,i.jsx)(s.strong,{children:(0,i.jsx)(s.code,{children:"cspell.json"})})}),"\n",(0,i.jsx)(s.pre,{children:(0,i.jsx)(s.code,{className:"language-jsonc",children:'"caseSensitive": true\n'})}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsxs)(s.strong,{children:["For a file type: ",(0,i.jsx)(s.code,{children:"markdown"})]}),"\n",(0,i.jsx)(s.code,{children:"cspell.json"})]}),"\n",(0,i.jsx)(s.pre,{children:(0,i.jsx)(s.code,{className:"language-jsonc",children:'"languageSettings": [\n    { "languageId": "markdown", "caseSensitive": true }\n]\n'})}),"\n",(0,i.jsxs)(s.p,{children:[(0,i.jsxs)(s.strong,{children:["For a file extension: ",(0,i.jsx)(s.code,{children:"*.md"})]}),"\n",(0,i.jsx)(s.code,{children:"cspell.json"})]}),"\n",(0,i.jsx)(s.pre,{children:(0,i.jsx)(s.code,{className:"language-jsonc",children:'"overrides": [\n    { "filename": "*.md", "caseSensitive": true }\n]\n'})}),"\n",(0,i.jsx)(s.h2,{id:"making-words-forbidden",children:"Making Words Forbidden"}),"\n",(0,i.jsxs)(s.p,{children:["See: ",(0,i.jsx)(s.a,{href:"https://streetsidesoftware.github.io/cspell/docs/forbidden-words/",children:"How to Forbid Words - CSpell"})]}),"\n",(0,i.jsx)(s.h1,{id:"contributions",children:"Contributions"}),"\n",(0,i.jsxs)(s.ul,{children:["\n",(0,i.jsxs)(s.li,{children:[(0,i.jsx)(s.a,{href:"https://github.com/elazarcoh",children:"elazarcoh"})," - added previous/next issue commands."]}),"\n"]})]})}function h(e={}){const{wrapper:s}={...(0,l.R)(),...e.components};return s?(0,i.jsx)(s,{...e,children:(0,i.jsx)(a,{...e})}):a(e)}},8453:(e,s,n)=>{n.d(s,{R:()=>r,x:()=>o});var i=n(6540);const l={},t=i.createContext(l);function r(e){const s=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function o(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(l):e.components||l:r(e.components),i.createElement(t.Provider,{value:s},e.children)}}}]);
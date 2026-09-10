import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import InstallPicker from '@site/src/components/InstallPicker';
import styles from './index.module.css';

const IMAGES = 'https://raw.githubusercontent.com/streetsidesoftware/vscode-spell-checker/main/images';

function Hero(): React.ReactNode {
    return (
        <header className={styles.hero}>
            <div className={styles.heroInner}>
                <div>
                    <p className={styles.eyebrow}>Spell checking for source code and documentation</p>
                    <h1 className={styles.heroTitle}>VS Code Spell Checker</h1>
                    <p className={styles.heroLead}>
                        A spell checker for Visual Studio Code, designed for source code. It splits identifiers such as{' '}
                        <code>camelCase</code> into words, and disregards symbols, hex values, and URLs.
                    </p>
                    <p className={styles.heroNote}>
                        All checking is performed locally. Dictionaries are stored on the machine; no document content is transmitted.
                    </p>
                    <InstallPicker />
                </div>
                <figure className={styles.heroFigure}>
                    <div className={styles.windowChrome}>
                        <span /> <span /> <span />
                    </div>
                    <img
                        src={`${IMAGES}/suggestions.gif`}
                        alt="Quick Fix suggesting a correction for an unrecognized word in Visual Studio Code"
                        loading="eager"
                    />
                    <figcaption>Quick Fix on an unrecognized word: apply a suggestion, or add the word to a dictionary.</figcaption>
                </figure>
            </div>
        </header>
    );
}

type Door = {
    kicker: string;
    kickerClass: string;
    title: string;
    body: React.ReactNode;
    points?: React.ReactNode[];
    to: string;
    linkText: string;
    sample?: boolean;
};

const DOORS: Door[] = [
    {
        kicker: 'Installation',
        kickerClass: styles.kickerGreen,
        title: 'Getting started',
        body: 'Installation, verification, and the two commands used most frequently in daily work.',
        points: [
            <>Install and verify operation</>,
            <>
                Fix a word with <code>Ctrl</code> <code>.</code>
            </>,
            <>Add project-specific terminology</>,
        ],
        to: '/docs/getting-started/install',
        linkText: 'Get Started',
    },
    {
        kicker: 'Behavior',
        kickerClass: styles.kickerRust,
        title: 'What is reported',
        body: 'Identifiers are split into their component words. Symbols, hex values, and words of three characters or fewer are not reported.',
        sample: true,
        to: '/docs/getting-started/how-it-works',
        linkText: 'How code is analyzed',
    },
    {
        kicker: 'Configuration',
        kickerClass: styles.kickerBlue,
        title: 'Configuration and directives',
        body: (
            <>
                The complete settings reference, together with the in-document <code>cSpell:</code> directives.
            </>
        ),
        points: [<>Languages &amp; dictionaries</>, <>Files, folders &amp; workspaces</>, <>Reporting, appearance, performance</>],
        to: '/docs/configuration',
        linkText: 'Configuration reference',
    },
];

function CodeSample(): React.ReactNode {
    // cspell:ignore recieve lenght
    return (
        <div className={styles.sample}>
            <div>
                <span className={styles.kw}>const</span> <span className={styles.bad}>recieve</span>Message = ...
            </div>
            <div>
                <span className={styles.cmt}>// the</span> <span className={styles.bad}>lenght</span>{' '}
                <span className={styles.cmt}>of the queue</span>
            </div>
            <div>
                <span className={styles.attr}>color</span>: <span className={styles.val}>#3f8ac2</span>;{' '}
                <span className={styles.cmt}>// not reported</span>
            </div>
        </div>
    );
}

function Doors(): React.ReactNode {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionEyebrow}>Documentation</h2>
            <p className={styles.sectionLead}>Three entry points, according to what you need.</p>
            <div className={styles.doorGrid}>
                {DOORS.map((d) => (
                    <article key={d.title} className={styles.door}>
                        <p className={`${styles.kicker} ${d.kickerClass}`}>{d.kicker}</p>
                        <h3>{d.title}</h3>
                        <p className={styles.doorBody}>{d.body}</p>
                        {d.sample ? <CodeSample /> : null}
                        {d.points ? (
                            <ul className={styles.doorList}>
                                {d.points.map((p, i) => (
                                    <li key={i}>{p}</li>
                                ))}
                            </ul>
                        ) : null}
                        <Link className={styles.doorLink} to={d.to}>
                            {d.linkText} &rarr;
                        </Link>
                    </article>
                ))}
            </div>
        </section>
    );
}

const TASKS = [
    {
        title: 'Add a word to a dictionary',
        body: 'Where added words are stored, and how to share them across a repository.',
        to: '/docs/getting-started/adding-words',
    },
    {
        title: 'Select a language or locale',
        body: 'Set the locale, and install any of the 50+ additional language dictionaries.',
        to: '/docs/getting-started/choosing-a-language',
    },
    {
        title: 'Exclude files and folders',
        body: 'Ignore paths such as node_modules and generated output.',
        to: '/docs/configuration/files-folders-and-workspaces',
    },
    {
        title: 'Fine-tune checking within a file',
        body: 'In-document directives: cSpell:disable, ignore, words.',
        to: '/docs/reference#in-document-settings',
    },
    {
        title: 'Enable a file type',
        body: 'Use the status bar control, or configure it in the settings.',
        to: '/docs/reference#enable--disable-file-types',
    },
    {
        title: 'Check a project in CI',
        body: 'The cspell command-line tool reads the same configuration.',
        to: 'https://cspell.org',
    },
];

function Tasks(): React.ReactNode {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionEyebrow}>Common tasks</h2>
            <p className={styles.sectionLead}>The topics consulted most often.</p>
            <div className={styles.taskGrid}>
                {TASKS.map((t) => (
                    <Link key={t.title} className={styles.task} to={t.to}>
                        <span className={styles.taskTitle}>{t.title}</span>
                        <span className={styles.taskBody}>{t.body}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

const FACTS = [
    {
        stat: 'Local',
        body: 'Dictionaries and checking are local to the machine. No document content is sent to an external service.',
    },
    {
        stat: '50+ languages',
        body: 'Additional language dictionaries, from Dutch and German to Ancient Greek, are available as separate extensions.',
    },
    {
        stat: '25+ file types',
        body: 'TypeScript, Python, Go, Rust, Markdown, LaTeX, YAML, and SQL are supported by default.',
    },
    { stat: 'Since 2016', body: 'Developed and maintained openly by Street Side Software.' },
];

function Facts(): React.ReactNode {
    return (
        <section className={styles.facts}>
            <div className={styles.factGrid}>
                {FACTS.map((f) => (
                    <div key={f.stat}>
                        <p className={styles.factStat}>{f.stat}</p>
                        <p className={styles.factBody}>
                            {f.body}
                            {f.stat === 'Since 2016' ? (
                                <>
                                    {' '}
                                    <a href="https://streetsidesoftware.com/sponsor/">Sponsorship &rarr;</a>
                                </>
                            ) : null}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}

function InEditor(): React.ReactNode {
    return (
        <section className={styles.section}>
            <h2 className={styles.sectionEyebrow}>In the editor</h2>
            <p className={styles.sectionLead}>Unrecognized words are marked as the document is edited.</p>
            <div className={styles.figureGrid}>
                <figure className={styles.figure}>
                    <img
                        src={`${IMAGES}/example.gif`}
                        alt="Unrecognized words underlined while typing in Visual Studio Code"
                        loading="lazy"
                    />
                    <figcaption>Unrecognized words are underlined, in both code and comments.</figcaption>
                </figure>
                <figure className={styles.figure}>
                    <img src={`${IMAGES}/suggestions.gif`} alt="Suggestion list opened with Quick Fix" loading="lazy" />
                    <figcaption>Quick Fix presents suggestions, and can add the word to a selected dictionary.</figcaption>
                </figure>
            </div>
        </section>
    );
}

function Closing(): React.ReactNode {
    return (
        <section className={styles.closing}>
            <div className={styles.closingInner}>
                <div>
                    <h2>Installation and documentation</h2>
                    <p>The extension operates with the default configuration; no setup is required to begin.</p>
                </div>
                <div className={styles.closingActions}>
                    <a
                        className={styles.buttonPrimary}
                        href="https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker"
                    >
                        Open the extension page
                    </a>
                    <Link className={styles.buttonSecondary} to="/docs/getting-started/install">
                        Read the documentation
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default function Home(): React.ReactNode {
    const { siteConfig } = useDocusaurusContext();
    return (
        <Layout
            title={siteConfig.title}
            description="A spell checker for Visual Studio Code, designed for source code. Checking is performed locally."
        >
            <Hero />
            <main>
                <Doors />
                <Tasks />
                <Facts />
                <InEditor />
                <Closing />
            </main>
        </Layout>
    );
}

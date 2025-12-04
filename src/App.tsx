import { useState, useEffect, useRef, type FormEvent } from 'react';

// --- Types & Interfaces ---

interface ResumeContextItem {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'bot-typing';
  isHtml?: boolean;
}

interface ScriptLine {
  text: string;
  styleClass?: string;
}

// --- Data Constants ---

const RESUME_CONTEXT: ResumeContextItem[] = [
  { 
    id: 'about', 
    title: 'Summary',
    content: "Full stack software engineer with an MS in Computer Science and hands-on experience building scalable web applications. Strong proficiency in TypeScript, React, Next.js, and PostgreSQL. Focused on writing clean, maintainable code and building responsive user interfaces. Actively seeking Software Engineer or Full Stack roles to build modern web products.",
    keywords: ['about', 'summary', 'full stack', 'software engineer', 'typescript', 'react', 'next.js', 'postgresql', 'web applications']
  },
  { 
    id: 'skills', 
    title: 'Frontend Skills',
    content: "Frontend Development: React, Next.js 15, TypeScript, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Vite, Redux.",
    keywords: ['frontend', 'react', 'next.js 15', 'typescript', 'javascript', 'tailwind', 'vite', 'redux']
  },
  { 
    id: 'skills', 
    title: 'Backend & Database Skills',
    content: "Backend & Databases: Node.js, Express, REST APIs, PostgreSQL, MySQL, MongoDB, Drizzle ORM, Prisma, SQL Query Optimization.",
    keywords: ['backend', 'node.js', 'express', 'rest api', 'postgresql', 'mysql', 'mongodb', 'drizzle', 'prisma', 'sql']
  },
  { 
    id: 'skills', 
    title: 'Testing & Quality',
    content: "Testing & Quality: Jest, React Testing Library, Cypress, Playwright, Storybook, ESLint, Prettier.",
    keywords: ['testing', 'jest', 'cypress', 'playwright', 'storybook', 'quality']
  },
  { 
    id: 'skills', 
    title: 'DevOps & Tools',
    content: "DevOps & Tools: Git, GitHub, Docker, AWS (EC2, S3), Jenkins, Linux, CI/CD Pipelines, Jira.",
    keywords: ['devops', 'git', 'docker', 'aws', 'ec2', 's3', 'jenkins', 'linux', 'ci/cd', 'jira']
  },
  { 
    id: 'project-bridge', 
    title: 'Bridge SaaS Platform',
    content: "Bridge: An End-to-End Driving School Automation SaaS built with React, Next.js 15, TypeScript, Postgres, and Drizzle. Features multi-tenant architecture, comprehensive admission workflows, vehicle fleet management, and payment processing. Leading go-to-market strategy to scale across Mumbai's driving school market.",
    keywords: ['bridge', 'saas', 'driving school', 'automation', 'next.js', 'postgres', 'drizzle', 'multi-tenant']
  },
  { 
    id: 'project-flashcull', 
    title: 'FlashCull Photo Tool',
    content: "FlashCull: A high-performance local-first photo culling tool built with React, TypeScript, Electron, and Vite. Handles large file operations directly from disk. Code available at https://github.com/shubhammadhavi/FlashCull. Implemented advanced caching and web workers to render fast previews for RAW/HEIC formats, reducing interaction latency by 40%.",
    keywords: ['flashcull', 'photo culling', 'local-first', 'electron', 'vite', 'performance', 'raw', 'heic', 'web workers', 'github', 'demo']
  },
  { 
    id: 'exp-safeline', 
    title: 'Safeline Electricals Experience',
    content: "Software Developer (Part-time) at Safeline Electricals (Aug 2021 – Present). Builds and maintains customer-facing web presence ensuring high availability and SEO optimization. Implements responsive UI components using semantic HTML, CSS, and JavaScript. Collaborates with stakeholders to translate requirements into technical features.",
    keywords: ['safeline electricals', 'software developer', 'web presence', 'seo', 'responsive ui']
  },
  { 
    id: 'edu-pace', 
    title: 'Pace University Education',
    content: "Master of Science in Computer Science from Pace University (May 2024). GPA: 3.66. Relevant Coursework: Algorithms, Database Management Systems, Distributed Computing, Mobile Web Development.",
    keywords: ['pace university', 'master', 'ms', 'computer science', 'gpa', 'algorithms', 'database']
  },
  {
    id: 'contact',
    title: 'Contact Information',
    content: "You can reach Shubham at shubhammadhavi9@gmail.com or by phone at 201-526-5040. Currently based in Jersey City, NJ 07307.",
    keywords: ['email', 'phone', 'contact', 'location', 'jersey city', 'nj']
  }
];

const TERMINAL_SCRIPT: ScriptLine[] = [
  { text: "> BOOTING FULLSTACK_DEV_BOT_v4.0..." },
  { text: "> LOAD MODULE: Next.js 15 (Core)... [OK]", styleClass: "text-green-400" },
  { text: "> LOAD MODULE: TypeScript Strict Mode... [OK]", styleClass: "text-green-400" },
  { text: "> ACCESSING PROFILE: Shubham Madhavi" },
  { text: "> SCANNING STACK..." },
  { text: ">  - FRONTEND: React, Tailwind, Vite, Redux", styleClass: "text-sky-300" },
  { text: ">  - BACKEND: Node.js, Postgres, Drizzle, Prisma", styleClass: "text-sky-300" },
  { text: ">  - TESTING: Cypress, Playwright, Jest", styleClass: "text-sky-300" },
  { text: ">  - DEVOPS: Docker, AWS (EC2, S3), CI/CD", styleClass: "text-sky-300" },
  { text: "" },
  { text: "> ANALYZING PROJECTS..." },
  { text: "> DETECTED: 'Bridge' (SaaS, Multi-tenant Architecture)" },
  { text: "> DETECTED: 'FlashCull' (Local-first, High Performance Electron App)" },
  { text: "" },
  { text: "> CALCULATING FIT..." },
  { text: "> RESULT: Modern Full Stack Engineer focused on Scalability & Performance.", styleClass: "text-sky-300" },
  { text: "> STATUS: READY_TO_DEPLOY", styleClass: "text-green-400 font-bold" },
  { text: "> " }
];

const SUGGESTION_CHIPS = [
  'What is the Bridge SaaS?',
  'Tell me about FlashCull performance.',
  'What is his tech stack?',
  'Does he know Next.js 15?'
];

// --- Main Component ---

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Terminal Modal State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalLines, setTerminalLines] = useState<ScriptLine[]>([]);
  const [isTypingTerminal, setIsTypingTerminal] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Chat Modal State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);

  // Project Demo States
  // Bridge Demo
  const [bridgeLog, setBridgeLog] = useState<string[]>([]);
  const [isBridgeRunning, setIsBridgeRunning] = useState(false);

  // FlashCull Demo
  const [cullCount, setCullCount] = useState(0);
  const [isCulling, setIsCulling] = useState(false);

  // Chart Ref
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const currentYear = new Date().getFullYear();

  // --- Effects ---

  // Scroll Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Initialize Chart.js
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.async = true;
    script.onload = () => {
      initChart();
    };
    document.body.appendChild(script);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initChart = () => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // @ts-ignore
    if (typeof Chart === 'undefined') return;

    // @ts-ignore
    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Frontend (React/Next.js)', 'Backend (Node/SQL)', 'Testing (Cypress/Jest)', 'DevOps (Docker/AWS)', 'Performance', 'Languages (TS/JS/Java)'],
        datasets: [{
          label: 'Proficiency',
          data: [98, 92, 85, 80, 90, 95],
          backgroundColor: 'rgba(56, 189, 248, 0.4)',
          borderColor: '#38bdf8',
          borderWidth: 2,
          pointBackgroundColor: '#38bdf8',
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(203, 213, 225, 0.2)' },
            grid: { color: 'rgba(203, 213, 225, 0.2)' },
            pointLabels: { 
              color: '#cbd5e1', 
              font: { size: window.innerWidth < 768 ? 10 : 14 }
            },
            ticks: {
              color: '#0f172a',
              backdropColor: '#0f172a',
              stepSize: 20,
            },
            suggestedMin: 0,
            suggestedMax: 100,
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context: any) {
                return context.label + ': ' + context.formattedValue + '%';
              }
            }
          }
        }
      }
    });
  };

  // --- Logic Implementations ---

  // Terminal Typing Logic
  useEffect(() => {
    if (isTerminalOpen && !isTypingTerminal && terminalLines.length === 0) {
      setIsTypingTerminal(true);
      let lineIndex = 0;
      
      const typeNextLine = () => {
        if (lineIndex >= TERMINAL_SCRIPT.length) {
          setIsTypingTerminal(false);
          return;
        }

        const currentLine = TERMINAL_SCRIPT[lineIndex];
        let charIndex = 0;
        let tempText = "";
        
        setTerminalLines(prev => [...prev, { text: "", styleClass: currentLine.styleClass }]);

        const typeChar = () => {
          if (charIndex < currentLine.text.length) {
            tempText += currentLine.text.charAt(charIndex);
            setTerminalLines(prev => {
              const newLines = [...prev];
              newLines[newLines.length - 1].text = tempText;
              return newLines;
            });
            charIndex++;
            if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
            setTimeout(typeChar, 15);
          } else {
            lineIndex++;
            setTimeout(typeNextLine, 200);
          }
        };
        typeChar();
      };

      typeNextLine();
    }
  }, [isTerminalOpen]);

  // RAG Logic
  const findRelevantContext = (query: string) => {
    const cleanQuery = query.toLowerCase().replace(/[?,.]/g, '');
    const queryKeywords = cleanQuery.split(' ').filter(k => k.length > 2);
    let scores: { chunk: ResumeContextItem, score: number }[] = [];

    RESUME_CONTEXT.forEach(chunk => {
      let score = 0;
      const content = chunk.content.toLowerCase();
      
      queryKeywords.forEach(qWord => {
        if (content.includes(qWord)) score += 1;
        if (chunk.keywords.includes(qWord)) score += 3;
      });

      // Boosts
      if (cleanQuery.includes('bridge') && chunk.id === 'project-bridge') score += 10;
      if (cleanQuery.includes('flashcull') && chunk.id === 'project-flashcull') score += 10;
      if (cleanQuery.includes('performance') && chunk.id === 'project-flashcull') score += 5;
      if (cleanQuery.includes('stack') && chunk.id.includes('skills')) score += 5;

      if (score > 0) scores.push({ chunk, score });
    });

    scores.sort((a, b) => b.score - a.score);
    return scores.length > 0 ? scores[0].chunk : null;
  };

  const handleChatSubmit = (e?: FormEvent, forcedQuery?: string) => {
    if (e) e.preventDefault();
    const query = forcedQuery || chatInput.trim();
    if (!query) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), text: query, sender: 'user' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Typing indicator
    const typingId = 'typing-' + Date.now();
    setChatMessages(prev => [...prev, { id: typingId, text: '...', sender: 'bot-typing' }]);

    setTimeout(() => {
      // Remove typing
      setChatMessages(prev => prev.filter(msg => msg.id !== typingId));

      const context = findRelevantContext(query);
      let answer = "";
      let isHtml = false;

      if (!context) {
        answer = "I'm not sure I have details on that. Try asking about Bridge, FlashCull, Next.js, or Shubham's experience.";
      } else {
        answer = `Here's what I found:\n\n${context.content}\n\n<a class="chat-source-link text-sky-300 underline cursor-pointer text-xs mt-2 inline-block hover:text-white" onclick="document.querySelector('#${context.id}').scrollIntoView({ behavior: 'smooth', block: 'center' })">Source: ${context.title}</a>`;
        isHtml = true;
      }

      setChatMessages(prev => [...prev, { id: Date.now().toString(), text: answer, sender: 'bot', isHtml }]);
    }, 1200);
  };

  useEffect(() => {
    if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
  }, [chatMessages]);

  const openChat = () => {
    setIsChatOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: 'welcome',
        text: "Hi! I'm an AI assistant trained on Shubham's resume. Ask me about his SaaS platform 'Bridge', his local-first app 'FlashCull', or his tech stack!",
        sender: 'bot'
      }]);
    }
  };

  // Demo Handlers
  
  // Bridge SaaS Demo
  const runBridgeDemo = () => {
    setIsBridgeRunning(true);
    setBridgeLog([]);
    
    const steps = [
      "Initializing Multi-tenant Environment...",
      "Connecting to PostgreSQL (Drizzle ORM)...",
      "Loading Admission Workflow Module...",
      "Verifying Vehicle Fleet Status...",
      "Payment Gateway: STRIPE_TEST_MODE... Connected.",
      "Tenant 'Mumbai_Driving_School_01' Dashboard Loaded."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setBridgeLog(prev => [...prev, steps[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsBridgeRunning(false);
      }
    }, 800);
  };

  // FlashCull Demo
  const runFlashCullDemo = () => {
    setIsCulling(true);
    setCullCount(0);
    
    // Simulate fast processing
    const interval = setInterval(() => {
      setCullCount(prev => {
        if (prev >= 5000) {
          clearInterval(interval);
          setIsCulling(false);
          return 5000;
        }
        return prev + 125; // Process 125 photos per tick
      });
    }, 50);
  };

  return (
    <div className="relative w-full overflow-x-hidden font-['Inter'] bg-slate-900 text-slate-300 antialiased min-h-screen">
      <style>{`
        /* Global Reset to prevent "Bars" on the side */
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
          background-color: #0f172a; /* Match slate-900 */
        }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1e293b; }
        ::-webkit-scrollbar-thumb { background: #38bdf8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #0ea5e9; }
        
        .bg-grid-pattern {
          position: relative;
        }
        .bg-grid-pattern::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(56, 189, 248, 0.1) 1px, #0f172a 1px);
          background-size: 2rem 2rem;
          mask-image: radial-gradient(ellipse at center, white, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        
        [data-animate] { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
        [data-animate].is-visible { opacity: 1; transform: translateY(0); }
        .blinking-cursor { display: inline-block; width: 10px; height: 1.2rem; background-color: #22c55e; animation: blink 1s step-end infinite; margin-left: 2px; vertical-align: middle; }
        @keyframes blink { 50% { opacity: 0; } }
        .typing-dot { display: inline-block; width: 8px; height: 8px; background-color: #94a3b8; border-radius: 50%; animation: typing-blink 1.4s infinite both; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-slate-900/70 border-b border-slate-700/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <a href="#home" className="text-2xl font-bold text-white">Shubham Madhavi</a>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {['About', 'Skills', 'Projects', 'Experience', 'Education'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-slate-300 hover:text-sky-400 transition duration-300">
                  {item}
                </a>
              ))}
              <a href="Shubham_Madhavi_Resume.pdf" download="Shubham_Madhavi_Resume.pdf" className="ml-4 px-4 py-2 border border-sky-500 text-sky-400 rounded-md font-medium hover:bg-sky-500 hover:text-white transition duration-300">
                Download Resume
              </a>
              <a href="#contact" className="ml-4 px-4 py-2 bg-sky-500 text-white rounded-md font-medium hover:bg-sky-600 transition duration-300">
                Contact
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
              >
                {isMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-700 bg-slate-900">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['About', 'Skills', 'Projects', 'Experience', 'Education'].map(item => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  {item}
                </a>
              ))}
              <a href="Shubham_Madhavi_Resume.pdf" download="Shubham_Madhavi_Resume.pdf" className="block px-3 py-2 rounded-md text-base font-medium text-sky-400 hover:text-white hover:bg-slate-700">Download Resume</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-sky-400 hover:text-white hover:bg-slate-700">Contact</a>
            </div>
          </div>
        )}
      </header>

      <main className="w-full">
        {/* Hero Section */}
        <section id="home" className="min-h-screen flex items-center justify-center text-center px-4 py-20 bg-grid-pattern relative overflow-hidden w-full">
           <div className="relative z-10 max-w-7xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
                Shubham Madhavi
              </h1>
              <p className="mt-4 text-2xl md:text-4xl font-light text-sky-300 flex items-center justify-center flex-wrap gap-2">
                Full Stack Software Engineer
                <span className="hidden md:inline text-sky-300">|</span>
                <span className="text-xl md:text-3xl text-sky-300">TypeScript, React, Next.js</span>
              </p>
              
              <div 
                onClick={() => setIsTerminalOpen(true)}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-sky-500/30 rounded-full cursor-pointer hover:bg-slate-800 transition-colors group"
              >
                <span className="w-3 h-3 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_2px_rgba(56,189,248,0.6)]"></span>
                <span className="text-sm font-mono text-sky-300 group-hover:text-white">Run Skill Analysis Protocol</span>
              </div>

              <p className="mt-8 text-lg text-slate-400 max-w-2xl mx-auto">
                Seeking Remote & US-based Relocation Opportunities. Specializing in building scalable, data-intensive web applications with modern tech stacks.
              </p>
              
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a href="#projects" className="px-6 py-3 bg-sky-500 text-white rounded-md font-medium text-lg hover:bg-sky-600 transition duration-300">
                  View Projects
                </a>
                <a href="#contact" className="px-6 py-3 bg-slate-700 text-slate-200 rounded-md font-medium text-lg hover:bg-slate-600 transition duration-300">
                  Get in Touch
                </a>
              </div>
              
              {/* Socials */}
              <div className="mt-12 flex justify-center space-x-6">
                <a href="mailto:shubhammadhavi9@gmail.com" className="text-slate-400 hover:text-sky-400 transition duration-300"><span className="sr-only">Email</span>
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </a>
                <a href="https://github.com/shubhammadhavi" className="text-slate-400 hover:text-sky-400 transition duration-300"><span className="sr-only">GitHub</span>
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </a>
                <a href="https://www.linkedin.com/in/shubhammadhavi/" className="text-slate-400 hover:text-sky-400 transition duration-300"><span className="sr-only">LinkedIn</span>
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </a>
              </div>
           </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 sm:py-32 w-full" data-animate>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl font-extrabold text-white sm:text-5xl mb-12">About Me</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              I am a Full Stack Software Engineer with a Master's in Computer Science and strong proficiency in the modern web stack: TypeScript, React, Next.js, and PostgreSQL. I focus on building scalable, maintainable, and high-performance applications. Whether it's architecting a multi-tenant SaaS platform or optimizing local-first desktop apps, I enjoy solving complex problems with clean code.
            </p>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-24 sm:py-32 bg-slate-800/60 w-full" data-animate>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl font-extrabold text-white sm:text-5xl mb-16">Technical Skills</h2>
            <div className="max-w-4xl mx-auto h-96 md:h-[500px] w-full">
              <canvas ref={chartRef}></canvas>
            </div>
            {/* Tech Stack Chips */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              {['Next.js 15', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Drizzle ORM', 'Docker', 'AWS', 'Electron', 'Tailwind CSS'].map(skill => (
                <span key={skill} className="px-4 py-2 bg-slate-700 rounded-full text-sm font-medium text-sky-300 border border-slate-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects" className="py-24 sm:py-32 w-full" data-animate>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl font-extrabold text-white sm:text-5xl mb-16">Featured Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Project 1: Bridge */}
              <div id="project-bridge" className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-sky-500/20 border border-slate-800">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-semibold text-white">Bridge</h3>
                    <span className="bg-sky-500/10 text-sky-400 text-xs px-2 py-1 rounded border border-sky-500/20">SaaS Platform</span>
                  </div>
                  <p className="text-slate-400 italic mb-4">End-to-End Driving School Automation</p>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-slate-300 mb-6 text-sm">
                    <li>Built a multi-tenant SaaS platform using <strong>Next.js 15, TypeScript, and PostgreSQL</strong>.</li>
                    <li>Features comprehensive admission workflow, vehicle fleet management, and payment processing.</li>
                    <li>Leading go-to-market strategy to scale across Mumbai's driving school market.</li>
                  </ul>
                  
                  {/* Bridge Demo */}
                  <div className="mt-4 mb-6">
                    <h4 className="text-sm font-semibold text-sky-300 mb-2">System Status:</h4>
                    <button 
                      onClick={runBridgeDemo}
                      disabled={isBridgeRunning}
                      className="w-full bg-slate-800 text-slate-200 py-2 px-4 rounded border border-slate-700 hover:bg-slate-700 transition disabled:opacity-50 text-sm font-medium"
                    >
                      {isBridgeRunning ? 'Initializing Tenant...' : 'Launch Tenant Dashboard Simulation'}
                    </button>
                    <div className="bg-black/50 font-mono text-xs text-green-400 border border-slate-800 rounded mt-2 h-[120px] overflow-y-auto p-3">
                      {bridgeLog.length === 0 && !isBridgeRunning && <div className="text-slate-500">&gt; System Standby...</div>}
                      {bridgeLog.map((log, idx) => (
                        <div key={idx}>&gt; {log}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto flex gap-4">
                    <a href="#" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Live 2025
                    </a>
                </div>
              </div>

              {/* Project 2: FlashCull */}
              <div id="project-flashcull" className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-sky-500/20 border border-slate-800">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-semibold text-white">FlashCull</h3>
                    <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded border border-purple-500/20">Local-first App</span>
                  </div>
                  <p className="text-slate-400 italic mb-4">High-Performance Photo Culling Tool</p>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-slate-300 mb-6 text-sm">
                    <li>Developed using <strong>React, TypeScript, Electron, and Vite</strong> for desktop & web.</li>
                    <li>Implemented advanced caching & web workers to render RAW/HEIC previews instantly.</li>
                    <li>Reduced interaction latency by 40% when handling galleries of 5,000+ images.</li>
                  </ul>

                  {/* FlashCull Demo */}
                  <div className="mt-4 mb-6">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Performance Test:</h4>
                    <div className="flex gap-2 items-center mb-2">
                        <button onClick={runFlashCullDemo} disabled={isCulling} className="bg-slate-800 text-slate-200 px-4 py-2 rounded text-sm hover:bg-slate-700 border border-slate-700 disabled:opacity-50">
                          Process 5,000 Images
                        </button>
                        <span className="text-slate-300 font-mono text-sm">{cullCount} / 5000</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-75" style={{ width: `${(cullCount / 5000) * 100}%` }}></div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 text-right">
                        {isCulling ? 'Processing using Web Workers...' : cullCount === 5000 ? 'Completed in 2.1s' : 'Ready'}
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0 mt-auto flex flex-wrap gap-4">
                    <a href="https://github.com/shubhammadhavi/FlashCull" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-sky-400 hover:text-sky-300 transition">
                      View on GitHub <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                    <a href="https://flashcull.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-purple-400 hover:text-purple-300 transition">
                      Live Demo <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-24 sm:py-32 bg-slate-800/60 w-full" data-animate>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-4xl font-extrabold text-white sm:text-5xl mb-16">Work Experience</h2>
            <div className="relative border-l-2 border-slate-700">
              
              {/* Exp 1 */}
              <div id="exp-safeline" className="mb-12 relative pl-8">
                <span className="absolute -left-2.5 top-1 flex items-center justify-center w-5 h-5 bg-sky-500 rounded-full ring-8 ring-slate-900"></span>
                <div className="bg-slate-900 rounded-lg shadow-xl p-6 border border-slate-800">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <h3 className="text-2xl font-semibold text-white">Software Developer</h3>
                    <span className="text-sky-400 font-mono text-sm">Aug 2021 – Present</span>
                  </div>
                  <p className="text-lg text-slate-300 mb-4">Safeline Electricals | Mumbai, India (Remote/Part-time)</p>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-slate-400">
                    <li>Build and maintain the company's customer-facing web presence, ensuring high availability and SEO optimization.</li>
                    <li>Implement responsive UI components and modern navigation using semantic HTML, CSS, and JavaScript.</li>
                    <li>Collaborate directly with stakeholders to translate business requirements into technical features and deploy updates to production.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="py-24 sm:py-32 w-full" data-animate>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-4xl font-extrabold text-white sm:text-5xl mb-16">Education</h2>
              <div className="space-y-8">
                <div id="edu-pace" className="bg-slate-800 rounded-lg shadow-xl p-6 border-l-4 border-sky-500">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="text-2xl font-semibold text-white">Master of Science in Computer Science</h3>
                       <p className="text-lg text-sky-300 my-1">Pace University | New York, NY</p>
                     </div>
                     <span className="text-slate-400 text-sm">May 2024</span>
                   </div>
                   <p className="text-slate-300 mt-2">GPA: 3.66/4.0</p>
                   <p className="text-slate-400 text-sm mt-2">Relevant Coursework: Algorithms and Computing Theory, Database Management Systems, Distributed and Parallel Computing, Mobile Web Development.</p>
                </div>
                <div id="edu-mumbai" className="bg-slate-800 rounded-lg shadow-xl p-6 border-l-4 border-slate-600">
                   <h3 className="text-2xl font-semibold text-white">Bachelor of Engineering in Computer Engineering</h3>
                   <p className="text-lg text-sky-300 my-1">Mumbai University | Mumbai, India</p>
                   <div className="mt-4 p-4 bg-slate-700/50 rounded border border-slate-700">
                     <p className="text-yellow-400 text-sm font-semibold">🏆 Project Planet USA Contest Winner</p>
                     <p className="text-slate-400 text-xs mt-1">Awarded $15,000 grant for a sustainability technology project proposal.</p>
                   </div>
                </div>
              </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 sm:py-32 bg-slate-800/60 text-center w-full" data-animate>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">Get in Touch</h2>
            <p className="mt-4 text-xl text-slate-300">
              I'm actively seeking Software Engineer or Full Stack roles to build modern web products.
            </p>
            <div className="mt-10 flex flex-col md:flex-row justify-center gap-6 text-slate-300">
              <div className="flex items-center justify-center gap-2">
                 <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 shubhammadhavi9@gmail.com
              </div>
              <div className="flex items-center justify-center gap-2">
                 <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                 201-526-5040
              </div>
              <div className="flex items-center justify-center gap-2">
                 <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Jersey City, NJ 07307
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-700/50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500">
           <p>&copy; {currentYear} Shubham Madhavi. All rights reserved.</p>
        </div>
      </footer>

      {/* AI Terminal Modal */}
      {isTerminalOpen && (
        <div onClick={() => setIsTerminalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl bg-gray-900 text-green-400 rounded-lg shadow-2xl overflow-hidden border border-slate-700 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
             <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-gray-700">
               <div className="flex items-center space-x-2">
                 <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                 <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                 <span className="w-3 h-3 bg-green-500 rounded-full"></span>
               </div>
               <span className="text-sm text-slate-400">shubham_skill_matrix.exe</span>
               <button onClick={() => setIsTerminalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
             </div>
             <div ref={terminalRef} className="p-4 h-96 overflow-y-auto text-sm font-mono whitespace-pre-wrap">
               {terminalLines.map((line, idx) => (
                 <div key={idx} className={line.styleClass}>{line.text}</div>
               ))}
               {!isTypingTerminal && <span className="blinking-cursor"></span>}
             </div>
          </div>
        </div>
      )}

      {/* AI Chat Bot - FIX: Increased Z-Index to ensure it floats above full width content */}
      <button 
        onClick={openChat} 
        className="fixed bottom-8 right-8 z-50 bg-sky-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-sky-600 hover:scale-110 transition-all duration-300 animate-[pulse-chat_2.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"
        title="Ask AI Assistant"
      >
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M4.804 21.642A6.44 6.44 0 0 1 2 15.317V7.829c0-3.411 2.83-6.176 6.31-6.176h7.38c3.48 0 6.31 2.765 6.31 6.176v7.488c0 3.411-2.83 6.176-6.31 6.176h-6.04a6.438 6.438 0 0 0-1.896.348l-3.26 1.101Z" clipRule="evenodd" /></svg>
      </button>

      {isChatOpen && (
        <div onClick={() => setIsChatOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[28rem] max-h-[80vh] flex flex-col bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
             <div className="bg-slate-700 p-3 border-b border-slate-600 flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                 <span className="text-base font-semibold text-white">Full Stack AI Assistant</span>
               </div>
               <button onClick={() => setIsChatOpen(false)} className="text-2xl font-bold text-slate-400 hover:text-white">&times;</button>
             </div>
             <div ref={chatBodyRef} className="flex-grow p-4 overflow-y-auto flex flex-col gap-3">
               {chatMessages.map(msg => (
                 <div key={msg.id} className={`p-3 rounded-xl max-w-[85%] leading-relaxed break-words ${msg.sender === 'user' ? 'bg-sky-500 text-white self-end' : 'bg-slate-700 text-slate-200 self-start'}`}>
                   {msg.sender === 'bot-typing' ? (
                     <div className="flex items-center gap-1.5">
                       <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                     </div>
                   ) : msg.isHtml ? (
                     <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                   ) : (
                     msg.text
                   )}
                 </div>
               ))}
             </div>
             <div className="p-3 border-t border-slate-700 bg-slate-800">
               <div className="flex flex-wrap gap-2 mb-3">
                 {SUGGESTION_CHIPS.map(chip => (
                   <div 
                    key={chip} 
                    onClick={() => handleChatSubmit(undefined, chip)}
                    className="bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-600 hover:text-white transition"
                   >
                     {chip}
                   </div>
                 ))}
               </div>
               <form onSubmit={handleChatSubmit} className="flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput} 
                   onChange={(e) => setChatInput(e.target.value)}
                   placeholder="Ask about Bridge, Next.js, etc..." 
                   className="flex-grow bg-slate-700 text-white border border-slate-600 rounded-md py-2.5 px-3 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                 />
                 <button type="submit" className="bg-sky-500 text-white rounded-md p-2.5 hover:bg-sky-600 transition">
                   <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009.175 17V4.602a1 1 0 00-1.169-1.409l-5 1.429a1 1 0 00-.91 1.01l.001.001.001.001L2 6l7-2v12l-7 2z" /></svg>
                 </button>
               </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
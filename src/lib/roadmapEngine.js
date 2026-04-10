/**
 * Pathfinder Roadmap Engine
 *
 * Generates dynamic, personalized roadmaps for ANY goal/idea the user provides.
 *
 * Strategy:
 *  1. Classify the user's idea into a domain using keyword matching
 *  2. Pull the domain template (phases, resources, projects)
 *  3. Adjust duration, depth, intensity based on:
 *       - weeklyHours (from profile)
 *       - techLevel / familiarity
 *       - finance (free vs paid resources)
 *       - timeline (user expectation)
 *       - dedication
 *  4. Compute a dynamic reality score
 *
 * This runs 100% client-side so the demo works without any API keys.
 * To swap in a real Claude API, replace `generateRoadmap` with a fetch call.
 */

// ---------- DOMAIN TEMPLATES ----------

const DOMAINS = {
  'ml-ai': {
    label: 'AI / Machine Learning',
    emoji: '🧠',
    keywords: ['machine learning', 'ml', 'ai', 'artificial intelligence', 'deep learning', 'neural', 'llm', 'gpt', 'nlp', 'computer vision', 'data science', 'pytorch', 'tensorflow', 'kaggle', 'chatbot'],
    phases: [
      {
        name: 'Foundation',
        weeks: 6,
        modules: [
          { title: 'Python for Data Science', type: 'Course', platform: 'FreeCodeCamp', hours: 8, url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
          { title: 'NumPy & Pandas Basics', type: 'Interactive', platform: 'Kaggle Learn', hours: 6, url: 'https://www.kaggle.com/learn/pandas' },
          { title: 'Math for ML (Linear Algebra)', type: 'Video', platform: '3Blue1Brown', hours: 5, url: 'https://www.3blue1brown.com/topics/linear-algebra' },
        ]
      },
      {
        name: 'Core ML',
        weeks: 8,
        modules: [
          { title: 'Machine Learning by Andrew Ng', type: 'Course', platform: 'Coursera', hours: 20, url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
          { title: 'StatQuest ML Playlist', type: 'Video', platform: 'YouTube', hours: 12, url: 'https://www.youtube.com/@statquest' },
          { title: 'Scikit-learn Hands-on', type: 'Docs', platform: 'sklearn.org', hours: 8, url: 'https://scikit-learn.org/stable/tutorial/index.html' },
        ]
      },
      {
        name: 'Deep Learning',
        weeks: 6,
        modules: [
          { title: 'fast.ai Practical Deep Learning', type: 'Course', platform: 'fast.ai', hours: 15, url: 'https://course.fast.ai/' },
          { title: 'PyTorch Official Tutorials', type: 'Docs', platform: 'PyTorch', hours: 10, url: 'https://pytorch.org/tutorials/' },
          { title: 'Hugging Face NLP Course', type: 'Course', platform: 'Hugging Face', hours: 12, url: 'https://huggingface.co/learn/nlp-course' },
        ]
      },
      {
        name: 'Portfolio & Deploy',
        weeks: 4,
        modules: [
          { title: 'Model Deployment with FastAPI', type: 'Video', platform: 'YouTube', hours: 6, url: 'https://www.youtube.com/results?search_query=fastapi+ml+deployment' },
          { title: 'Kaggle Competitions', type: 'Project', platform: 'Kaggle', hours: 15, url: 'https://www.kaggle.com/competitions' },
          { title: 'Capstone: Build & Deploy', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Machine Learning by Andrew Ng', platform: 'Coursera', type: 'Course', price: 'Free audit', rating: 4.9, url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
      { title: 'StatQuest with Josh Starmer', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.9, url: 'https://www.youtube.com/@statquest' },
      { title: 'fast.ai Deep Learning', platform: 'fast.ai', type: 'Course', price: 'Free', rating: 4.8, url: 'https://course.fast.ai/' },
      { title: 'Kaggle Learn', platform: 'Kaggle', type: 'Interactive', price: 'Free', rating: 4.7, url: 'https://www.kaggle.com/learn' },
      { title: 'Hands-On ML with Scikit-Learn', platform: 'O\'Reilly', type: 'Book', price: 'Paid', rating: 4.8, url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/' },
    ],
    projects: [
      { title: 'House Price Predictor', difficulty: 'Beginner', time: '4 hrs', tech: ['Pandas', 'Sklearn'], desc: 'Linear regression on Boston/Ames housing data' },
      { title: 'Twitter Sentiment Analyzer', difficulty: 'Intermediate', time: '8 hrs', tech: ['NLP', 'NLTK'], desc: 'Classify tweets as positive/negative using NLP' },
      { title: 'Image Classifier Web App', difficulty: 'Intermediate', time: '12 hrs', tech: ['PyTorch', 'FastAPI'], desc: 'CNN image classifier deployed as web API' },
      { title: 'Chatbot with Hugging Face', difficulty: 'Advanced', time: '16 hrs', tech: ['Transformers', 'Gradio'], desc: 'Fine-tune a small LLM and deploy' },
    ],
  },

  'webdev': {
    label: 'Web Development',
    emoji: '🌐',
    keywords: ['web', 'website', 'frontend', 'backend', 'fullstack', 'react', 'vue', 'angular', 'node', 'express', 'html', 'css', 'javascript', 'typescript', 'nextjs', 'tailwind', 'api', 'rest'],
    phases: [
      {
        name: 'HTML / CSS / JS Basics',
        weeks: 4,
        modules: [
          { title: 'HTML & CSS Full Course', type: 'Video', platform: 'freeCodeCamp', hours: 10, url: 'https://www.freecodecamp.org/learn/responsive-web-design/' },
          { title: 'JavaScript Basics', type: 'Interactive', platform: 'JavaScript.info', hours: 12, url: 'https://javascript.info/' },
          { title: 'Flexbox & Grid', type: 'Interactive', platform: 'Flexbox Froggy', hours: 3, url: 'https://flexboxfroggy.com/' },
        ]
      },
      {
        name: 'Modern Frontend (React)',
        weeks: 6,
        modules: [
          { title: 'React Official Tutorial', type: 'Docs', platform: 'react.dev', hours: 10, url: 'https://react.dev/learn' },
          { title: 'Full React Course', type: 'Video', platform: 'freeCodeCamp / Scrimba', hours: 12, url: 'https://scrimba.com/learn/learnreact' },
          { title: 'Tailwind CSS', type: 'Docs', platform: 'tailwindcss.com', hours: 4, url: 'https://tailwindcss.com/docs/installation' },
        ]
      },
      {
        name: 'Backend & Databases',
        weeks: 5,
        modules: [
          { title: 'Node.js & Express', type: 'Course', platform: 'The Odin Project', hours: 14, url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs' },
          { title: 'REST API Design', type: 'Article', platform: 'REST API Tutorial', hours: 4, url: 'https://restfulapi.net/' },
          { title: 'PostgreSQL Basics', type: 'Interactive', platform: 'SQLBolt', hours: 6, url: 'https://sqlbolt.com/' },
        ]
      },
      {
        name: 'Deployment & Portfolio',
        weeks: 3,
        modules: [
          { title: 'Deploy with Vercel', type: 'Docs', platform: 'Vercel', hours: 3, url: 'https://vercel.com/docs' },
          { title: 'Git & GitHub', type: 'Interactive', platform: 'Learn Git Branching', hours: 4, url: 'https://learngitbranching.js.org/' },
          { title: 'Portfolio Project', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'The Odin Project', platform: 'theodinproject.com', type: 'Course', price: 'Free', rating: 4.9, url: 'https://www.theodinproject.com/' },
      { title: 'freeCodeCamp', platform: 'freeCodeCamp.org', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://www.freecodecamp.org/' },
      { title: 'MDN Web Docs', platform: 'MDN', type: 'Docs', price: 'Free', rating: 4.9, url: 'https://developer.mozilla.org/' },
      { title: 'Fireship YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@Fireship' },
      { title: 'Frontend Masters', platform: 'frontendmasters.com', type: 'Course', price: 'Paid', rating: 4.9, url: 'https://frontendmasters.com/' },
    ],
    projects: [
      { title: 'Personal Portfolio Site', difficulty: 'Beginner', time: '6 hrs', tech: ['HTML', 'CSS', 'JS'], desc: 'Responsive personal landing page' },
      { title: 'Todo App with Local Storage', difficulty: 'Beginner', time: '5 hrs', tech: ['React'], desc: 'Classic CRUD todo with persistence' },
      { title: 'Blog with Markdown', difficulty: 'Intermediate', time: '12 hrs', tech: ['Next.js', 'MDX'], desc: 'Static blog with markdown posts' },
      { title: 'Full-Stack SaaS Boilerplate', difficulty: 'Advanced', time: '30 hrs', tech: ['React', 'Node', 'Postgres'], desc: 'Auth + billing + dashboard' },
    ],
  },

  'mobile': {
    label: 'Mobile App Development',
    emoji: '📱',
    keywords: ['mobile', 'app', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'expo', 'play store', 'app store'],
    phases: [
      {
        name: 'Mobile Fundamentals',
        weeks: 4,
        modules: [
          { title: 'Intro to Mobile UX', type: 'Article', platform: 'Google Material', hours: 3, url: 'https://m3.material.io/foundations' },
          { title: 'JavaScript / Dart Basics', type: 'Course', platform: 'freeCodeCamp', hours: 10, url: 'https://www.freecodecamp.org/' },
          { title: 'Mobile Design Patterns', type: 'Article', platform: 'Refactoring Guru', hours: 4, url: 'https://refactoring.guru/design-patterns' },
        ]
      },
      {
        name: 'Framework Deep Dive',
        weeks: 6,
        modules: [
          { title: 'React Native Docs', type: 'Docs', platform: 'reactnative.dev', hours: 15, url: 'https://reactnative.dev/docs/getting-started' },
          { title: 'Flutter Full Course', type: 'Video', platform: 'YouTube - Net Ninja', hours: 12, url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jLYyp2Aoh6hcWuxFDX6PBJ' },
          { title: 'Navigation & State', type: 'Docs', platform: 'Expo', hours: 6, url: 'https://docs.expo.dev/' },
        ]
      },
      {
        name: 'Backend & Storage',
        weeks: 4,
        modules: [
          { title: 'Firebase for Mobile', type: 'Docs', platform: 'Firebase', hours: 8, url: 'https://firebase.google.com/docs' },
          { title: 'REST API Integration', type: 'Video', platform: 'YouTube', hours: 5, url: 'https://www.youtube.com/results?search_query=react+native+rest+api' },
          { title: 'Local Database (SQLite)', type: 'Docs', platform: 'SQLite Docs', hours: 4, url: 'https://www.sqlite.org/docs.html' },
        ]
      },
      {
        name: 'Publish to Stores',
        weeks: 3,
        modules: [
          { title: 'Android Publishing Guide', type: 'Docs', platform: 'Google Play Console', hours: 5, url: 'https://developer.android.com/studio/publish' },
          { title: 'App Store Submission', type: 'Docs', platform: 'Apple Developer', hours: 5, url: 'https://developer.apple.com/app-store/submissions/' },
          { title: 'Capstone App', type: 'Project', platform: 'Self-guided', hours: 25, url: null },
        ]
      },
    ],
    resources: [
      { title: 'React Native Docs', platform: 'reactnative.dev', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://reactnative.dev/docs/getting-started' },
      { title: 'Flutter Official', platform: 'flutter.dev', type: 'Docs', price: 'Free', rating: 4.9, url: 'https://flutter.dev/learn' },
      { title: 'The Net Ninja Mobile', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@NetNinja' },
      { title: 'Firebase Documentation', platform: 'Firebase', type: 'Docs', price: 'Free', rating: 4.7, url: 'https://firebase.google.com/docs' },
      { title: 'Expo Documentation', platform: 'expo.dev', type: 'Docs', price: 'Free', rating: 4.8, url: 'https://docs.expo.dev/' },
    ],
    projects: [
      { title: 'Weather App', difficulty: 'Beginner', time: '6 hrs', tech: ['React Native'], desc: 'Fetch weather API and display' },
      { title: 'Travel Planner App', difficulty: 'Intermediate', time: '18 hrs', tech: ['Flutter', 'Firebase'], desc: 'Plan trips, save destinations, offline mode' },
      { title: 'Fitness Tracker', difficulty: 'Intermediate', time: '20 hrs', tech: ['React Native', 'SQLite'], desc: 'Track workouts, steps, goals' },
      { title: 'Social Feed App', difficulty: 'Advanced', time: '40 hrs', tech: ['React Native', 'Firebase'], desc: 'Posts, likes, comments, auth' },
    ],
  },

  'design': {
    label: 'UI/UX & Design',
    emoji: '🎨',
    keywords: ['design', 'ui', 'ux', 'figma', 'graphic', 'illustrator', 'photoshop', 'branding', 'logo', 'typography', 'user research', 'wireframe', 'prototype'],
    phases: [
      {
        name: 'Design Fundamentals',
        weeks: 3,
        modules: [
          { title: 'Design Principles', type: 'Video', platform: 'The Futur', hours: 6, url: 'https://www.youtube.com/@thefutur' },
          { title: 'Color & Typography', type: 'Article', platform: 'Google Fonts', hours: 4, url: 'https://fonts.google.com/knowledge' },
          { title: 'Refactoring UI', type: 'Book', platform: 'refactoringui.com', hours: 10, url: 'https://www.refactoringui.com/' },
        ]
      },
      {
        name: 'Tool Mastery (Figma)',
        weeks: 4,
        modules: [
          { title: 'Figma Full Course', type: 'Video', platform: 'YouTube - DesignCourse', hours: 8, url: 'https://www.youtube.com/@DesignCourse' },
          { title: 'Figma Academy', type: 'Interactive', platform: 'Figma', hours: 6, url: 'https://www.figma.com/resource-library/' },
          { title: 'Components & Auto-layout', type: 'Docs', platform: 'Figma Help', hours: 4, url: 'https://help.figma.com/hc/en-us' },
        ]
      },
      {
        name: 'UX Research & Flows',
        weeks: 4,
        modules: [
          { title: 'Google UX Design Cert', type: 'Course', platform: 'Coursera', hours: 20, url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
          { title: 'Nielsen Norman Group', type: 'Article', platform: 'NN/g', hours: 6, url: 'https://www.nngroup.com/articles/' },
          { title: 'User Interviews', type: 'Article', platform: 'IDEO', hours: 3, url: 'https://www.ideou.com/' },
        ]
      },
      {
        name: 'Portfolio Building',
        weeks: 4,
        modules: [
          { title: 'Case Study Writing', type: 'Article', platform: 'UX Collective', hours: 4, url: 'https://uxdesign.cc/' },
          { title: 'Dribbble / Behance Setup', type: 'Project', platform: 'Dribbble', hours: 3, url: 'https://dribbble.com/' },
          { title: '3 Portfolio Projects', type: 'Project', platform: 'Self-guided', hours: 30, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Google UX Design Certificate', platform: 'Coursera', type: 'Course', price: 'Paid', rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-ux-design' },
      { title: 'Refactoring UI', platform: 'refactoringui.com', type: 'Book', price: 'Paid', rating: 4.9, url: 'https://www.refactoringui.com/' },
      { title: 'Figma Learn', platform: 'figma.com', type: 'Interactive', price: 'Free', rating: 4.8, url: 'https://www.figma.com/resource-library/' },
      { title: 'Nielsen Norman Group', platform: 'NN/g', type: 'Article', price: 'Free', rating: 4.9, url: 'https://www.nngroup.com/articles/' },
      { title: 'DesignCourse YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.7, url: 'https://www.youtube.com/@DesignCourse' },
    ],
    projects: [
      { title: 'Redesign Your Favorite App', difficulty: 'Beginner', time: '8 hrs', tech: ['Figma'], desc: 'UX audit + visual redesign' },
      { title: 'Travel Booking Landing', difficulty: 'Beginner', time: '6 hrs', tech: ['Figma'], desc: 'Full responsive marketing page' },
      { title: 'E-commerce Mobile Flow', difficulty: 'Intermediate', time: '14 hrs', tech: ['Figma', 'Prototyping'], desc: 'Complete shopping flow prototype' },
      { title: 'Brand Identity System', difficulty: 'Advanced', time: '20 hrs', tech: ['Illustrator', 'Figma'], desc: 'Logo, colors, typography, guidelines' },
    ],
  },

  'startup': {
    label: 'Startup & Business',
    emoji: '🚀',
    keywords: ['startup', 'business', 'saas', 'product', 'entrepreneur', 'mvp', 'bootstrap', 'founder', 'launch', 'company', 'marketing', 'sell', 'revenue', 'customers'],
    phases: [
      {
        name: 'Validation',
        weeks: 3,
        modules: [
          { title: 'The Mom Test (Customer Interviews)', type: 'Book', platform: 'Amazon', hours: 4, url: 'https://www.momtestbook.com/' },
          { title: 'YC Startup School', type: 'Course', platform: 'Y Combinator', hours: 10, url: 'https://www.startupschool.org/' },
          { title: 'Idea Validation Playbook', type: 'Article', platform: 'Indie Hackers', hours: 3, url: 'https://www.indiehackers.com/start' },
        ]
      },
      {
        name: 'Build MVP',
        weeks: 6,
        modules: [
          { title: 'No-code Tools Overview', type: 'Article', platform: 'Makerpad', hours: 4, url: 'https://www.nocode.tech/' },
          { title: 'Lean Product Development', type: 'Book', platform: 'Lean Startup', hours: 8, url: 'http://theleanstartup.com/' },
          { title: 'MVP Building Guide', type: 'Course', platform: 'YC Startup School', hours: 6, url: 'https://www.startupschool.org/' },
        ]
      },
      {
        name: 'Get Users',
        weeks: 6,
        modules: [
          { title: 'Traction by Gabriel Weinberg', type: 'Book', platform: 'Amazon', hours: 8, url: 'https://tractionbook.com/' },
          { title: 'ProductHunt Launch Guide', type: 'Article', platform: 'ProductHunt', hours: 3, url: 'https://www.producthunt.com/launch' },
          { title: 'Content Marketing Basics', type: 'Course', platform: 'HubSpot', hours: 6, url: 'https://academy.hubspot.com/courses/content-marketing' },
        ]
      },
      {
        name: 'Grow & Monetize',
        weeks: 8,
        modules: [
          { title: 'SaaS Metrics 101', type: 'Article', platform: 'ChartMogul', hours: 4, url: 'https://chartmogul.com/saas-metrics/' },
          { title: 'Stripe Docs', type: 'Docs', platform: 'Stripe', hours: 5, url: 'https://stripe.com/docs' },
          { title: 'Indie Hackers Community', type: 'Project', platform: 'Indie Hackers', hours: 20, url: 'https://www.indiehackers.com/' },
        ]
      },
    ],
    resources: [
      { title: 'YC Startup School', platform: 'Y Combinator', type: 'Course', price: 'Free', rating: 4.9, url: 'https://www.startupschool.org/' },
      { title: 'The Lean Startup', platform: 'Book', type: 'Book', price: 'Paid', rating: 4.7, url: 'http://theleanstartup.com/' },
      { title: 'Indie Hackers', platform: 'indiehackers.com', type: 'Community', price: 'Free', rating: 4.8, url: 'https://www.indiehackers.com/' },
      { title: 'Traction Book', platform: 'tractionbook.com', type: 'Book', price: 'Paid', rating: 4.7, url: 'https://tractionbook.com/' },
      { title: 'First Round Review', platform: 'firstround.com', type: 'Article', price: 'Free', rating: 4.9, url: 'https://review.firstround.com/' },
    ],
    projects: [
      { title: 'Landing Page Test', difficulty: 'Beginner', time: '4 hrs', tech: ['Carrd', 'Webflow'], desc: 'Validate demand with a waitlist page' },
      { title: 'No-code MVP', difficulty: 'Intermediate', time: '20 hrs', tech: ['Bubble', 'Airtable'], desc: 'Functional prototype without code' },
      { title: 'Cold Outreach Campaign', difficulty: 'Beginner', time: '6 hrs', tech: ['Email', 'LinkedIn'], desc: 'Get 10 customer interviews' },
      { title: 'Revenue-generating SaaS', difficulty: 'Advanced', time: '80+ hrs', tech: ['Full stack'], desc: 'Build, launch, get first paying customer' },
    ],
  },

  'language': {
    label: 'Language Learning',
    emoji: '🗣️',
    keywords: ['language', 'spanish', 'french', 'german', 'japanese', 'chinese', 'korean', 'english', 'fluent', 'vocabulary', 'grammar', 'duolingo'],
    phases: [
      {
        name: 'Pronunciation & Basics',
        weeks: 4,
        modules: [
          { title: 'Alphabet & Sounds', type: 'Video', platform: 'YouTube', hours: 4, url: 'https://www.youtube.com/' },
          { title: 'Basic Greetings', type: 'Interactive', platform: 'Duolingo', hours: 6, url: 'https://www.duolingo.com/' },
          { title: '100 Most Common Words', type: 'Interactive', platform: 'Anki', hours: 5, url: 'https://apps.ankiweb.net/' },
        ]
      },
      {
        name: 'Core Grammar',
        weeks: 8,
        modules: [
          { title: 'Grammar Foundations', type: 'Course', platform: 'Babbel', hours: 15, url: 'https://www.babbel.com/' },
          { title: 'Verb Conjugation Practice', type: 'Interactive', platform: 'Conjuguemos', hours: 8, url: 'https://conjuguemos.com/' },
          { title: 'Daily Duolingo (Streak)', type: 'Interactive', platform: 'Duolingo', hours: 10, url: 'https://www.duolingo.com/' },
        ]
      },
      {
        name: 'Listening & Speaking',
        weeks: 8,
        modules: [
          { title: 'Podcasts for Beginners', type: 'Audio', platform: 'Spotify', hours: 20, url: 'https://open.spotify.com/' },
          { title: 'Language Exchange (italki)', type: 'Project', platform: 'italki', hours: 15, url: 'https://www.italki.com/' },
          { title: 'Native Movies with Subtitles', type: 'Video', platform: 'Netflix', hours: 20, url: 'https://www.netflix.com/' },
        ]
      },
      {
        name: 'Immersion',
        weeks: 8,
        modules: [
          { title: 'Read a Children\'s Book', type: 'Project', platform: 'Library', hours: 10, url: null },
          { title: 'Write Daily Journal', type: 'Project', platform: 'Journaling', hours: 12, url: null },
          { title: 'Tutoring Session', type: 'Project', platform: 'italki / Preply', hours: 15, url: 'https://preply.com/' },
        ]
      },
    ],
    resources: [
      { title: 'Duolingo', platform: 'duolingo.com', type: 'Interactive', price: 'Free', rating: 4.6, url: 'https://www.duolingo.com/' },
      { title: 'Anki (SRS Flashcards)', platform: 'ankiweb.net', type: 'Tool', price: 'Free', rating: 4.8, url: 'https://apps.ankiweb.net/' },
      { title: 'italki (Tutors)', platform: 'italki.com', type: 'Tutor', price: 'Paid', rating: 4.7, url: 'https://www.italki.com/' },
      { title: 'Pimsleur', platform: 'pimsleur.com', type: 'Audio', price: 'Paid', rating: 4.6, url: 'https://www.pimsleur.com/' },
      { title: 'LingQ', platform: 'lingq.com', type: 'Interactive', price: 'Paid', rating: 4.5, url: 'https://www.lingq.com/' },
    ],
    projects: [
      { title: '30-day Streak', difficulty: 'Beginner', time: '5 hrs/wk', tech: ['Duolingo'], desc: 'Daily practice for habit building' },
      { title: 'Watch a Show Without Subs', difficulty: 'Intermediate', time: '20 hrs', tech: ['Netflix'], desc: 'Watch a full season in target language' },
      { title: '1-hour Conversation', difficulty: 'Intermediate', time: '1 hr', tech: ['italki'], desc: 'Sustain a conversation with a native' },
      { title: 'Write a Short Story', difficulty: 'Advanced', time: '10 hrs', tech: ['Writing'], desc: '500-word story in target language' },
    ],
  },

  'fitness': {
    label: 'Fitness & Health',
    emoji: '💪',
    keywords: ['fitness', 'fit', 'gym', 'workout', 'lose weight', 'weight loss', 'fat loss', 'muscle', 'strength', 'cardio', 'yoga', 'run', 'runner', 'running', '5k', '10k', 'marathon', 'abs', 'diet', 'nutrition', 'health', 'wellness'],
    phases: [
      {
        name: 'Assess & Plan',
        weeks: 1,
        modules: [
          { title: 'Body Metrics & Baseline', type: 'Article', platform: 'Healthline', hours: 1, url: 'https://www.healthline.com/health/fitness/body-measurements' },
          { title: 'Set SMART Goals', type: 'Article', platform: 'Nerd Fitness', hours: 1, url: 'https://www.nerdfitness.com/' },
          { title: 'Nutrition Basics', type: 'Course', platform: 'Precision Nutrition', hours: 4, url: 'https://www.precisionnutrition.com/' },
        ]
      },
      {
        name: 'Build Habits',
        weeks: 6,
        modules: [
          { title: 'Beginner Strength Program', type: 'Article', platform: 'StrongLifts 5x5', hours: 3, url: 'https://stronglifts.com/5x5/' },
          { title: 'Proper Form Videos', type: 'Video', platform: 'YouTube - AthleanX', hours: 5, url: 'https://www.youtube.com/@athleanx' },
          { title: 'Meal Prep Basics', type: 'Video', platform: 'YouTube', hours: 3, url: 'https://www.youtube.com/results?search_query=meal+prep+beginner' },
        ]
      },
      {
        name: 'Progressive Overload',
        weeks: 12,
        modules: [
          { title: 'Intermediate Programming', type: 'Article', platform: 'Barbell Medicine', hours: 4, url: 'https://www.barbellmedicine.com/' },
          { title: 'Track Workouts (Strong App)', type: 'Tool', platform: 'Strong', hours: 2, url: 'https://www.strong.app/' },
          { title: 'Recovery & Sleep', type: 'Article', platform: 'Huberman Lab', hours: 3, url: 'https://hubermanlab.com/' },
        ]
      },
      {
        name: 'Specialization',
        weeks: 8,
        modules: [
          { title: 'Pick Your Path', type: 'Article', platform: 'Reddit r/fitness', hours: 2, url: 'https://www.reddit.com/r/Fitness/wiki/index' },
          { title: 'Advanced Programming', type: 'Article', platform: 'Renaissance Periodization', hours: 5, url: 'https://renaissanceperiodization.com/' },
          { title: 'First Goal Test', type: 'Project', platform: 'Self-guided', hours: 1, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Nerd Fitness', platform: 'nerdfitness.com', type: 'Article', price: 'Free', rating: 4.7, url: 'https://www.nerdfitness.com/' },
      { title: 'StrongLifts 5x5', platform: 'stronglifts.com', type: 'Program', price: 'Free', rating: 4.8, url: 'https://stronglifts.com/5x5/' },
      { title: 'AthleanX YouTube', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@athleanx' },
      { title: 'Huberman Lab Podcast', platform: 'Spotify', type: 'Audio', price: 'Free', rating: 4.9, url: 'https://hubermanlab.com/' },
      { title: 'Barbell Medicine', platform: 'barbellmedicine.com', type: 'Article', price: 'Free', rating: 4.8, url: 'https://www.barbellmedicine.com/' },
    ],
    projects: [
      { title: 'First Full Workout Week', difficulty: 'Beginner', time: '5 hrs', tech: ['Gym'], desc: 'Complete 3 workouts in your first week' },
      { title: '5K Run', difficulty: 'Beginner', time: '30 min', tech: ['Running'], desc: 'Complete a 5K using Couch to 5K' },
      { title: 'Bodyweight Unlock', difficulty: 'Intermediate', time: '12 wks', tech: ['Calisthenics'], desc: 'First pull-up, 25 pushups, 50 squats' },
      { title: 'Half Marathon', difficulty: 'Advanced', time: '16 wks', tech: ['Running'], desc: 'Complete a half marathon' },
    ],
  },

  'creative': {
    label: 'Creative Arts',
    emoji: '🎭',
    keywords: ['music', 'guitar', 'piano', 'drawing', 'painting', 'writing', 'novel', 'photography', 'video', 'film', 'animation', 'art', 'sing', 'blender'],
    phases: [
      {
        name: 'Fundamentals',
        weeks: 4,
        modules: [
          { title: 'Basic Theory', type: 'Course', platform: 'Skillshare', hours: 8, url: 'https://www.skillshare.com/' },
          { title: 'Essential Techniques', type: 'Video', platform: 'YouTube', hours: 6, url: 'https://www.youtube.com/' },
          { title: 'Inspiration & Reference', type: 'Article', platform: 'Pinterest', hours: 3, url: 'https://www.pinterest.com/' },
        ]
      },
      {
        name: 'Daily Practice',
        weeks: 8,
        modules: [
          { title: 'Practice Routine', type: 'Article', platform: 'Artist Resource', hours: 4, url: 'https://conceptartempire.com/' },
          { title: 'Structured Exercises', type: 'Course', platform: 'Domestika', hours: 12, url: 'https://www.domestika.org/' },
          { title: 'Community Feedback', type: 'Project', platform: 'Reddit / Discord', hours: 6, url: 'https://www.reddit.com/r/learnart/' },
        ]
      },
      {
        name: 'First Projects',
        weeks: 6,
        modules: [
          { title: 'Project-based Learning', type: 'Course', platform: 'Domestika', hours: 10, url: 'https://www.domestika.org/' },
          { title: 'Critique & Iterate', type: 'Article', platform: 'Medium', hours: 4, url: 'https://medium.com/' },
          { title: '5 Finished Works', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
      {
        name: 'Build Portfolio',
        weeks: 4,
        modules: [
          { title: 'Portfolio Setup', type: 'Video', platform: 'YouTube', hours: 4, url: 'https://www.youtube.com/' },
          { title: 'Showcase on Instagram / ArtStation', type: 'Project', platform: 'ArtStation', hours: 6, url: 'https://www.artstation.com/' },
          { title: 'Final Portfolio Piece', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Skillshare', platform: 'skillshare.com', type: 'Course', price: 'Paid', rating: 4.6, url: 'https://www.skillshare.com/' },
      { title: 'Domestika', platform: 'domestika.org', type: 'Course', price: 'Paid', rating: 4.7, url: 'https://www.domestika.org/' },
      { title: 'Proko (Drawing)', platform: 'proko.com', type: 'Course', price: 'Free', rating: 4.9, url: 'https://www.proko.com/' },
      { title: 'Blender Guru', platform: 'YouTube', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/@blenderguru' },
      { title: 'The Artist\'s Way', platform: 'Book', type: 'Book', price: 'Paid', rating: 4.6, url: 'https://juliacameronlive.com/the-artists-way/' },
    ],
    projects: [
      { title: 'Daily Creative Challenge', difficulty: 'Beginner', time: '30 min/day', tech: ['Pen & Paper'], desc: '30-day sketch/writing/practice challenge' },
      { title: 'Study a Master', difficulty: 'Beginner', time: '8 hrs', tech: ['Any medium'], desc: 'Reproduce/analyze a favorite work' },
      { title: 'Personal Series', difficulty: 'Intermediate', time: '20 hrs', tech: ['Any'], desc: '5 connected pieces around a theme' },
      { title: 'Gallery / Publication', difficulty: 'Advanced', time: '40+ hrs', tech: ['Any'], desc: 'Submit to an exhibition or publication' },
    ],
  },

  'generic': {
    label: 'Personal Goal',
    emoji: '🎯',
    keywords: [],
    phases: [
      {
        name: 'Discovery',
        weeks: 2,
        modules: [
          { title: 'Research the field', type: 'Article', platform: 'Google / Wikipedia', hours: 4, url: 'https://www.google.com/' },
          { title: 'Identify top experts', type: 'Article', platform: 'YouTube', hours: 3, url: 'https://www.youtube.com/' },
          { title: 'Define success criteria', type: 'Project', platform: 'Self-guided', hours: 2, url: null },
        ]
      },
      {
        name: 'Learn Fundamentals',
        weeks: 6,
        modules: [
          { title: 'Intro course', type: 'Course', platform: 'Coursera', hours: 10, url: 'https://www.coursera.org/' },
          { title: 'Free online tutorials', type: 'Video', platform: 'YouTube', hours: 8, url: 'https://www.youtube.com/' },
          { title: 'Read the canonical book', type: 'Book', platform: 'Library', hours: 12, url: null },
        ]
      },
      {
        name: 'Practice Deliberately',
        weeks: 8,
        modules: [
          { title: 'Follow a structured program', type: 'Course', platform: 'Udemy', hours: 15, url: 'https://www.udemy.com/' },
          { title: 'Weekly mini-projects', type: 'Project', platform: 'Self-guided', hours: 20, url: null },
          { title: 'Join a community', type: 'Community', platform: 'Discord / Reddit', hours: 4, url: 'https://www.reddit.com/' },
        ]
      },
      {
        name: 'Ship Something Real',
        weeks: 4,
        modules: [
          { title: 'Plan your first major project', type: 'Project', platform: 'Self-guided', hours: 5, url: null },
          { title: 'Build & iterate', type: 'Project', platform: 'Self-guided', hours: 25, url: null },
          { title: 'Get feedback & share', type: 'Project', platform: 'Social media', hours: 3, url: null },
        ]
      },
    ],
    resources: [
      { title: 'Coursera', platform: 'coursera.org', type: 'Course', price: 'Free audit', rating: 4.7, url: 'https://www.coursera.org/' },
      { title: 'YouTube', platform: 'youtube.com', type: 'Video', price: 'Free', rating: 4.8, url: 'https://www.youtube.com/' },
      { title: 'Reddit Communities', platform: 'reddit.com', type: 'Community', price: 'Free', rating: 4.6, url: 'https://www.reddit.com/' },
      { title: 'Udemy', platform: 'udemy.com', type: 'Course', price: 'Paid', rating: 4.5, url: 'https://www.udemy.com/' },
      { title: 'Skillshare', platform: 'skillshare.com', type: 'Course', price: 'Paid', rating: 4.6, url: 'https://www.skillshare.com/' },
    ],
    projects: [
      { title: 'First small win', difficulty: 'Beginner', time: '4 hrs', tech: ['Basic'], desc: 'Something tiny you can finish in one session' },
      { title: 'Weekly practice project', difficulty: 'Beginner', time: '5 hrs/wk', tech: ['Basic'], desc: 'Repeatable format to build consistency' },
      { title: 'Showcase project', difficulty: 'Intermediate', time: '15 hrs', tech: ['Intermediate'], desc: 'Something portfolio-worthy' },
      { title: 'Capstone', difficulty: 'Advanced', time: '30+ hrs', tech: ['Advanced'], desc: 'Your most ambitious project yet' },
    ],
  },
};

// ---------- CLASSIFIER ----------

export function classifyIdea(goalText = '') {
  const text = goalText.toLowerCase();
  let bestMatch = 'generic';
  let bestScore = 0;

  for (const [key, domain] of Object.entries(DOMAINS)) {
    if (key === 'generic') continue;
    let score = 0;
    for (const keyword of domain.keywords) {
      if (text.includes(keyword)) {
        // longer keywords are more specific
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }
  return bestMatch;
}

// ---------- TIMELINE & SCORE CALCULATION ----------

function parseWeeklyHours(val) {
  if (!val) return 5;
  if (val.includes('20')) return 25;
  if (val.includes('10')) return 15;
  if (val.includes('4')) return 6;
  if (val.includes('1-3') || val.includes('1') || val.includes('2') || val.includes('3')) return 2;
  return 5;
}

function parseTimelineMonths(val) {
  if (!val) return 6;
  if (val === '1month') return 1;
  if (val === '3months') return 3;
  if (val === '6months') return 6;
  if (val === '1year') return 12;
  return 6;
}

function normalizeSelection(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

function selectionIncludes(value, expected) {
  return normalizeSelection(value).includes(expected);
}

function getPreferredLearningStyle(thoughtData, profile) {
  return [
    ...normalizeSelection(thoughtData?.learningStyle),
    ...normalizeSelection(profile?.learningStyle),
  ][0] || null;
}

function getPricePriority(resource, finance) {
  if (finance !== 'tight') return 0;
  return (resource.price || '').toLowerCase().includes('free') ? 0 : 1;
}

function getLearningStylePriority(resource, learningStyle) {
  const type = (resource.type || '').toLowerCase();

  if (learningStyle === 'visual') {
    if (type === 'video') return 0;
    if (type === 'course') return 1;
  }

  if (learningStyle === 'reading') {
    if (type === 'docs' || type === 'article' || type === 'book') return 0;
    if (type === 'course') return 1;
  }

  if (learningStyle === 'handson') {
    if (type === 'interactive' || type === 'project' || type === 'tool') return 0;
    if (type === 'course') return 1;
  }

  if (learningStyle === 'social') {
    if (type === 'community' || type === 'tutor') return 0;
    if (type === 'interactive' || type === 'project') return 1;
  }

  return 2;
}

function sortResources(resources, finance, learningStyle) {
  return [...resources].sort((a, b) => {
    const priceDiff = getPricePriority(a, finance) - getPricePriority(b, finance);
    if (priceDiff !== 0) return priceDiff;

    const learningDiff = getLearningStylePriority(a, learningStyle) - getLearningStylePriority(b, learningStyle);
    if (learningDiff !== 0) return learningDiff;

    return (b.rating || 0) - (a.rating || 0);
  });
}

function computeRealityScore(input, totalWeeksNeeded, userMonths) {
  const weeksUserWants = userMonths * 4.33;
  let score = 70; // start base

  // Timeline match
  const ratio = weeksUserWants / totalWeeksNeeded;
  if (ratio >= 1.2) score += 20;        // plenty of time
  else if (ratio >= 0.9) score += 10;   // just enough
  else if (ratio >= 0.6) score -= 10;   // tight
  else if (ratio >= 0.4) score -= 25;   // aggressive
  else score -= 40;                     // very unrealistic

  // Familiarity bonus (0-5 scale)
  const fam = input.familiarity ?? 0;
  score += fam * 3;

  // Dedication
  const dedMap = { exploring: -10, serious: 5, committed: 12, urgent: 15 };
  score += dedMap[input.dedication] ?? 0;

  // Finance (tight budget hurts premium path)
  if (input.finance === 'tight') score -= 3;

  // Blockers drop confidence
  const blockers = Array.isArray(input.blockers) ? input.blockers.length : 0;
  score -= blockers * 2;

  return Math.max(15, Math.min(98, Math.round(score)));
}

function getVerdict(score) {
  if (score >= 80) return { label: 'Highly Feasible', color: '#065f46', bg: '#d1fae5' };
  if (score >= 60) return { label: 'Feasible with adjustments', color: '#d97706', bg: '#fef3c7' };
  if (score >= 40) return { label: 'Ambitious — needs recalibration', color: '#c2410c', bg: '#ffedd5' };
  return { label: 'Unrealistic — let\'s rework this', color: '#dc2626', bg: '#fee2e2' };
}

// ---------- MAIN ENTRY ----------

/**
 * Generate a full roadmap + reality check from user inputs.
 * In future, this can become a `fetch('/api/generate', ...)` call.
 */
export function generateRoadmap({ goal, thoughtData, profile }) {
  const domainKey = classifyIdea(goal || thoughtData?.goal || '');
  const domain = DOMAINS[domainKey];
  const mergedInput = { ...profile, ...thoughtData };

  const hoursPerWeek = parseWeeklyHours(profile?.weeklyHours);
  const userMonths = parseTimelineMonths(thoughtData?.timeline);

  // clone phases so we don't mutate
  const phases = domain.phases.map((p, i) => {
    const totalHours = p.modules.reduce((s, m) => s + m.hours, 0);
    const adjustedWeeks = Math.max(1, Math.round(totalHours / Math.max(1, hoursPerWeek) + 0.5));
    return {
      ...p,
      duration: `${adjustedWeeks} weeks`,
      adjustedWeeks,
      totalHours,
      status: i === 0 ? 'active' : 'locked',
      modules: p.modules.map((m, mi) => ({
        ...m,
        done: i === 0 && mi === 0, // only first module "done" if active phase
      }))
    };
  });

  const totalWeeks = phases.reduce((s, p) => s + p.adjustedWeeks, 0);
  const totalHours = phases.reduce((s, p) => s + p.totalHours, 0);

  const learningStyle = getPreferredLearningStyle(thoughtData, profile);
  const resources = sortResources(domain.resources, profile?.finance, learningStyle);

  // Filter projects by familiarity level
  const famLevel = thoughtData?.familiarity ?? 0;
  let projects = domain.projects;
  if (famLevel <= 1) projects = projects.filter(p => p.difficulty !== 'Advanced');

  // Reality check computation
  const score = computeRealityScore(mergedInput, totalWeeks, userMonths);
  const verdict = getVerdict(score);
  const weeksUserWants = userMonths * 4.33;

  // Build dynamic reality messages
  const adjustments = [];
  if (totalWeeks > weeksUserWants * 1.2) {
    const extension = Math.round((totalWeeks - weeksUserWants) / 4.33);
    adjustments.push(`Extended timeline by ~${extension} months to match ${hoursPerWeek} hrs/week availability`);
  }
  if (famLevel >= 3) adjustments.push('Skipped intro modules — you already have basics covered');
  if (famLevel <= 1) adjustments.push('Added fundamentals first since you\'re new to this');
  if (profile?.finance === 'tight') adjustments.push('Prioritized free resources over paid ones');
  if (selectionIncludes(learningStyle, 'visual')) adjustments.push('Weighted toward video courses per your learning style');
  if (selectionIncludes(learningStyle, 'reading')) adjustments.push('Moved docs, articles, and books higher in your resource stack');
  if (selectionIncludes(learningStyle, 'handson')) adjustments.push('Pulled interactive tools and project-based resources earlier');
  if (selectionIncludes(learningStyle, 'social')) adjustments.push('Kept community-based resources visible so you are not learning solo');
  if ((thoughtData?.blockers || []).includes('motivation')) adjustments.push('Broke big milestones into weekly mini-wins to fight motivation dips');
  if ((thoughtData?.blockers || []).includes('time')) adjustments.push('Added buffer weeks for missed sessions (auto-recovery)');
  if ((thoughtData?.blockers || []).includes('complexity')) adjustments.push('Simplified terminology and explained prerequisites upfront');
  if (adjustments.length === 0) adjustments.push('Balanced plan across all phases — no major adjustments needed');

  const viableMilestones = buildMilestones(domainKey, phases);

  const timelineGap = totalWeeks > weeksUserWants * 1.15
    ? {
        severity: 'warning',
        title: 'Timeline Reality Gap',
        message: `You want results in ~${userMonths} months but at ${hoursPerWeek} hrs/week this path realistically takes ~${Math.round(totalWeeks / 4.33)} months. We've recalibrated.`
      }
    : weeksUserWants > totalWeeks * 1.5
    ? {
        severity: 'info',
        title: 'You have extra buffer',
        message: `Good news — your ~${userMonths} month target leaves you breathing room. Consider adding stretch projects or specialization topics.`
      }
    : {
        severity: 'success',
        title: 'Timeline is realistic',
        message: `At ${hoursPerWeek} hrs/week this path takes ~${Math.round(totalWeeks / 4.33)} months, which matches your target. Green light.`
      };

  return {
    domain: domainKey,
    domainLabel: domain.label,
    domainEmoji: domain.emoji,
    goal: goal || thoughtData?.goal || 'Untitled Goal',
    phases,
    resources,
    projects,
    totalWeeks,
    totalHours,
    weeklyHours: hoursPerWeek,
    realityCheck: {
      score,
      verdict: verdict.label,
      verdictColor: verdict.color,
      verdictBg: verdict.bg,
      timelineGap,
      viableMilestones,
      adjustments,
      userExpectedMonths: userMonths,
      estimatedMonths: Math.round(totalWeeks / 4.33),
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function generateRoadmapWithBackend({ goal, thoughtData, profile }) {
  const configuredEndpoint = import.meta.env.VITE_ROADMAP_API_URL;
  const endpoint = configuredEndpoint || (
    typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? 'http://localhost:8787/api/roadmap/generate'
      : ''
  );
  if (!endpoint) {
    const roadmap = generateRoadmap({ goal, thoughtData, profile });
    return { ...roadmap, _source: 'local' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, thoughtData, profile }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `Roadmap API returned ${response.status}`);
    }
    const payload = await response.json();
    if (payload?.phases && payload?.resources && payload?.realityCheck) {
      return { ...payload, _source: 'api' };
    }
    throw new Error('Roadmap API payload shape is invalid');
  } catch (err) {
    console.warn('[Pathfinder] Backend roadmap generation failed, using local engine:', err.message);
    const roadmap = generateRoadmap({ goal, thoughtData, profile });
    return { ...roadmap, _source: 'local', _apiError: err.message };
  }
}

function buildMilestones(domainKey, phases) {
  const rough = [];
  let cumulativeWeeks = 0;
  for (const phase of phases) {
    cumulativeWeeks += phase.adjustedWeeks;
    const monthLabel = `Month ${Math.max(1, Math.round(cumulativeWeeks / 4.33))}`;
    rough.push({ time: monthLabel, item: `Complete "${phase.name}" phase` });
  }
  // Add a last "apply" milestone
  const lastMonth = Math.max(1, Math.round(phases.reduce((s, p) => s + p.adjustedWeeks, 0) / 4.33));
  const finalMessages = {
    'ml-ai': 'Apply for junior ML / data roles or launch a portfolio project',
    'webdev': 'Ship a full-stack portfolio and start freelance / job search',
    'mobile': 'Publish app to Play Store / App Store',
    'design': 'Full portfolio with 3 case studies — ready to apply',
    'startup': 'Reach first paying customer or launch on ProductHunt',
    'language': 'Hold a 30-minute conversation with a native speaker',
    'fitness': 'Achieve your initial physical goal (strength/speed/physique)',
    'creative': 'Publish portfolio / gallery / release work publicly',
    'generic': 'Ship a portfolio-worthy project that showcases your growth',
  };
  rough.push({ time: `Month ${lastMonth}+`, item: finalMessages[domainKey] || finalMessages.generic });
  return rough;
}

export { DOMAINS };

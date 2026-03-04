import { StepOption } from "./types";
import {
    Sprout, Briefcase, Undo2,
    Code, BarChart3, GraduationCap, Building2,
    Cpu, Sparkles, Settings, MessageSquare,
    ArrowRightLeft, TrendingUp, Rocket,
    Clock, Hourglass, Timer,
    Wrench, Book, Scale,
    Lightbulb, ClipboardList, Globe, Mic,
    Laptop, FlaskConical, PieChart, Database
} from "lucide-react";

const I = "w-6 h-6";

// 1. CURRENT BACKGROUND (Single Select)
export const BACKGROUND_OPTIONS: StepOption[] = [
    { id: 'beginner', name: 'Complete Beginner', desc: 'No prior programming experience', icon: <Sprout className={`${I} text-green-500`} /> },
    { id: 'student', name: 'Student / Recent Graduate', desc: 'Currently studying or recently graduated', icon: <GraduationCap className={`${I} text-amber-500`} /> },
    { id: 'software-dev', name: 'Software Developer', desc: 'Backend, Frontend, or Full-stack', icon: <Code className={`${I} text-blue-500`} /> },
    { id: 'data-analyst', name: 'Data / Business Analyst', desc: 'Working with data, SQL, or BI tools', icon: <BarChart3 className={`${I} text-cyan-500`} /> },
    { id: 'tech-pro', name: 'Tech Professional', desc: 'QA, DevOps, IT Support, etc.', icon: <Briefcase className={`${I} text-indigo-500`} /> },
    { id: 'non-tech', name: 'Non-Tech Professional', desc: 'Transitioning from other industries', icon: <Building2 className={`${I} text-gray-500`} /> },
    { id: 'career-gap', name: 'Career Break / Returning to Workforce', desc: 'Restarting career after a break', icon: <Undo2 className={`${I} text-purple-500`} /> },
];

// 2. PRIOR KNOWLEDGE (Multi-Select) — grouped by category for chip UI
export const EXPERIENCE_CATEGORIES = [
    { id: 'foundations', label: 'Foundations' },
    { id: 'ai-ml', label: 'AI & Machine Learning' },
    { id: 'tools', label: 'Tools & Infrastructure' },
    { id: 'data-eng', label: 'Data Engineering' },
] as const;

export const EXPERIENCE_OPTIONS = [
    { key: 'python', label: 'Python', desc: 'Variables, loops, functions, OOP', group: 'foundations' },
    { key: 'sql', label: 'SQL', desc: 'Queries, joins, database fundamentals', group: 'foundations' },
    { key: 'statistics', label: 'Math & Stats', desc: 'Probability, distributions, hypothesis testing', group: 'foundations' },
    { key: 'ml', label: 'ML Basics', desc: 'Regression, classification, core algorithms', group: 'ai-ml' },
    { key: 'dl', label: 'Deep Learning', desc: 'Neural networks, CNNs, RNNs, transformers', group: 'ai-ml' },
    { key: 'nlp', label: 'NLP', desc: 'Text processing, embeddings, transformers', group: 'ai-ml' },
    { key: 'genai', label: 'GenAI', desc: 'LLMs, RAG, prompt engineering', group: 'ai-ml' },
    { key: 'mlops', label: 'MLOps & Cloud', desc: 'Deployment, MLflow, AWS/Azure', group: 'tools' },
    { key: 'excel_bi', label: 'Excel & BI Tools', desc: 'Excel, Power BI, Tableau, dashboards', group: 'tools' },
    { key: 'data_engineering', label: 'DE Basics', desc: 'ETL pipelines, data modeling, warehousing', group: 'data-eng' },
    { key: 'big_data', label: 'Big Data & Cloud', desc: 'Spark, Databricks, Snowflake, Airflow, Kafka', group: 'data-eng' },
];

// 3. TARGET GOAL (Single Select)
export const GOALS: StepOption[] = [
    { id: 'data-analyst', name: 'Data Analyst', desc: 'Analyze data, build dashboards, and deliver business insights', icon: <PieChart className={`${I} text-amber-500`} /> },
    { id: 'data-engineer', name: 'Data Engineer', desc: 'Build data pipelines, warehouses, and scalable data infrastructure', icon: <Database className={`${I} text-teal-600`} /> },
    { id: 'data-scientist', name: 'Data Scientist', desc: 'Analyze data, build predictive models, and drive business decisions', icon: <FlaskConical className={`${I} text-cyan-600`} /> },
    { id: 'ai-engineer', name: 'AI Engineer', desc: 'Build complete AI-powered products from data to deployment', icon: <Settings className={`${I} text-gray-600`} /> },
    { id: 'ml-engineer', name: 'ML Engineer', desc: 'Train and deploy machine learning models at scale', icon: <Cpu className={`${I} text-green-600`} /> },
    { id: 'genai-engineer', name: 'GenAI Engineer', desc: 'Build AI chatbots, assistants, and smart automation', icon: <Sparkles className={`${I} text-purple-500`} /> },
    { id: 'nlp-engineer', name: 'NLP Engineer', desc: 'Teach computers to understand and generate human language', icon: <MessageSquare className={`${I} text-pink-500`} /> },
];

// 4. CAREER OUTCOME (Single Select)
export const CAREER_OUTCOMES: StepOption[] = [
    { id: 'job-search', name: 'Full-Time Employment', desc: 'Get hired or switch companies', icon: <Briefcase className={`${I} text-blue-600`} /> },
    { id: 'career-transition', name: 'Career Transition', desc: 'Move into AI from another field or internal team', icon: <ArrowRightLeft className={`${I} text-orange-500`} /> },
    { id: 'freelance', name: 'Freelancing / Consulting', desc: 'Work independently on projects', icon: <Laptop className={`${I} text-indigo-500`} /> },
    { id: 'startup', name: 'Entrepreneurship', desc: 'Build AI product/startup', icon: <Rocket className={`${I} text-red-500`} /> },
    { id: 'upskill', name: 'Skill Enhancement', desc: 'Upskill without immediate job switch', icon: <TrendingUp className={`${I} text-green-500`} /> },
    { id: 'academic', name: 'Academic / Research', desc: "Master's, PhD, research focus", icon: <GraduationCap className={`${I} text-purple-500`} /> },
];

// 5. WEEKLY AVAILABILITY (Single Select)
export const AVAILABILITY_OPTIONS: StepOption[] = [
    { id: '0-5', name: '5 hours or less', desc: 'Slow and steady pace', icon: <Clock className={`${I} text-gray-400`} /> },
    { id: '5-10', name: '5-10 hours', desc: 'Consistent weekly learning', icon: <Hourglass className={`${I} text-blue-400`} /> },
    { id: '10-20', name: '10-20 hours', desc: 'Balanced pace', icon: <Timer className={`${I} text-orange-500`} /> },
    { id: '20+', name: '20+ hours', desc: 'Intensive learning', icon: <Rocket className={`${I} text-red-500`} /> },
];

// 6. LEARNING STYLE (Single Select)
export const LEARNING_PREFERENCES: StepOption[] = [
    { id: 'practical', name: 'Practical-first', desc: 'Projects early, minimal theory', icon: <Wrench className={`${I} text-orange-500`} /> },
    { id: 'theory', name: 'Theory-first', desc: 'Strong fundamentals before projects', icon: <Book className={`${I} text-purple-500`} /> },
    { id: 'balanced', name: 'Balanced', desc: 'Theory + practice together', icon: <Scale className={`${I} text-blue-500`} /> },
];

// 7. APPLICATION FOCUS (Multi-Select)
export const REAL_WORLD_APPS: StepOption[] = [
    { id: 'own-project', name: 'Build My Own Project / Idea', desc: 'Work on your specific use case', icon: <Lightbulb className={`${I} text-yellow-500`} /> },
    { id: 'provided', name: 'Structured Guided Projects', desc: 'Follow structured project tracks', icon: <ClipboardList className={`${I} text-blue-500`} /> },
    { id: 'open-source', name: 'Contribute to Open Source', desc: 'Contribute to real projects', icon: <Globe className={`${I} text-green-500`} /> },
    { id: 'job-prep', name: 'Job Preparation', desc: 'Portfolio + Interview Prep', icon: <Mic className={`${I} text-rose-500`} /> },
];

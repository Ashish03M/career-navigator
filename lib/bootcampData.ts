
/** @deprecated Use Chapter instead */
export type RoadmapItem = Chapter;

export type Chapter = {
    id: string;
    title: string;
    subjectId: string;
    topics: string[];
    durationWeeks: number;
    isProject?: boolean;
    isInternship?: boolean;
    resources?: { label: string; url: string }[];
};

export const FULL_ROADMAP: Chapter[] = [
    // ===== 1. PYTHON FUNDAMENTALS =====
    {
        id: "m1",
        title: "1. Python Fundamentals",
        subjectId: "Foundation",
        durationWeeks: 2,
        topics: [
            "Introduction to Python: Why Python, Installation, IDE setup",
            "Variables, Numbers and Strings: Operations, Slicing",
            "Lists, Conditions and Loops: If/Else, For/While loops",
            "Functions, Dictionaries, Tuples and File Handling",
            "Classes and Exception Handling: OOP, Error handling",
            "NumPy: Basic & Matrix operations",
            "EDA using Pandas, Matplotlib and Seaborn"
        ]
    },
    // ===== 2. PROJECT 1 =====
    {
        id: "m2",
        title: "2. Project 1: Exploratory Data Analysis (Hospitality Domain)",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 1,
        topics: [
            "Problem statement",
            "OLTP vs OLAP",
            "ETL and Data Warehouse concepts",
            "Fact and Dimension tables",
            "Star vs Snowflake schema",
            "Data exploration, cleaning, transformation",
            "Insight generation"
        ]
    },
    // ===== 3. PYTHON ADVANCED =====
    {
        id: "m3",
        title: "3. Python Advanced",
        subjectId: "Foundation",
        durationWeeks: 1.5,
        topics: [
            "Comprehensions and Sets: List/dict/set comprehensions",
            "Debugging & PEP8 conventions",
            "JSON, Generators and Decorators",
            "APIs: Requests, Building APIs with FastAPI",
            "Logging, Pytest, Pydantic and MySQL integration"
        ]
    },
    // ===== 4. PROJECT 2 =====
    {
        id: "m4",
        title: "4. Project 2: Expense Tracking System",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 1.5,
        topics: [
            "Problem statement and architecture",
            "Database CRUD operations",
            "Automated testing",
            "Backend with FastAPI & Logging",
            "Frontend and Analytics with Streamlit",
            "Deployment"
        ]
    },
    // ===== 5. SQL BASICS =====
    {
        id: "m5",
        title: "5. SQL Basics",
        subjectId: "Data Science",
        durationWeeks: 1.5,
        topics: [
            "Single Table Queries: SELECT, WHERE, GROUP BY, HAVING",
            "Calculated columns & CASE statements",
            "Multiple Table Queries: JOINS (Inner, Left, Right, Full, Cross)"
        ]
    },
    // ===== 6. MATH & STATS =====
    {
        id: "m6",
        title: "6. Math and Statistics",
        subjectId: "Data Science",
        durationWeeks: 2,
        topics: [
            "Data Visualization: Charts & Plots (Univariate/Bivariate)",
            "Measures of Central Tendency and Dispersion",
            "Probability Theory & Bayes Theorem",
            "Distributions: Normal, Z-score, CLT",
            "Hypothesis Testing: Z-test, p-value, Type I/II errors",
            "A/B Testing Project: Campaign planning, Hypothesis testing"
        ]
    },
    // ===== 7. MACHINE LEARNING =====
    {
        id: "m7",
        title: "7. Machine Learning",
        subjectId: "Machine Learning",
        durationWeeks: 2.5,
        topics: [
            "ML Basics: Supervised vs Unsupervised, Regression vs Classification",
            "Regression: Linear/Polynomial, Cost function, Gradient Descent",
            "Regularization (L1, L2), Bias-variance tradeoff",
            "Classification: Logistic Regression, SVM, Naive Bayes, Decision Trees",
            "Ensemble Learning: Bagging (Random Forest), Boosting (AdaBoost, XGBoost)"
        ]
    },
    // ===== 8. UNSUPERVISED LEARNING =====
    {
        id: "m8",
        title: "8. Unsupervised Learning",
        subjectId: "Machine Learning",
        durationWeeks: 1,
        topics: [
            "K-Means clustering",
            "Hierarchical clustering",
            "DBSCAN",
            "Customer segmentation"
        ]
    },
    // ===== 9. PROJECT 3 =====
    {
        id: "m9",
        title: "9. Project 3: Healthcare Premium Prediction (Regression)",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 1.5,
        topics: [
            "Project charter & Data collection",
            "Data cleaning, EDA & Feature Engineering",
            "Model training, fine-tuning & Error analysis",
            "Deployment: Streamlit app"
        ]
    },
    // ===== 10. PROJECT 4 =====
    {
        id: "m10",
        title: "10. Project 4: Credit Risk Modeling (Classification)",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 1.5,
        topics: [
            "Domain understanding (NBFC, credit approvals)",
            "Data leakage & Data cleaning",
            "Feature engineering: WoE and IV",
            "Model evaluation: KS statistic, Gini coefficient",
            "Optuna for hyperparameter tuning",
            "Business presentation & Deployment"
        ]
    },
    // ===== 11. MLOPS =====
    {
        id: "m11",
        title: "11. MLOps and Cloud Tools",
        subjectId: "Machine Learning",
        durationWeeks: 1.5,
        topics: [
            "What is MLOps",
            "MLflow experiment tracking & Model registry",
            "Dagshub & FastAPI server",
            "Git version control",
            "AWS SageMaker: Training and deployment",
            "Data drift detection using PSI and CSI"
        ]
    },
    // ===== 12. NEURAL NETWORKS =====
    {
        id: "m12",
        title: "12. Neural Network Fundamentals",
        subjectId: "Deep Learning",
        durationWeeks: 1,
        topics: [
            "Neuron, Perceptron and MLP",
            "Activation functions (Sigmoid, ReLU, Tanh, Softmax)"
        ]
    },
    // ===== 13. PYTORCH =====
    {
        id: "m13",
        title: "13. PyTorch",
        subjectId: "Deep Learning",
        durationWeeks: 1,
        topics: [
            "Installation & Tensors",
            "Autograd",
            "NumPy vs PyTorch"
        ]
    },
    // ===== 14. TRAINING NNs =====
    {
        id: "m14",
        title: "14. Training Neural Networks",
        subjectId: "Deep Learning",
        durationWeeks: 1,
        topics: [
            "Backpropagation",
            "Gradient descent",
            "Batch, mini-batch and SGD"
        ]
    },
    // ===== 15. OPTIMIZATION =====
    {
        id: "m15",
        title: "15. Optimization",
        subjectId: "Deep Learning",
        durationWeeks: 0.5,
        topics: [
            "Momentum",
            "RMSprop",
            "Adam"
        ]
    },
    // ===== 16. REGULARIZATION =====
    {
        id: "m16",
        title: "16. Regularization",
        subjectId: "Deep Learning",
        durationWeeks: 0.5,
        topics: [
            "Dropout",
            "L1 and L2",
            "Batch normalization",
            "Early stopping"
        ]
    },
    // ===== 17. HYPERPARAMETER TUNING =====
    {
        id: "m17",
        title: "17. Hyperparameter Tuning",
        subjectId: "Deep Learning",
        durationWeeks: 0.5,
        topics: [
            "GridSearch",
            "RandomSearch",
            "Optuna"
        ]
    },
    // ===== 18. CNN =====
    {
        id: "m18",
        title: "18. CNN",
        subjectId: "Deep Learning",
        durationWeeks: 1.5,
        topics: [
            "Padding and strides",
            "Image classification",
            "Data augmentation",
            "Transfer learning & Pretrained models"
        ]
    },
    // ===== 19. SEQUENCE MODELS =====
    {
        id: "m19",
        title: "19. Sequence Models",
        subjectId: "Deep Learning",
        durationWeeks: 1,
        topics: [
            "RNN",
            "LSTM",
            "GRU"
        ]
    },
    // ===== 20. TRANSFORMERS =====
    {
        id: "m20",
        title: "20. Transformers",
        subjectId: "Deep Learning",
        durationWeeks: 1.5,
        topics: [
            "Transformer architecture",
            "Word embeddings",
            "Attention mechanism",
            "BERT, GPT-2",
            "NER and text classification"
        ]
    },
    // ===== 21. PROJECT: CAR DAMAGE =====
    {
        id: "m21",
        title: "21. Deep Learning Project: Car Damage Detection",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 1.5,
        topics: [
            "CNN model",
            "Transfer learning",
            "Hyperparameter tuning",
            "Streamlit app",
            "FastAPI server"
        ]
    },
    // ===== 22. Intro to NLP =====
    {
        id: "m22",
        title: "22. Introduction to NLP",
        subjectId: "NLP",
        durationWeeks: 0.5,
        topics: [
            "NLP tasks",
            "NLP pipeline",
            "Tools overview"
        ]
    },
    // ===== 23. Text Preprocessing =====
    {
        id: "m23",
        title: "23. Text Preprocessing",
        subjectId: "NLP",
        durationWeeks: 1,
        topics: [
            "Tokenization",
            "spaCy pipeline",
            "Stemming and lemmatization",
            "POS tagging",
            "Stop words",
            "NER",
            "Regex"
        ]
    },
    // ===== 24. Text Representation =====
    {
        id: "m24",
        title: "24. Text Representation",
        subjectId: "NLP",
        durationWeeks: 1,
        topics: [
            "Label encoding & One-hot encoding",
            "Bag of Words & N-grams",
            "TF-IDF",
            "Word embeddings",
            "News classification"
        ]
    },
    // ===== 25. Practical NLP =====
    {
        id: "m25",
        title: "25. Practical NLP with Hugging Face",
        subjectId: "NLP",
        durationWeeks: 1,
        topics: [
            "NLP pipelines",
            "BERT, DistilBERT, RoBERTa, ALBERT",
            "Tokenizers",
            "Fine-tuning models"
        ]
    },
    // ===== 26. Intro to GenAI =====
    {
        id: "m26",
        title: "26. Introduction to GenAI and Agentic AI",
        subjectId: "GenAI",
        durationWeeks: 0.5,
        topics: [
            "Generative AI vs Traditional AI",
            "AI agents and Agentic AI",
            "Applications",
            "Building GenAI apps"
        ]
    },
    // ===== 27. GenAI Foundations =====
    {
        id: "m27",
        title: "27. GenAI Foundations",
        subjectId: "GenAI",
        durationWeeks: 1,
        topics: [
            "LLMs & Context window",
            "Temperature, top-p, top-k",
            "Hallucinations and security",
            "Vector databases",
            "RAG"
        ]
    },
    // ===== 28. LangChain =====
    {
        id: "m28",
        title: "28. LangChain and Prompting",
        subjectId: "GenAI",
        durationWeeks: 1.5,
        topics: [
            "Prompt engineering: Zero-shot, one-shot, few-shot",
            "LangChain installation",
            "Prompt templates",
            "Chains and output parsers"
        ]
    },
    // ===== 29. Vector Databases =====
    {
        id: "m29",
        title: "29. Vector Databases",
        subjectId: "GenAI",
        durationWeeks: 0.5,
        topics: [
            "ChromaDB",
            "CRUD operations",
            "Metadata filtering",
            "Distance metrics"
        ]
    },
    // ===== 30. PROJECT: REAL ESTATE =====
    {
        id: "m30",
        title: "30. GenAI Business Project 1: Real Estate Assistant (RAG)",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 1.5,
        topics: [
            "Document loaders",
            "Text splitters",
            "Vector store",
            "Retrieval and answer generation",
            "Streamlit UI"
        ]
    },
    // ===== 31. PROJECT: CHATBOT =====
    {
        id: "m31",
        title: "31. GenAI Business Project 2: E-Commerce Chatbot",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 1.5,
        topics: [
            "FAQ handling",
            "Semantic routing",
            "SQLite integration & SQL query generation",
            "Product Q&A",
            "Web scraping"
        ]
    },
    // ===== 32. AGENTIC AI HANDS-ON =====
    {
        id: "m32",
        title: "32. Agentic AI Hands-on",
        subjectId: "GenAI",
        durationWeeks: 1,
        topics: [
            "Build agents with Llama and Agno",
            "Custom tools",
            "Reasoning agents",
            "Multimodal agents"
        ]
    },
    // ===== 33. AGENTIC AI ARCHITECTURE =====
    {
        id: "m33",
        title: "33. Agentic AI Architecture",
        subjectId: "GenAI",
        durationWeeks: 0.8,
        topics: [
            "MCP protocol",
            "A2A protocol",
            "MCP servers"
        ]
    },
    // ===== 34. MULTI-AGENT SYSTEMS =====
    {
        id: "m34",
        title: "34. Multi-Agent Systems",
        subjectId: "GenAI",
        durationWeeks: 0.8,
        topics: [
            "Multi-agent design patterns",
            "Route agent",
            "CrewAI"
        ]
    },
    // ===== 35. EVALUATION =====
    {
        id: "m35",
        title: "35. Evaluation and Safety",
        subjectId: "GenAI",
        durationWeeks: 0.5,
        topics: [
            "Functional evaluation",
            "Safety and guardrails",
            "Operational metrics"
        ]
    },
    // ===== 36. PROJECT: HRMS =====
    {
        id: "m36",
        title: "36. Agentic AI Business Project 3 (HRMS)",
        subjectId: "Project",
        isProject: true,
        durationWeeks: 2,
        topics: [
            "HR management APIs",
            "Employee onboarding",
            "Email automation",
            "Ticket management"
        ]
    },
    // ===== 37. FINE-TUNING =====
    {
        id: "m37",
        title: "37. Fine-Tuning LLMs",
        subjectId: "GenAI",
        durationWeeks: 1.5,
        topics: [
            "LoRA",
            "Quantization",
            "QLoRA",
            "Fine-tuning LLaMA"
        ]
    },
    // ===== 38. ETHICS =====
    {
        id: "m38",
        title: "38. Ethics in GenAI",
        subjectId: "GenAI",
        durationWeeks: 0.5,
        topics: [
            "Hallucination and misinformation",
            "Bias",
            "Privacy laws",
            "Environmental impact",
            "Copyright"
        ]
    },
    // ===== 39. ENTERPRISE GENAI =====
    {
        id: "m39",
        title: "39. Enterprise GenAI",
        subjectId: "GenAI",
        durationWeeks: 1,
        topics: [
            "Amazon Bedrock AgentCore",
            "Deployment",
            "Memory and observability"
        ]
    },
    // ===== 40. LANGGRAPH =====
    {
        id: "m40",
        title: "40. LangGraph",
        subjectId: "GenAI",
        durationWeeks: 1,
        topics: [
            "Stateful agents",
            "Conditional logic",
            "Agents with memory",
            "Human-in-the-loop"
        ]
    },
    // ===== 41. CREWAI PROJECT =====
    {
        id: "m41",
        title: "41. Autonomous Multi-Agent Systems (CrewAI)",
        subjectId: "GenAI",
        durationWeeks: 1.5,
        topics: [
            "Agent setup",
            "Crew building",
            "Tool integration",
            "Project implementation"
        ]
    },
    // ===== 42. FINAL ASSESSMENT =====
    {
        id: "m42",
        title: "42. Final Assessment and Career Support",
        subjectId: "Career",
        durationWeeks: 1,
        topics: [
            "Final Evaluation: Final quiz",
            "Project evaluation",
            "Interview question bank"
        ]
    },
    // ===== VIRTUAL INTERNSHIPS =====
    {
        id: "m43",
        title: "Virtual Internship 1",
        subjectId: "Career",
        durationWeeks: 2,
        isInternship: true,
        topics: [
            "Project scope and requirements",
            "Data cleaning and transformation",
            "Functional dashboard building"
        ]
    },
    {
        id: "m44",
        title: "Virtual Internship 2",
        subjectId: "Career",
        durationWeeks: 2,
        isInternship: true,
        topics: [
            "Advanced business metrics calculation",
            "Stakeholder presentation",
            "Final project submission"
        ]
    }
];

// Test with EXTREME CV to really test the limits
const testExtremeCV = async () => {
  // Generate an absolutely massive CV (like a CTO with 20+ years)
  let extremeCV = `KONRAD JAKÓBCZAK
Chief Technology Officer & Senior Software Architect
20+ Years Experience | Enterprise Scale | Global Teams

📞 +48 123 456 789 | 📧 konrad@techexecutive.com | 🌐 LinkedIn | 💻 GitHub
🏠 Warszawa, Polska | 🌍 Available for global remote leadership

EXECUTIVE SUMMARY:
Visionary technology executive with 20+ years of progressive experience leading digital transformation initiatives for Fortune 500 companies. Proven track record of scaling engineering organizations from 10 to 500+ engineers while delivering $100M+ revenue-generating platforms. Expert in cloud architecture, AI/ML implementation, and building high-performance distributed systems serving 50M+ users globally. Fluent in 5 programming languages, certified in major cloud platforms, and experienced in managing global teams across 15+ time zones.

`;

  // Add massive experience section
  const jobs = [
    {
      title: "Chief Technology Officer & Co-Founder",
      company: "TechUnicorn Inc.",
      period: "2022-2024",
      description: "Led technology vision for $500M valued fintech unicorn serving 10M+ users across 25 countries. Built engineering organization from 50 to 300+ engineers. Architected microservices platform processing $1B+ in annual transactions."
    },
    {
      title: "VP of Engineering & Cloud Architecture",
      company: "GlobalBank Corp",
      period: "2019-2022", 
      description: "Directed technology strategy for digital banking platform serving 50M+ customers. Led cloud migration of legacy systems (20+ years old) to AWS/Azure multi-cloud architecture. Managed $50M technology budget and 200+ engineer teams."
    },
    {
      title: "Senior Software Architect & Engineering Director",
      company: "E-commerce Giant",
      period: "2016-2019",
      description: "Architected recommendation engine powering $10B+ in annual sales. Led machine learning initiatives improving conversion rates by 45%. Managed platform serving 100M+ daily active users with 99.99% uptime SLA."
    },
    {
      title: "Principal Software Engineer & Tech Lead",
      company: "Enterprise Solutions Corp",
      period: "2013-2016",
      description: "Led development of enterprise CRM platform used by 1000+ companies. Architected multi-tenant SaaS platform supporting 10M+ end users. Implemented advanced security features achieving SOC 2 Type II compliance."
    },
    {
      title: "Senior Full-Stack Developer & Team Lead",
      company: "Consulting Firm Pro",
      period: "2010-2013",
      description: "Delivered 50+ client projects ranging from small business websites to enterprise applications. Led teams of 15+ developers across multiple simultaneous projects. Specialized in custom software development and system integrations."
    },
    {
      title: "Software Developer & Database Specialist", 
      company: "Financial Services Corp",
      period: "2007-2010",
      description: "Developed trading platforms processing millions of transactions daily. Optimized database queries reducing latency from seconds to milliseconds. Implemented real-time risk management systems for high-frequency trading."
    },
    {
      title: "Junior Developer & Systems Administrator",
      company: "Local Software House",
      period: "2004-2007", 
      description: "Started career building desktop applications and managing Linux servers. Learned fundamental programming concepts and system administration. Contributed to open-source projects and built personal programming skills."
    }
  ];

  // Add all jobs with extensive details
  extremeCV += "PROFESSIONAL EXPERIENCE:\n\n";
  jobs.forEach(job => {
    extremeCV += `${job.title} | ${job.company} | ${job.period}\n`;
    extremeCV += `${job.description}\n`;
    
    // Add detailed achievements for each role
    extremeCV += "Key Achievements:\n";
    for(let i = 0; i < 8; i++) {
      extremeCV += `• Achievement ${i+1} for ${job.company} - detailed description of technical accomplishment, metrics, impact on business, technology stack used, team size managed, budget involved, customer impact, performance improvements, security enhancements, etc.\n`;
    }
    extremeCV += "\n";
  });

  // Add massive skills section
  extremeCV += `
TECHNICAL EXPERTISE:

Programming Languages (Expert Level):
• JavaScript/TypeScript - 15+ years, architect level, contributed to TC39 proposals
• Python - 12+ years, expert in Django, FastAPI, data science, ML libraries
• Java - 10+ years, Spring ecosystem, enterprise applications, microservices
• C# - 8+ years, .NET Core, Azure development, enterprise solutions
• Go - 6+ years, cloud-native applications, high-performance systems
• Rust - 4+ years, systems programming, WebAssembly, performance optimization
• PHP - 10+ years, Laravel, Symfony, legacy system maintenance
• Ruby - 6+ years, Rails applications, DevOps scripting
• C++ - 8+ years, systems programming, performance-critical applications
• Scala - 4+ years, big data processing, functional programming

Frontend Technologies (Architect Level):
• React/Redux - 8+ years, architect level, custom hooks, performance optimization
• Vue.js/Nuxt - 6+ years, large-scale applications, SSR/SSG implementations
• Angular - 5+ years, enterprise applications, TypeScript integration
• Svelte/SvelteKit - 3+ years, performance-focused applications
• Web Components - 4+ years, design systems, reusable component libraries
• Micro-frontends - 3+ years, module federation, scalable architectures
• WebAssembly - 2+ years, performance-critical web applications
• Progressive Web Apps - 5+ years, offline-first applications, service workers

Backend & API Technologies:
• Node.js/Express/NestJS - 10+ years, microservices, GraphQL, REST APIs
• Django/FastAPI - 8+ years, Python web applications, API development
• Spring Boot/Spring Cloud - 6+ years, Java microservices, cloud applications
• .NET Core/ASP.NET - 5+ years, enterprise applications, Azure integration
• GraphQL - 4+ years, schema design, performance optimization, federation
• gRPC - 3+ years, high-performance microservices communication
• Event-driven architecture - 5+ years, Apache Kafka, RabbitMQ, AWS EventBridge

Database Technologies (Expert Level):
• PostgreSQL - 12+ years, complex queries, performance tuning, extensions
• MySQL/MariaDB - 10+ years, replication, clustering, optimization
• MongoDB - 8+ years, aggregation pipelines, sharding, replica sets
• Redis - 8+ years, caching strategies, pub/sub, distributed locking
• Elasticsearch - 6+ years, search engines, analytics, log aggregation
• Cassandra - 4+ years, time-series data, high-throughput applications
• InfluxDB - 3+ years, IoT data, monitoring systems, time-series analytics
• Neo4j - 3+ years, graph databases, recommendation engines, social networks

Cloud Platforms & DevOps (Architect Level):
• AWS - 10+ years, Solutions Architect Professional, 50+ services used
• Azure - 6+ years, Certified Architect, enterprise integrations
• Google Cloud - 4+ years, Professional Cloud Architect, ML/AI services
• Docker/Kubernetes - 8+ years, production orchestration, service mesh
• Terraform/CloudFormation - 6+ years, infrastructure as code, multi-cloud
• CI/CD Pipelines - 10+ years, Jenkins, GitHub Actions, GitLab CI, Azure DevOps
• Monitoring - 8+ years, Prometheus, Grafana, DataDog, New Relic, CloudWatch
• Service Mesh - 3+ years, Istio, Linkerd, traffic management, security

`;

  // Add more sections with lots of detail
  extremeCV += `
CERTIFICATIONS & CONTINUOUS LEARNING:

Cloud Certifications:
• AWS Certified Solutions Architect - Professional (2023)
• AWS Certified DevOps Engineer - Professional (2022)
• AWS Certified Security - Specialty (2021)
• Azure Solutions Architect Expert (2023)
• Azure DevOps Engineer Expert (2022)
• Google Cloud Professional Cloud Architect (2022)
• Google Cloud Professional DevOps Engineer (2021)

Programming & Technology:
• Certified Kubernetes Administrator (CKA) (2023)
• Certified Kubernetes Security Specialist (CKS) (2022)
• Docker Certified Associate (2020)
• MongoDB Certified Developer (2019)
• Oracle Certified Professional Java SE (2018)
• Microsoft Certified: Azure Developer Associate (2021)
• Red Hat Certified Engineer (RHCE) (2019)

Management & Leadership:
• Certified Scrum Master (CSM) (2020)
• Project Management Professional (PMP) (2019)
• Certified ScrumMaster Advanced (CSP-SM) (2021)
• SAFe 5 Program Consultant (SPC) (2020)
• ITIL Foundation Certificate (2018)

MAJOR PROJECTS & ACHIEVEMENTS:

1. Global Banking Platform Transformation (2020-2022)
Role: VP Engineering & Chief Architect
Budget: $100M | Team: 200+ engineers | Users: 50M+
Technology Stack: React, Node.js, Java Spring, PostgreSQL, Redis, AWS, Kubernetes
• Led complete digital transformation of traditional banking infrastructure
• Migrated 20-year-old COBOL systems to modern cloud-native architecture
• Implemented microservices serving 50M+ customers across 25 countries
• Achieved 99.99% uptime SLA with disaster recovery across 3 geographic regions
• Reduced operational costs by $20M annually through cloud optimization
• Implemented ML-powered fraud detection reducing losses by 60%
• Built real-time payments processing 10M+ transactions daily
• Established security framework achieving PCI DSS Level 1 compliance
• Results: 40% faster transaction processing, 99.99% uptime, $50M cost savings

2. E-commerce Recommendation Engine (2017-2019)
Role: Senior Software Architect & ML Lead
Budget: $25M | Team: 50+ engineers | Impact: $10B+ sales
Technology Stack: Python, TensorFlow, Apache Spark, Kafka, Redis, AWS
• Architected ML-powered recommendation system for 100M+ users
• Implemented real-time personalization using collaborative filtering and deep learning
• Built distributed training pipeline processing 1TB+ of user behavior data daily
• Designed A/B testing framework for continuous model improvement
• Implemented real-time feature engineering reducing latency to <50ms
• Built automated model deployment pipeline with canary releases
• Established monitoring and alerting for model performance and data drift
• Results: 45% increase in conversion rate, $2B additional revenue annually

3. Fintech Trading Platform (2015-2017)
Role: Principal Engineer & Performance Specialist  
Budget: $15M | Team: 30+ engineers | Throughput: 1M+ trades/day
Technology Stack: Java, C++, PostgreSQL, Redis, FPGA optimization
• Built ultra-low latency trading platform for institutional clients
• Achieved sub-millisecond order execution using custom network optimization
• Implemented risk management system processing market data in real-time
• Built distributed matching engine handling 1M+ orders per day
• Designed fault-tolerant architecture with zero-downtime deployments
• Implemented regulatory compliance for multiple international markets
• Built real-time analytics dashboard for traders and risk managers
• Results: 99.99% uptime, <1ms latency, $500M+ daily trading volume

4. Enterprise CRM Platform (2013-2015)
Role: Tech Lead & Product Architect
Budget: $8M | Team: 25+ engineers | Customers: 1000+ companies
Technology Stack: Angular, Node.js, PostgreSQL, Redis, AWS
• Led development of multi-tenant SaaS CRM serving 10M+ end users
• Implemented advanced customization engine allowing per-tenant configuration
• Built integration platform connecting with 100+ third-party services
• Designed scalable architecture supporting 1000+ concurrent organizations
• Implemented advanced analytics and reporting engine
• Built mobile applications for iOS and Android platforms
• Established security framework achieving SOC 2 Type II certification
• Results: 1000+ enterprise customers, $50M ARR, 99.9% customer satisfaction

EDUCATION & ACADEMIC ACHIEVEMENTS:

Master of Science in Computer Science | MIT | 2002-2004
Specialization: Distributed Systems and Network Algorithms
Thesis: "Optimization of Consensus Algorithms in Large-Scale Distributed Systems"
GPA: 3.9/4.0 | Summa Cum Laude
Research Assistant: Distributed Systems Laboratory (2 years)
Teaching Assistant: Advanced Algorithms Course (2 semesters)

Bachelor of Science in Computer Science | Stanford University | 1998-2002
Specialization: Software Engineering and Database Systems  
Senior Project: "Real-time Collaborative Text Editor with Operational Transformation"
GPA: 3.8/4.0 | Magna Cum Laude
Dean's List: 6 consecutive semesters
President: Computer Science Student Association (2001-2002)

Additional Academic Achievements:
• Published 15+ peer-reviewed papers in top-tier conferences (SIGMOD, VLDB, ICDE)
• Keynote speaker at 25+ international technology conferences
• Guest lecturer at MIT, Stanford, and Carnegie Mellon (5+ years)
• PhD coursework in Machine Learning completed (ABD - All But Dissertation)
• Research collaborations with Google Research, Microsoft Research, IBM Research

PATENTS & INTELLECTUAL PROPERTY:

• Patent US10,123,456: "Method for Optimizing Database Query Performance in Distributed Systems" (2019)
• Patent US10,234,567: "Real-time Fraud Detection Using Machine Learning and Behavioral Analysis" (2020)
• Patent US10,345,678: "Scalable Microservices Architecture for High-Throughput Applications" (2021)
• Patent US10,456,789: "Automated Load Balancing for Container Orchestration Platforms" (2022)
• Patent Pending: "AI-Powered Code Review and Quality Assessment System" (2023)

PUBLICATIONS & RESEARCH:

Conference Papers:
• "Scalable Consensus in Distributed Database Systems" - VLDB 2019 (250+ citations)
• "Machine Learning for Real-time Fraud Detection" - KDD 2020 (180+ citations)  
• "Microservices Performance Optimization Strategies" - ICSE 2021 (120+ citations)
• "Cloud-Native Security Patterns for Enterprise Applications" - Security 2022 (90+ citations)

Journal Articles:
• "Evolution of Distributed Systems Architecture" - ACM Computing Surveys 2020
• "Performance Analysis of Modern Web Applications" - IEEE Computer 2021
• "Security Challenges in Cloud-Native Applications" - Communications of ACM 2022

Books & Technical Writing:
• "Modern Distributed Systems Architecture" - O'Reilly Media (2021) - 50K+ copies sold
• "Cloud-Native Development Patterns" - Manning Publications (2022) - 30K+ copies sold
• Technical blog with 500K+ monthly readers covering advanced software architecture
• Regular contributor to InfoQ, DZone, and IEEE Software Magazine (100+ articles)

LEADERSHIP & TEAM MANAGEMENT:

Team Building & Development:
• Built and led engineering organizations from 10 to 500+ engineers
• Established engineering career ladders and promotion frameworks
• Implemented mentorship programs developing 200+ senior engineers
• Created technical interview processes used by 50+ companies
• Designed engineering onboarding programs reducing time-to-productivity by 60%

Strategic Planning:
• Developed 5-year technology roadmaps for $1B+ companies
• Led digital transformation initiatives affecting 50M+ users
• Established engineering metrics and KPIs improving team performance by 40%
• Created technical standards and best practices adopted across industry
• Built relationships with technology vendors saving $10M+ in licensing costs

Global Team Management:
• Managed distributed teams across 15+ time zones in 25+ countries
• Established remote-first culture and practices before COVID-19
• Built inclusive hiring practices increasing diversity by 300%
• Led cultural integration during 10+ mergers and acquisitions
• Created engineering wiki and knowledge management systems

AWARDS & RECOGNITION:

Industry Awards:
• "CTO of the Year" - TechCrunch (2023)
• "Innovation Leader" - MIT Technology Review (2022)
• "Top 40 Under 40" - Forbes Technology (2015)
• "Distinguished Engineer" - IEEE Computer Society (2020)
• "Excellence in Software Architecture" - Software Engineering Institute (2019)

Company Recognition:
• "Lifetime Achievement Award" - TechUnicorn Inc. (2024)
• "Technical Excellence Award" - GlobalBank Corp (2021)
• "Innovation Award" - E-commerce Giant (2018)
• "Leadership Excellence" - Enterprise Solutions Corp (2015)
• "Top Performer" - 15 consecutive years across multiple companies

Academic Honors:
• "Outstanding Alumni Award" - MIT Computer Science (2020)
• "Distinguished Lecturer" - ACM Distinguished Speaker Program (2019-2024)
• "Young Innovator Award" - MIT Technology Review (2008)
• "Best Student Research Paper" - VLDB Conference (2004)

COMMUNITY INVOLVEMENT & MENTORSHIP:

Open Source Contributions:
• Maintainer of 15+ popular open-source projects (100K+ total stars on GitHub)
• Core contributor to Kubernetes, Docker, and Apache Kafka communities
• Founded 3 successful open-source projects used by Fortune 500 companies
• Regular speaker at Open Source conferences (Linux Foundation, Apache Foundation)

Mentorship & Education:
• Mentored 500+ engineers throughout career across all experience levels
• Guest professor at 10+ universities teaching distributed systems and software architecture
• Created online courses with 100K+ students on advanced software engineering topics
• Founded nonprofit coding bootcamp for underrepresented minorities in tech
• Board member of 3 technology education foundations

Industry Leadership:
• Technical advisory board member for 15+ startups (5 successful exits)
• Judge for 50+ hackathons and programming competitions
• Committee member for ACM SIGMOD, VLDB, and ICDE conferences
• Reviewer for top-tier computer science journals and conferences
• Keynote speaker at 100+ technology conferences across 6 continents

LANGUAGES & INTERNATIONAL EXPERIENCE:

Languages:
• English - Native proficiency (primary working language)
• Polish - Native proficiency (mother tongue)
• German - Fluent (C2 level, 5+ years working in German companies)
• Spanish - Conversational (B2 level, 2 years working in Latin America)
• Mandarin Chinese - Basic (A2 level, currently studying for Asian market expansion)
• Japanese - Basic (A1 level, interested in Japanese technology culture)

International Experience:
• Worked in 15+ countries across 6 continents
• Led global teams with members from 50+ countries
• Established engineering offices in 8 countries
• Managed $500M+ technology budgets across international markets
• Expert in international data privacy regulations (GDPR, CCPA, LGPD, etc.)
• Experience with international tax law for technology companies
• Cultural competency in Asian, European, and American business practices

PERSONAL INTERESTS & HOBBIES:

Technology & Innovation:
• Amateur radio operator (license: SP1ABC) with expertise in digital modes
• Electronics hobbyist building custom IoT devices and embedded systems
• 3D printing and CAD design for rapid prototyping
• Home lab with 50+ servers running various distributed systems experiments
• Contributor to Wikipedia technical articles (1000+ edits)
• Technology podcast host with 500K+ downloads

Physical Activities:
• Marathon runner - completed 25 marathons including Boston, New York, London
• Rock climbing enthusiast - climbed in 15+ countries, certified instructor
• Scuba diving - Advanced Open Water certification, 200+ dives worldwide
• Cycling - completed 10+ century rides and 3 multi-day touring events
• Yoga practitioner - 10+ years, certified instructor (200-hour certification)

Creative Pursuits:
• Photography - specializing in landscape and street photography, exhibited work
• Amateur chef - expertise in 8 international cuisines, catering hobby
• Music - piano player for 20+ years, compose electronic music as hobby
• Writing - published fiction author with 3 novels and 50+ short stories
• Woodworking - custom furniture maker, traditional hand tool techniques

Travel & Culture:
• Visited 75+ countries across all 7 continents including Antarctica
• Digital nomad experience working from 30+ countries
• Cultural anthropology interest - studied traditional crafts in 20+ cultures
• Language learning enthusiast - conversational in 6 languages
• Travel blogger with 100K+ followers documenting technology culture worldwide

PROFESSIONAL REFERENCES:

Executive Level:
• Dr. Sarah Chen, CEO of GlobalTech Innovations - sarah.chen@globaltech.com
• Michael Rodriguez, Former CTO of TechUnicorn Inc - mike@techexecutive.com
• Jennifer Smith, VP Engineering at MegaCorp - jennifer.smith@megacorp.com
• David Kim, Principal Engineer at Google Cloud - david.kim@google.com

Academic References:
• Prof. Robert Johnson, MIT Computer Science Department - rjohnson@mit.edu
• Dr. Lisa Wong, Stanford Distributed Systems Lab - lwong@stanford.edu
• Prof. Ahmed Hassan, Carnegie Mellon Software Engineering - ahassan@cmu.edu

Industry Leaders:
• James Wilson, Founder of CloudScale Systems - james@cloudscale.com
• Maria Gonzalez, CTO of SecureBank International - maria@securebank.com
• Dr. Thomas Mueller, Research Director at IBM Research - tmueller@ibm.com

Portfolio: https://konradjakobczak.tech
LinkedIn: https://linkedin.com/in/konradjakobczak-cto
GitHub: https://github.com/konradjakobczak
Blog: https://techleadership.blog
Podcast: https://distributedcoffee.podcast

Complete portfolio with detailed project case studies, code samples, architecture diagrams, and video presentations available upon request. Security clearance and detailed background check documentation available for qualified opportunities.`;

  console.log(`📝 Testing with EXTREME CV: ${extremeCV.length} characters`);
  console.log(`📊 Expected token count: ~${Math.round(extremeCV.length / 4)} tokens`);
  
  try {
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentCV: extremeCV,
        email: 'test@premium.com',
        paid: true,
        jobPosting: 'Chief Technology Officer - We seek a visionary technology leader with 20+ years of experience leading large engineering organizations, cloud architecture expertise, and proven track record of scaling systems to serve 50M+ users.'
      })
    });

    const data = await response.json();
    
    console.log('\n📊 EXTREME CV TEST RESULTS:');
    console.log('=============================');
    console.log(`✅ Success: ${data.success}`);
    if (data.success) {
      console.log(`📝 Original CV: ${extremeCV.length} characters`);
      console.log(`🤖 Optimized CV: ${data.optimizedCV?.length || 0} characters`);
      console.log(`📈 Length ratio: ${data.optimizedCV ? (data.optimizedCV.length / extremeCV.length * 100).toFixed(1) : 0}%`);
      
      // Check if key final sections exist
      const finalSections = [
        'Portfolio',
        'GitHub',  
        'LinkedIn',
        'references',
        'available upon request',
        'konradjakobczak'
      ];
      
      console.log('\n🔍 FINAL SECTIONS CHECK:');
      finalSections.forEach(section => {
        const found = data.optimizedCV?.toLowerCase().includes(section.toLowerCase());
        console.log(`${found ? '✅' : '❌'} ${section}`);
      });
      
      // Check the ending
      const lastChars = data.optimizedCV?.slice(-300) || '';
      console.log('\n🏁 ACTUAL ENDING (last 300 chars):');
      console.log(`"${lastChars}"`);
      
      const seemsTruncated = !lastChars.includes('Portfolio') && 
                            !lastChars.includes('konradjakobczak') &&
                            !lastChars.includes('</') &&
                            data.optimizedCV?.length < extremeCV.length * 0.3;
      
      console.log(`\n${seemsTruncated ? '🔴 TRUNCATION DETECTED - NEED CHUNKING!' : '✅ APPEARS COMPLETE'}`);
      
    } else {
      console.log(`❌ ERROR: ${data.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testExtremeCV();
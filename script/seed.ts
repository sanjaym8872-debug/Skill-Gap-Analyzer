import "dotenv/config";
import { db } from "../server/db";
import { skills, jobRoles, jobRoleSkills } from "../shared/schema";
import { eq, and } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ===============================
  // 25+ INDUSTRY ROLES
  // ===============================
  const rolesData = [
    {
      name: "Frontend Developer",
      skills: [
        "HTML","CSS","JavaScript","TypeScript",
        "React","Angular","Vue","Next.js",
        "Redux","Tailwind","Bootstrap",
        "Responsive Design","Accessibility",
        "Web Performance","Git"
      ],
    },
    {
      name: "Backend Developer",
      skills: [
        "Node.js","Java","Python","Go","C#",
        "Express","Spring Boot","Django","FastAPI",
        "REST APIs","GraphQL","Microservices",
        "Database Design","Authentication",
        "Authorization","JWT","Redis","Testing"
      ],
    },
    {
      name: "Full Stack Developer",
      skills: [
        "React","Node.js","Next.js",
        "API Design","Docker","CI/CD",
        "System Design","Database Handling"
      ],
    },
    {
      name: "Mobile App Developer",
      skills: [
        "Android (Kotlin)","Android (Java)",
        "iOS (Swift)","Flutter","React Native",
        "Push Notifications","Offline Storage",
        "App Performance","Store Deployment"
      ],
    },
    {
      name: "Cloud Engineer",
      skills: [
        "AWS","Azure","GCP",
        "EC2","S3","VPC","IAM",
        "Terraform","CloudFormation",
        "Load Balancing","Monitoring"
      ],
    },
    {
      name: "DevOps Engineer",
      skills: [
        "CI/CD","Docker","Kubernetes",
        "Helm","Jenkins","GitHub Actions",
        "Linux","Shell Scripting",
        "Prometheus","Grafana"
      ],
    },
    {
      name: "Site Reliability Engineer",
      skills: [
        "Reliability Patterns",
        "Incident Response",
        "Monitoring & Alerting",
        "Kubernetes",
        "Performance Tuning",
        "Automation Scripting"
      ],
    },
    {
      name: "Data Analyst",
      skills: [
        "Excel","SQL","Python","R",
        "Pandas","NumPy",
        "Power BI","Tableau",
        "Statistics","Dashboarding"
      ],
    },
    {
      name: "Data Scientist",
      skills: [
        "Python","Machine Learning",
        "Statistics","Feature Engineering",
        "Data Cleaning","Model Evaluation",
        "Scikit-learn","Visualization"
      ],
    },
    {
      name: "Machine Learning Engineer",
      skills: [
        "TensorFlow","PyTorch",
        "MLOps","Model Deployment",
        "Docker","Kubernetes",
        "ML Pipelines","API Integration"
      ],
    },
    {
      name: "AI Engineer",
      skills: [
        "Deep Learning","NLP",
        "Computer Vision","LLMs",
        "Prompt Engineering",
        "Fine Tuning","Vector Databases",
        "LangChain"
      ],
    },
    {
      name: "Cyber Security Analyst",
      skills: [
        "Network Security","Threat Analysis",
        "SIEM Tools","Vulnerability Scanning",
        "Incident Handling","Risk Assessment"
      ],
    },
    {
      name: "Ethical Hacker",
      skills: [
        "Penetration Testing","OWASP Top 10",
        "Kali Linux","Metasploit",
        "Burp Suite","Exploit Development"
      ],
    },
    {
      name: "Cloud Security Engineer",
      skills: [
        "IAM Policies","Encryption",
        "Compliance","Container Security",
        "Zero Trust"
      ],
    },
    {
      name: "Database Administrator",
      skills: [
        "MySQL","PostgreSQL","MongoDB",
        "Oracle","Backup & Recovery",
        "Indexing","Replication",
        "Query Optimization"
      ],
    },
    {
      name: "Data Engineer",
      skills: [
        "ETL Pipelines","Spark","Hadoop",
        "Airflow","Snowflake",
        "Big Data Tools","SQL","Python"
      ],
    },
    {
      name: "UI UX Designer",
      skills: [
        "Figma","Adobe XD",
        "Wireframing","Prototyping",
        "User Research","Design Systems"
      ],
    },
    {
      name: "Product Manager",
      skills: [
        "Requirement Gathering",
        "Roadmapping","Agile","Scrum",
        "Stakeholder Communication",
        "Analytics","A/B Testing"
      ],
    },
    {
      name: "QA Engineer",
      skills: [
        "Manual Testing","Test Case Design",
        "Selenium","Cypress",
        "API Testing","Bug Tracking"
      ],
    },
    {
      name: "Automation Test Engineer",
      skills: [
        "Automation Frameworks",
        "Performance Testing",
        "CI Integration","Load Testing"
      ],
    },
    {
      name: "Blockchain Developer",
      skills: [
        "Solidity","Rust",
        "Smart Contracts","Web3",
        "Ethereum","DApp Development"
      ],
    },
    {
      name: "AR VR Developer",
      skills: [
        "Unity","Unreal Engine",
        "C#","C++",
        "3D Math","XR SDKs"
      ],
    },
    {
      name: "Game Developer",
      skills: [
        "Unity","Unreal",
        "Physics Engines",
        "Game Design Patterns",
        "C#","C++"
      ],
    },
    {
      name: "System Administrator",
      skills: [
        "Linux Server","Windows Server",
        "Networking","Shell Scripting",
        "Virtualization","Server Maintenance"
      ],
    },
    {
      name: "Network Engineer",
      skills: [
        "Routing & Switching",
        "Firewalls","TCP/IP",
        "Cisco Devices",
        "Network Monitoring"
      ],
    },
  ];

  // ===============================
  // INSERT LOGIC (SAFE / IDEMPOTENT)
  // ===============================
  for (const role of rolesData) {
    let existingRole = await db
      .select()
      .from(jobRoles)
      .where(eq(jobRoles.title, role.name))
      .limit(1);

    let roleId;

    if (existingRole.length === 0) {
      const inserted = await db.insert(jobRoles).values({ title: role.name, description: "" }).returning();
      roleId = inserted[0].id;
    } else {
      roleId = existingRole[0].id;
    }

    for (const skillName of role.skills) {
      let existingSkill = await db
        .select()
        .from(skills)
        .where(eq(skills.name, skillName))
        .limit(1);

      let skillId;

      if (existingSkill.length === 0) {
        const insertedSkill = await db
          .insert(skills)
          .values({ name: skillName, category: "Technical" })
          .returning();

        skillId = insertedSkill[0].id;
      } else {
        skillId = existingSkill[0].id;
      }

      const existingMapping = await db
        .select()
        .from(jobRoleSkills)
        .where(
          and(
            eq(jobRoleSkills.jobRoleId, roleId),
            eq(jobRoleSkills.skillId, skillId)
          )
        )
        .limit(1);

      if (existingMapping.length === 0) {
        await db.insert(jobRoleSkills).values({
          jobRoleId: roleId,
          skillId,
          requiredProficiency: "Intermediate",
        });
      }
    }
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});

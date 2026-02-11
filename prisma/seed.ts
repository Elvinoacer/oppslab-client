// =============================================================================
// Database Seed Script for Prisma 7
// Run with: npx prisma db seed
// =============================================================================

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Define seed data types
const INITIAL_TAGS = [
  // Skills
  { name: "JavaScript", slug: "javascript", category: "SKILL" as const, color: "#F7DF1E" },
  { name: "TypeScript", slug: "typescript", category: "SKILL" as const, color: "#3178C6" },
  { name: "Python", slug: "python", category: "SKILL" as const, color: "#3776AB" },
  { name: "React", slug: "react", category: "SKILL" as const, color: "#61DAFB" },
  { name: "Next.js", slug: "nextjs", category: "SKILL" as const, color: "#000000" },
  { name: "Node.js", slug: "nodejs", category: "SKILL" as const, color: "#339933" },
  { name: "SQL", slug: "sql", category: "SKILL" as const, color: "#336791" },
  { name: "AWS", slug: "aws", category: "SKILL" as const, color: "#FF9900" },
  { name: "Docker", slug: "docker", category: "SKILL" as const, color: "#2496ED" },
  { name: "Kubernetes", slug: "kubernetes", category: "SKILL" as const, color: "#326CE5" },
  { name: "Machine Learning", slug: "machine-learning", category: "SKILL" as const, color: "#FF6F61" },
  { name: "Data Science", slug: "data-science", category: "SKILL" as const, color: "#4CAF50" },
  { name: "UI/UX Design", slug: "ui-ux-design", category: "SKILL" as const, color: "#9C27B0" },
  { name: "GraphQL", slug: "graphql", category: "SKILL" as const, color: "#E10098" },
  { name: "REST API", slug: "rest-api", category: "SKILL" as const, color: "#009688" },

  // Technologies
  { name: "PostgreSQL", slug: "postgresql", category: "TECHNOLOGY" as const, color: "#336791" },
  { name: "MongoDB", slug: "mongodb", category: "TECHNOLOGY" as const, color: "#47A248" },
  { name: "Redis", slug: "redis", category: "TECHNOLOGY" as const, color: "#DC382D" },
  { name: "TensorFlow", slug: "tensorflow", category: "TECHNOLOGY" as const, color: "#FF6F00" },
  { name: "PyTorch", slug: "pytorch", category: "TECHNOLOGY" as const, color: "#EE4C2C" },

  // Benefits
  { name: "Remote Work", slug: "remote-work", category: "BENEFIT" as const, color: "#2196F3" },
  { name: "Flexible Hours", slug: "flexible-hours", category: "BENEFIT" as const, color: "#673AB7" },
  { name: "Health Insurance", slug: "health-insurance", category: "BENEFIT" as const, color: "#E91E63" },
  { name: "Stock Options", slug: "stock-options", category: "BENEFIT" as const, color: "#4CAF50" },
  { name: "Relocation Assistance", slug: "relocation-assistance", category: "BENEFIT" as const, color: "#FF5722" },

  // Programs
  { name: "Summer Program", slug: "summer-program", category: "PROGRAM" as const, color: "#FFEB3B" },
  { name: "Rotational Program", slug: "rotational-program", category: "PROGRAM" as const, color: "#00BCD4" },
  { name: "New Grad", slug: "new-grad", category: "PROGRAM" as const, color: "#8BC34A" },
  { name: "PhD", slug: "phd", category: "PROGRAM" as const, color: "#795548" },
];

const INITIAL_CATEGORIES = [
  { name: "Scholarships", slug: "SCHOLARSHIP", level: 0, sortOrder: 1, icon: "🎓", description: "Financial aid for students pursuing education at various levels" },
  { name: "Grants", slug: "GRANT", level: 0, sortOrder: 2, icon: "💰", description: "Funding for research, projects, and creative endeavors" },
  { name: "Fellowships", slug: "FELLOWSHIP", level: 0, sortOrder: 3, icon: "🏆", description: "Prestigious programs for advanced study and professional development" },
  { name: "Internships", slug: "INTERNSHIP", level: 0, sortOrder: 4, icon: "💼", description: "Work experience opportunities for students and early career professionals" },
  { name: "Jobs", slug: "JOB", level: 0, sortOrder: 5, icon: "👔", description: "Full-time and part-time employment opportunities" },
  { name: "Competitions", slug: "COMPETITION", level: 0, sortOrder: 6, icon: "🏅", description: "Contests, hackathons, and challenges with prizes" },
  { name: "Conferences", slug: "CONFERENCE", level: 0, sortOrder: 7, icon: "🎤", description: "Industry events, summits, and networking opportunities" },
  { name: "Workshops", slug: "WORKSHOP", level: 0, sortOrder: 8, icon: "🛠️", description: "Hands-on training sessions and skill-building programs" },
  { name: "Courses", slug: "COURSE", level: 0, sortOrder: 9, icon: "📚", description: "Online and offline educational programs" },
  { name: "Accelerators", slug: "ACCELERATOR", level: 0, sortOrder: 10, icon: "🚀", description: "Programs to accelerate startups and entrepreneurial ventures" },
  { name: "Funding", slug: "FUNDING", level: 0, sortOrder: 11, icon: "💵", description: "Investment and funding opportunities for businesses" },
  { name: "Mentorship", slug: "MENTORSHIP", level: 0, sortOrder: 12, icon: "🤝", description: "Guidance and mentoring programs from industry experts" },
  { name: "Hackathons", slug: "HACKATHON", level: 0, sortOrder: 13, icon: "💻", description: "Intensive collaboration events for software development" },
  { name: "Incubators", slug: "INCUBATOR", level: 0, sortOrder: 14, icon: "🐣", description: "Support programs for early-stage startups" },
  { name: "Volunteering", slug: "VOLUNTEERING", level: 0, sortOrder: 15, icon: "❤️", description: "Opportunities to contribute to social causes" },
  { name: "Seminars", slug: "SEMINAR", level: 0, sortOrder: 16, icon: "🏛️", description: "Academic or professional meetings on specific topics" },
  { name: "Bootcamps", slug: "BOOTCAMP", level: 0, sortOrder: 17, icon: "🥾", description: "Short-term intensive training programs" },
  { name: "Research Projects", slug: "RESEARCH", level: 0, sortOrder: 18, icon: "🔬", description: "Systematic investigation and study of specific areas" },
  { name: "Creative Contests", slug: "CREATIVE", level: 0, sortOrder: 19, icon: "🎨", description: "Competitions for arts, design, and writing" },
  { name: "Networking Events", slug: "NETWORKING", level: 0, sortOrder: 20, icon: "📱", description: "Events focused on building professional connections" },
  { name: "Certifications", slug: "CERTIFICATION", level: 0, sortOrder: 21, icon: "📜", description: "Professional certification and credential programs" },
  { name: "Study Abroad", slug: "STUDY_ABROAD", level: 0, sortOrder: 22, icon: "🌎", description: "International education and exchange programs" },
];

const TECH_SUBCATEGORIES = [
  // Technology subcategories (level 1)
  { name: "Software Engineering", slug: "software-engineering", level: 1, sortOrder: 1 },
  { name: "Data Science", slug: "data-science-cat", level: 1, sortOrder: 2 },
  { name: "Product Management", slug: "product-management", level: 1, sortOrder: 3 },
  { name: "DevOps & Infrastructure", slug: "devops-infrastructure", level: 1, sortOrder: 4 },
  { name: "Security", slug: "security", level: 1, sortOrder: 5 },
];

const SOFTWARE_SUBCATEGORIES = [
  // Software Engineering subcategories (level 2)
  { name: "Backend", slug: "backend", level: 2, sortOrder: 1 },
  { name: "Frontend", slug: "frontend", level: 2, sortOrder: 2 },
  { name: "Full Stack", slug: "full-stack", level: 2, sortOrder: 3 },
  { name: "Mobile", slug: "mobile", level: 2, sortOrder: 4 },
  { name: "Embedded Systems", slug: "embedded-systems", level: 2, sortOrder: 5 },
];

async function main() {
  // Create connection pool and adapter per Prisma 7 requirements
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🌱 Starting database seed...\n");

    // Seed Tags
    console.log("📌 Seeding tags...");
    for (const tag of INITIAL_TAGS) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: tag,
      });
    }
    console.log(`   ✓ Created ${INITIAL_TAGS.length} tags\n`);

    for (const category of INITIAL_CATEGORIES) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      });
    }
    console.log(`   ✓ Created ${INITIAL_CATEGORIES.length} root categories\n`);

    // Seed Admin User
    console.log("\n👤 Seeding admin user...");
    await prisma.user.upsert({
      where: { email: "admin@opportunities.app" },
      update: {},
      create: {
        email: "admin@opportunities.app",
        name: "System Admin",
        role: "ADMIN",
      },
    });
    console.log("   ✓ Created admin user\n");

    // Initialize platform stats for today
    console.log("📊 Initializing platform stats...");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.platformStats.upsert({
      where: { date: today },
      update: {},
      create: {
        date: today,
      },
    });
    console.log("   ✓ Initialized today's stats\n");

    console.log("✅ Database successfully seeded!");
    console.log("\n📋 Summary:");
    console.log(`   • ${INITIAL_TAGS.length} tags`);
    console.log(`   • ${INITIAL_CATEGORIES.length + TECH_SUBCATEGORIES.length + SOFTWARE_SUBCATEGORIES.length} categories`);
    console.log(`   • 1 admin user`);
    console.log(`   • 1 platform stats record`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

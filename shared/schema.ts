import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums for proficiency levels
export const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // Technical, Soft, etc.
});

export const jobRoles = pgTable("job_roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
});

export const jobRoleSkills = pgTable("job_role_skills", {
  id: serial("id").primaryKey(),
  jobRoleId: integer("job_role_id").notNull(),
  skillId: integer("skill_id").notNull(),
  requiredProficiency: text("required_proficiency").notNull(), // Beginner, Intermediate, Advanced
});

export const userSkills = pgTable("user_skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  skillId: integer("skill_id").notNull(),
  proficiency: text("proficiency").notNull(), // Beginner, Intermediate, Advanced
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  jobRoleId: integer("job_role_id").notNull(),
  results: jsonb("results").notNull(), // Stores the snapshot of the analysis
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  userSkills: many(userSkills),
  analyses: many(analyses),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  jobRoleSkills: many(jobRoleSkills),
  userSkills: many(userSkills),
}));

export const jobRolesRelations = relations(jobRoles, ({ many }) => ({
  jobRoleSkills: many(jobRoleSkills),
}));

export const jobRoleSkillsRelations = relations(jobRoleSkills, ({ one }) => ({
  jobRole: one(jobRoles, {
    fields: [jobRoleSkills.jobRoleId],
    references: [jobRoles.id],
  }),
  skill: one(skills, {
    fields: [jobRoleSkills.skillId],
    references: [skills.id],
  }),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const analysesRelations = relations(analyses, ({ one }) => ({
  user: one(users, {
    fields: [analyses.userId],
    references: [users.id],
  }),
  jobRole: one(jobRoles, {
    fields: [analyses.jobRoleId],
    references: [jobRoles.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertJobRoleSchema = createInsertSchema(jobRoles).omit({ id: true });
export const insertJobRoleSkillSchema = createInsertSchema(jobRoleSkills).omit({ id: true });
export const insertUserSkillSchema = createInsertSchema(userSkills).omit({ id: true });
export const insertAnalysisSchema = createInsertSchema(analyses).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type JobRole = typeof jobRoles.$inferSelect;
export type JobRoleSkill = typeof jobRoleSkills.$inferSelect;
export type UserSkill = typeof userSkills.$inferSelect;
export type Analysis = typeof analyses.$inferSelect;

// Derived types for frontend display
export type JobRoleWithSkills = JobRole & {
  skills: (JobRoleSkill & { skill: Skill })[];
};

export type UserSkillWithDetails = UserSkill & {
  skill: Skill;
};

// Request types
export type RegisterUserRequest = z.infer<typeof insertUserSchema>;
export type LoginUserRequest = Pick<z.infer<typeof insertUserSchema>, "username" | "password">;
export type UpdateUserRequest = Partial<Omit<RegisterUserRequest, "password" | "username">>;

export type AddUserSkillRequest = Omit<z.infer<typeof insertUserSkillSchema>, "userId">;
export type UpdateUserSkillRequest = Partial<AddUserSkillRequest>;

export type CreateAnalysisRequest = {
  jobRoleId: number;
};

// Analysis Result Type
export type SkillGapResult = {
  missingSkills: { skill: Skill; requiredProficiency: string }[];
  weakSkills: { skill: Skill; currentProficiency: string; requiredProficiency: string }[];
  strongSkills: { skill: Skill; currentProficiency: string; requiredProficiency: string }[];
  roadmap: { step: number; title: string; description: string }[];
  jobRoleTitle: string;
};

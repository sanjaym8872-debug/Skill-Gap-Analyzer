import { db } from "./db";
import {
  users, skills, jobRoles, jobRoleSkills, userSkills, analyses,
  type User, type InsertUser,
  type Skill, type JobRole, type JobRoleSkill,
  type UserSkill, type Analysis,
  type JobRoleWithSkills
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Skills
  getSkills(): Promise<Skill[]>;
  getSkill(id: number): Promise<Skill | undefined>;
  
  // Job Roles
  getJobRoles(): Promise<JobRoleWithSkills[]>;
  getJobRole(id: number): Promise<JobRoleWithSkills | undefined>;
  
  // User Skills
  getUserSkills(userId: number): Promise<(UserSkill & { skill: Skill })[]>;
  addUserSkill(userId: number, skillId: number, proficiency: string): Promise<UserSkill>;
  removeUserSkill(id: number): Promise<void>;
  
  // Analyses
  createAnalysis(analysis: any): Promise<Analysis>;
  getAnalyses(userId: number): Promise<(Analysis & { jobRole: JobRole })[]>;
  getAnalysis(id: number): Promise<(Analysis & { jobRole: JobRole }) | undefined>;
  
  // Seeding/Helpers
  createSkill(skill: any): Promise<Skill>;
  createJobRole(role: any): Promise<JobRole>;
  addJobRoleSkill(jobRoleId: number, skillId: number, proficiency: string): Promise<JobRoleSkill>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor(sessionStore?: any) {
    this.sessionStore = sessionStore;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }
  
  async getSkill(id: number): Promise<Skill | undefined> {
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));
    return skill;
  }

  // Job Roles
  async getJobRoles(): Promise<JobRoleWithSkills[]> {
    const roles = await db.select().from(jobRoles);
    const rolesWithSkills = await Promise.all(roles.map(async (role) => {
      const roleSkills = await db.select().from(jobRoleSkills)
        .where(eq(jobRoleSkills.jobRoleId, role.id))
        .innerJoin(skills, eq(jobRoleSkills.skillId, skills.id));
      
      return {
        ...role,
        skills: roleSkills.map(rs => ({
          ...rs.job_role_skills,
          skill: rs.skills
        }))
      };
    }));
    return rolesWithSkills;
  }

  async getJobRole(id: number): Promise<JobRoleWithSkills | undefined> {
    const [role] = await db.select().from(jobRoles).where(eq(jobRoles.id, id));
    if (!role) return undefined;

    const roleSkills = await db.select().from(jobRoleSkills)
      .where(eq(jobRoleSkills.jobRoleId, role.id))
      .innerJoin(skills, eq(jobRoleSkills.skillId, skills.id));

    return {
      ...role,
      skills: roleSkills.map(rs => ({
        ...rs.job_role_skills,
        skill: rs.skills
      }))
    };
  }

  // User Skills
  async getUserSkills(userId: number): Promise<(UserSkill & { skill: Skill })[]> {
    const results = await db.select().from(userSkills)
      .where(eq(userSkills.userId, userId))
      .innerJoin(skills, eq(userSkills.skillId, skills.id));
      
    return results.map(r => ({
      ...r.user_skills,
      skill: r.skills
    }));
  }

  async addUserSkill(userId: number, skillId: number, proficiency: string): Promise<UserSkill> {
    const [skill] = await db.insert(userSkills)
      .values({ userId, skillId, proficiency })
      .returning();
    return skill;
  }

  async removeUserSkill(id: number): Promise<void> {
    await db.delete(userSkills).where(eq(userSkills.id, id));
  }

  // Analyses
  async createAnalysis(analysis: any): Promise<Analysis> {
    const [result] = await db.insert(analyses).values(analysis).returning();
    return result;
  }

  async getAnalyses(userId: number): Promise<(Analysis & { jobRole: JobRole })[]> {
    const results = await db.select().from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt))
      .innerJoin(jobRoles, eq(analyses.jobRoleId, jobRoles.id));
      
    return results.map(r => ({
      ...r.analyses,
      jobRole: r.job_roles
    }));
  }

  async getAnalysis(id: number): Promise<(Analysis & { jobRole: JobRole }) | undefined> {
    const [result] = await db.select().from(analyses)
      .where(eq(analyses.id, id))
      .innerJoin(jobRoles, eq(analyses.jobRoleId, jobRoles.id));
      
    if (!result) return undefined;
    
    return {
      ...result.analyses,
      jobRole: result.job_roles
    };
  }

  // Helpers
  async createSkill(insertSkill: any): Promise<Skill> {
    const [skill] = await db.insert(skills).values(insertSkill).returning();
    return skill;
  }

  async createJobRole(insertRole: any): Promise<JobRole> {
    const [role] = await db.insert(jobRoles).values(insertRole).returning();
    return role;
  }

  async addJobRoleSkill(jobRoleId: number, skillId: number, proficiency: string): Promise<JobRoleSkill> {
    const [jrs] = await db.insert(jobRoleSkills)
      .values({ jobRoleId, skillId, requiredProficiency: proficiency })
      .returning();
    return jrs;
  }
}

export const storage = new DatabaseStorage();

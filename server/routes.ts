import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Set up session store
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000,
  });

  // Initialize storage with session store
  storage.sessionStore = sessionStore;

  // Auth setup
  setupAuth(app);

  // Helper to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // === API ROUTES ===

  // Skills
  app.get(api.skills.list.path, async (req, res) => {
    const skills = await storage.getSkills();
    res.json(skills);
  });

  // Job Roles
  app.get(api.jobRoles.list.path, async (req, res) => {
    const roles = await storage.getJobRoles();
    res.json(roles);
  });

  app.get(api.jobRoles.get.path, async (req, res) => {
    const role = await storage.getJobRole(Number(req.params.id));
    if (!role) {
      return res.status(404).json({ message: "Job role not found" });
    }
    res.json(role);
  });

  // User Skills
  app.get(api.userSkills.list.path, requireAuth, async (req, res) => {
    const skills = await storage.getUserSkills(req.user!.id);
    res.json(skills);
  });

  app.post(api.userSkills.add.path, requireAuth, async (req, res) => {
    try {
      const input = api.userSkills.add.input.parse(req.body);
      const skill = await storage.addUserSkill(req.user!.id, input.skillId, input.proficiency);
      res.status(201).json(skill);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.userSkills.delete.path, requireAuth, async (req, res) => {
    await storage.removeUserSkill(Number(req.params.id));
    res.sendStatus(200);
  });

  // Analyses
  app.post(api.analyses.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.analyses.create.input.parse(req.body);
      const jobRole = await storage.getJobRole(input.jobRoleId);
      
      if (!jobRole) {
        return res.status(404).json({ message: "Job role not found" });
      }

      const userSkills = await storage.getUserSkills(req.user!.id);
      
      // Perform Analysis
      const missingSkills = [];
      const weakSkills = [];
      const strongSkills = [];
      const roadmap = [];

      const proficiencyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };

      for (const reqSkill of jobRole.skills) {
        const userSkill = userSkills.find(us => us.skillId === reqSkill.skillId);
        
        if (!userSkill) {
          missingSkills.push({
            skill: reqSkill.skill,
            requiredProficiency: reqSkill.requiredProficiency
          });
          roadmap.push({
            step: roadmap.length + 1,
            title: `Learn ${reqSkill.skill.name}`,
            description: `Start learning ${reqSkill.skill.name} fundamentals. Aim for ${reqSkill.requiredProficiency} level.`
          });
        } else {
          const userLevel = proficiencyOrder[userSkill.proficiency as keyof typeof proficiencyOrder];
          const reqLevel = proficiencyOrder[reqSkill.requiredProficiency as keyof typeof proficiencyOrder];
          
          if (userLevel < reqLevel) {
            weakSkills.push({
              skill: reqSkill.skill,
              currentProficiency: userSkill.proficiency,
              requiredProficiency: reqSkill.requiredProficiency
            });
            roadmap.push({
              step: roadmap.length + 1,
              title: `Improve ${reqSkill.skill.name}`,
              description: `Level up your ${reqSkill.skill.name} skills from ${userSkill.proficiency} to ${reqSkill.requiredProficiency}.`
            });
          } else {
            strongSkills.push({
              skill: reqSkill.skill,
              currentProficiency: userSkill.proficiency,
              requiredProficiency: reqSkill.requiredProficiency
            });
          }
        }
      }

      const results = {
        jobRoleTitle: jobRole.title,
        missingSkills,
        weakSkills,
        strongSkills,
        roadmap
      };

      const analysis = await storage.createAnalysis({
        userId: req.user!.id,
        jobRoleId: input.jobRoleId,
        results
      });

      res.status(201).json(analysis);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.analyses.list.path, requireAuth, async (req, res) => {
    const analyses = await storage.getAnalyses(req.user!.id);
    res.json(analyses);
  });

  app.get(api.analyses.get.path, requireAuth, async (req, res) => {
    const analysis = await storage.getAnalysis(Number(req.params.id));
    if (!analysis) return res.status(404).json({ message: "Analysis not found" });
    if (analysis.userId !== req.user!.id) return res.status(401).json({ message: "Unauthorized" });
    res.json(analysis);
  });

  // Seed Data Endpoint (for internal use/demo)
  // Check if skills exist, if not seed
  const existingSkills = await storage.getSkills();
  if (existingSkills.length === 0) {
    console.log("Seeding database...");
    
    // Skills
    const sReact = await storage.createSkill({ name: "React", category: "Frontend" });
    const sNode = await storage.createSkill({ name: "Node.js", category: "Backend" });
    const sSQL = await storage.createSkill({ name: "SQL", category: "Database" });
    const sPython = await storage.createSkill({ name: "Python", category: "Backend" });
    const sTS = await storage.createSkill({ name: "TypeScript", category: "Language" });
    
    // Job Roles
    const rFrontend = await storage.createJobRole({ 
      title: "Frontend Developer", 
      description: "Builds user interfaces using React and modern CSS."
    });
    
    const rFullstack = await storage.createJobRole({ 
      title: "Fullstack Developer", 
      description: "Handles both frontend and backend development."
    });

    // Mappings
    await storage.addJobRoleSkill(rFrontend.id, sReact.id, "Advanced");
    await storage.addJobRoleSkill(rFrontend.id, sTS.id, "Intermediate");
    
    await storage.addJobRoleSkill(rFullstack.id, sReact.id, "Intermediate");
    await storage.addJobRoleSkill(rFullstack.id, sNode.id, "Intermediate");
    await storage.addJobRoleSkill(rFullstack.id, sSQL.id, "Intermediate");
    
    console.log("Seeding complete!");
  }

  return httpServer;
}

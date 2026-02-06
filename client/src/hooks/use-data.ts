import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  api, 
  buildUrl,
  type AddUserSkillRequest, 
  type CreateAnalysisRequest,
  type SkillGapResult 
} from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// === SKILLS ===
export function useSkills() {
  return useQuery({
    queryKey: [api.skills.list.path],
    queryFn: async () => {
      const res = await fetch(api.skills.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch skills");
      return api.skills.list.responses[200].parse(await res.json());
    },
  });
}

// === JOB ROLES ===
export function useJobRoles() {
  return useQuery({
    queryKey: [api.jobRoles.list.path],
    queryFn: async () => {
      const res = await fetch(api.jobRoles.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch job roles");
      return api.jobRoles.list.responses[200].parse(await res.json());
    },
  });
}

export function useJobRole(id: number) {
  return useQuery({
    queryKey: [api.jobRoles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.jobRoles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch job role");
      return api.jobRoles.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// === USER SKILLS ===
export function useUserSkills() {
  return useQuery({
    queryKey: [api.userSkills.list.path],
    queryFn: async () => {
      const res = await fetch(api.userSkills.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user skills");
      return api.userSkills.list.responses[200].parse(await res.json());
    },
  });
}

export function useAddUserSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AddUserSkillRequest) => {
      const res = await fetch(api.userSkills.add.path, {
        method: api.userSkills.add.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if(res.status === 400) {
           const err = api.userSkills.add.responses[400].parse(await res.json());
           throw new Error(err.message);
        }
        throw new Error("Failed to add skill");
      }
      return api.userSkills.add.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userSkills.list.path] });
      toast({ title: "Skill Added", description: "Your profile has been updated." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteUserSkill() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.userSkills.delete.path, { id });
      const res = await fetch(url, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete skill");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.userSkills.list.path] });
      toast({ title: "Skill Removed", description: "Your profile has been updated." });
    },
  });
}

// === ANALYSES ===
export function useAnalyses() {
  return useQuery({
    queryKey: [api.analyses.list.path],
    queryFn: async () => {
      const res = await fetch(api.analyses.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analyses");
      return api.analyses.list.responses[200].parse(await res.json());
    },
  });
}

export function useAnalysis(id: number) {
  return useQuery({
    queryKey: [api.analyses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.analyses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analysis");
      
      const raw = await res.json();
      // We need to ensure the result structure is parsed correctly if it comes as a string in some DB adapters, 
      // but Drizzle jsonb should handle object parsing automatically. 
      // We manually type assert the nested JSON structure for TypeScript safety in components
      return api.analyses.get.responses[200].parse(raw) as typeof raw & { results: SkillGapResult };
    },
    enabled: !!id,
  });
}

export function useCreateAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAnalysisRequest) => {
      const res = await fetch(api.analyses.create.path, {
        method: api.analyses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create analysis");
      return api.analyses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.analyses.list.path] });
      toast({ title: "Analysis Complete", description: "Your skill gap analysis is ready." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

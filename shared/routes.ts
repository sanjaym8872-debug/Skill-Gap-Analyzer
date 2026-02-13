import { z } from 'zod';
import { 
  insertUserSchema, 
  insertUserSkillSchema,
  users,
  skills,
  jobRoles,
  userSkills,
  analyses,
  PROFICIENCY_LEVELS
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  skills: {
    list: {
      method: 'GET' as const,
      path: '/api/skills',
      responses: {
        200: z.array(z.custom<typeof skills.$inferSelect>()),
      },
    },
  },
  jobRoles: {
    list: {
      method: 'GET' as const,
      path: '/api/job-roles',
      responses: {
        200: z.array(z.custom<typeof jobRoles.$inferSelect & { skills: any[] }>()), // simplified type for response
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/job-roles/:id',
      responses: {
        200: z.custom<typeof jobRoles.$inferSelect & { skills: any[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  userSkills: {
    list: {
      method: 'GET' as const,
      path: '/api/user/skills',
      responses: {
        200: z.array(z.custom<typeof userSkills.$inferSelect & { skill: typeof skills.$inferSelect }>()),
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/user/skills',
      input: z.object({
        skillId: z.number(),
        proficiency: z.enum(PROFICIENCY_LEVELS),
      }),
      responses: {
        201: z.custom<typeof userSkills.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/user/skills/:id',
      responses: {
        200: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  analyses: {
    create: {
      method: 'POST' as const,
      path: '/api/analyses',
      input: z.object({
        jobRoleId: z.number(),
      }),
      responses: {
        201: z.custom<typeof analyses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/analyses',
      responses: {
        200: z.array(z.custom<typeof analyses.$inferSelect & { jobRole: typeof jobRoles.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/analyses/:id',
      responses: {
        200: z.custom<typeof analyses.$inferSelect & { jobRole: typeof jobRoles.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

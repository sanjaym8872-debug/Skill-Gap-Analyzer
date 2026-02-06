import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SkillGapResult } from "@shared/schema";

const PROFICIENCY_MAP = {
  "Beginner": 1,
  "Intermediate": 2,
  "Advanced": 3,
};

export default function SkillRadarChart({ results }: { results: SkillGapResult }) {
  // Combine all skills for the chart data
  const allSkills = [
    ...results.strongSkills,
    ...results.weakSkills,
    ...results.missingSkills.map(s => ({ ...s, currentProficiency: "None" }))
  ];

  const data = allSkills.map(item => ({
    subject: item.skill.name,
    A: PROFICIENCY_MAP[item.currentProficiency as keyof typeof PROFICIENCY_MAP] || 0,
    B: PROFICIENCY_MAP[item.requiredProficiency as keyof typeof PROFICIENCY_MAP],
    fullMark: 3,
  }));

  if (data.length === 0) return null;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Skill Proficiency Analysis</CardTitle>
        <CardDescription>Comparing your current skills against job requirements</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 3]} tickCount={4} tick={false} axisLine={false} />
            <Radar
              name="Your Level"
              dataKey="A"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
            <Radar
              name="Required Level"
              dataKey="B"
              stroke="hsl(var(--muted-foreground))"
              fill="hsl(var(--muted-foreground))"
              fillOpacity={0.1}
              strokeDasharray="4 4"
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

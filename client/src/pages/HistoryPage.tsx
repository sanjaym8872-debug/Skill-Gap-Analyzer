import { useAnalyses } from "@/hooks/use-data";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, ChevronRight, BarChart3 } from "lucide-react";
import type { SkillGapResult } from "@shared/schema";

export default function HistoryPage() {
  const { data: analyses, isLoading } = useAnalyses();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
        <p className="text-muted-foreground mt-2">Review your past career gap assessments.</p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : analyses?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No analyses yet</h3>
            <p className="text-muted-foreground mb-6">Start your first skill gap analysis to see your history here.</p>
            <Button asChild>
              <Link href="/analyze">Start Analysis</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {analyses?.map((analysis) => {
             // Safe cast since we know the structure from useAnalyses hook logic, 
             // but effectively results is jsonb
             const results = analysis.results as unknown as SkillGapResult;
             const gapCount = results.missingSkills.length + results.weakSkills.length;
             
             return (
              <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer group">
                  <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        {analysis.jobRole.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(analysis.createdAt!), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Skill Gaps</div>
                        <div className={`font-bold ${gapCount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                          {gapCount} Identified
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

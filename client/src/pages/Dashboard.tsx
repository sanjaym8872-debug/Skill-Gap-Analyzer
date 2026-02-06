import { useAuth } from "@/hooks/use-auth";
import { useAnalyses, useUserSkills } from "@/hooks/use-data";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: analyses, isLoading: loadingAnalyses } = useAnalyses();
  const { data: userSkills, isLoading: loadingSkills } = useUserSkills();

  const recentAnalysis = analyses?.[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.fullName || user?.username}. Here's your growth overview.</p>
        </div>
        <Link href="/analyze">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
            <Sparkles className="w-4 h-4" /> New Analysis
          </Button>
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingSkills ? "-" : userSkills?.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Skills in your profile</p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses Run</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingAnalyses ? "-" : analyses?.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total career path checks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">Latest Goal</CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">
              {recentAnalysis ? recentAnalysis.jobRole.title : "No goals yet"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recentAnalysis 
                ? `Last checked ${format(new Date(recentAnalysis.createdAt!), 'MMM d, yyyy')}` 
                : "Start your first analysis"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Your latest career gap checks</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAnalyses ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />)}
              </div>
            ) : analyses?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No analyses yet. Start one now!
              </div>
            ) : (
              <div className="space-y-4">
                {analyses?.slice(0, 5).map((analysis) => (
                  <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                           <BarChart3Icon />
                        </div>
                        <div>
                          <p className="font-medium">{analysis.jobRole.title}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(analysis.createdAt!), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {analyses && analyses.length > 0 && (
              <Button variant="link" className="w-full mt-4" asChild>
                <Link href="/history">View all history</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Top Skills */}
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Skills</CardTitle>
              <CardDescription>Your verified competencies</CardDescription>
            </div>
            <Link href="/profile">
               <Button variant="outline" size="sm">Manage</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingSkills ? (
              <div className="flex gap-2 flex-wrap">
                 {[1,2,3,4].map(i => <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />)}
              </div>
            ) : userSkills?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Add skills to your profile to get better recommendations.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userSkills?.map((us) => (
                  <Badge 
                    key={us.id} 
                    variant={us.proficiency === 'Advanced' ? 'default' : 'secondary'}
                    className="px-3 py-1 text-sm font-normal"
                  >
                    {us.skill.name} • {us.proficiency}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarChart3Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

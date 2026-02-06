import { useState } from "react";
import { useJobRoles, useCreateAnalysis } from "@/hooks/use-data";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AnalysisPage() {
  const { data: jobRoles, isLoading } = useJobRoles();
  const createAnalysis = useCreateAnalysis();
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleAnalyze = () => {
    if (!selectedRole) return;
    createAnalysis.mutate(
      { jobRoleId: parseInt(selectedRole) },
      {
        onSuccess: (data) => {
          setLocation(`/analysis/${data.id}`);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          Career Gap Analysis
        </h1>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Select your target job role to see what skills you're missing and get a personalized learning roadmap.
        </p>
      </div>

      <Card className="border-2 border-primary/10 shadow-xl shadow-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Select Target Role
          </CardTitle>
          <CardDescription>
            Choose the position you want to evaluate yourself against.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="Select a Job Role..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading roles...</SelectItem>
              ) : (
                jobRoles?.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {selectedRole && jobRoles && (
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground animate-in fade-in">
              <p className="font-medium text-foreground mb-1">Description:</p>
              {jobRoles.find(r => r.id.toString() === selectedRole)?.description}
            </div>
          )}

          <Button 
            className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20" 
            size="lg"
            disabled={!selectedRole || createAnalysis.isPending}
            onClick={handleAnalyze}
          >
            {createAnalysis.isPending ? "Analyzing Profile..." : "Analyze Gaps"}
            {!createAnalysis.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        {[
          { title: "Identify Gaps", desc: "Find missing key skills" },
          { title: "Compare Levels", desc: "Benchmark proficiency" },
          { title: "Get Roadmap", desc: "Actionable learning steps" },
        ].map((feat, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg border">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <h3 className="font-semibold">{feat.title}</h3>
            <p className="text-sm text-muted-foreground">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

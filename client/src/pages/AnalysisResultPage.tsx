import { useAnalysis } from "@/hooks/use-data";
import { useRoute } from "wouter";
import SkillRadarChart from "@/components/SkillRadarChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function AnalysisResultPage() {
  const [, params] = useRoute("/analysis/:id");
  const { data: analysis, isLoading, error } = useAnalysis(parseInt(params!.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Analysis not found</h2>
        <p className="text-muted-foreground">The requested analysis could not be loaded.</p>
      </div>
    );
  }

  const { jobRole, results } = analysis;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <div className="flex items-center gap-2 text-muted-foreground mb-2 text-sm">
          <span>Analysis Results</span>
          <span>/</span>
          <span className="text-foreground font-medium">{jobRole.title}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Gap Analysis: {jobRole.title}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">{jobRole.description}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Radar Chart */}
        <SkillRadarChart results={results} />

        {/* Quick Stats Summary */}
        <Card className="lg:col-span-1 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex justify-between items-center">
               <span>Missing Skills</span>
               <Badge variant="destructive" className="text-lg px-3">{results.missingSkills.length}</Badge>
             </div>
             <Separator className="bg-primary/20" />
             <div className="flex justify-between items-center">
               <span>Needs Improvement</span>
               <Badge variant="secondary" className="text-lg px-3 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{results.weakSkills.length}</Badge>
             </div>
             <Separator className="bg-primary/20" />
             <div className="flex justify-between items-center">
               <span>On Target</span>
               <Badge variant="default" className="text-lg px-3 bg-green-600 hover:bg-green-700">{results.strongSkills.length}</Badge>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Missing Skills */}
        <Card className="border-red-100 dark:border-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" /> Critical Gaps (Missing)
            </CardTitle>
            <CardDescription>Skills required for this role that you don't possess yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.missingSkills.length === 0 ? (
              <p className="text-sm text-green-600">No missing skills found! Great job.</p>
            ) : (
              results.missingSkills.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <span className="font-medium">{item.skill.name}</span>
                  <Badge variant="outline" className="border-red-200 text-red-700 bg-white">Target: {item.requiredProficiency}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Weak Skills */}
        <Card className="border-yellow-100 dark:border-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <ArrowRight className="w-5 h-5" /> Needs Improvement
            </CardTitle>
            <CardDescription>Skills you have, but need to level up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.weakSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your existing skills meet proficiency requirements.</p>
            ) : (
              results.weakSkills.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                  <div className="flex justify-between font-medium">
                    <span>{item.skill.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Current: {item.currentProficiency}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-bold text-yellow-700">Target: {item.requiredProficiency}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Roadmap Section */}
      <Card className="border-l-4 border-l-primary shadow-md">
        <CardHeader>
          <CardTitle>Recommended Learning Roadmap</CardTitle>
          <CardDescription>Step-by-step plan to bridge your skill gaps.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative border-l border-muted ml-3 space-y-8 py-2">
            {results.roadmap.map((step, idx) => (
              <div key={idx} className="relative pl-8">
                <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold ring-4 ring-background">
                  {step.step}
                </span>
                <div className="space-y-1">
                  <h4 className="font-semibold leading-none text-lg">{step.title}</h4>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
            {results.roadmap.length === 0 && (
               <div className="pl-8 text-muted-foreground">
                 You are fully qualified for this role! No learning steps required.
               </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

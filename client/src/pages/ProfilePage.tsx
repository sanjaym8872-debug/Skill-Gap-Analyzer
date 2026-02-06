import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUserSkills, useAddUserSkill, useDeleteUserSkill, useSkills } from "@/hooks/use-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PROFICIENCY_LEVELS } from "@shared/schema";

const addSkillSchema = z.object({
  skillId: z.coerce.number().min(1, "Select a skill"),
  proficiency: z.enum(PROFICIENCY_LEVELS),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: userSkills } = useUserSkills();
  const { data: allSkills } = useSkills();
  const deleteSkill = useDeleteUserSkill();
  const addSkill = useAddUserSkill();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof addSkillSchema>>({
    resolver: zodResolver(addSkillSchema),
    defaultValues: {
      proficiency: "Beginner",
    },
  });

  const onSubmit = (data: z.infer<typeof addSkillSchema>) => {
    addSkill.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  // Filter out skills user already has
  const availableSkills = allSkills?.filter(
    (skill) => !userSkills?.some((us) => us.skillId === skill.id)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* User Info Card */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary mb-4">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <CardTitle>{user?.fullName || user?.username}</CardTitle>
            <CardDescription>{user?.bio || "No bio added yet."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              {user?.email}
            </div>
            <Button variant="outline" className="w-full" disabled>Edit Profile (Coming Soon)</Button>
          </CardContent>
        </Card>

        {/* Skills Management */}
        <Card className="w-full md:w-2/3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Skills</CardTitle>
              <CardDescription>Manage your skill inventory</CardDescription>
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Skill</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="skillId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a skill" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableSkills?.map((skill) => (
                                <SelectItem key={skill.id} value={skill.id.toString()}>
                                  {skill.name} ({skill.category})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="proficiency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proficiency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PROFICIENCY_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={addSkill.isPending}>
                      {addSkill.isPending ? "Adding..." : "Add Skill"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {userSkills?.length === 0 ? (
                 <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                   You haven't added any skills yet.
                 </div>
               ) : (
                 userSkills?.map((us) => (
                   <div key={us.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-all group">
                     <div className="flex items-center gap-3">
                       <div className="h-2 w-2 rounded-full bg-primary" />
                       <div>
                         <p className="font-medium">{us.skill.name}</p>
                         <p className="text-xs text-muted-foreground">{us.skill.category}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-3">
                       <Badge variant={
                         us.proficiency === 'Advanced' ? 'default' : 
                         us.proficiency === 'Intermediate' ? 'secondary' : 'outline'
                       }>
                         {us.proficiency}
                       </Badge>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                         onClick={() => deleteSkill.mutate(us.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

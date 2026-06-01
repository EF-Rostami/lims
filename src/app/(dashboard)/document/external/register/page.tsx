/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Globe, Save, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Assuming you have a DatePicker or standard Input type="date"
import { toast } from "sonner";

export default function RegisterExternalDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    issuer: "", // e.g., ISO, EPA, Manufacturer
    external_id: "", // e.g., ISO 17025:2017
    version_tag: "",
    review_cycle_days: "365",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic would call externalDocumentService.register(formData)
      toast.success("External document registered in compliance log.");
      router.push("/document/external");
    } catch (err) {
      toast.error("Failed to register document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/document/external"><ChevronLeft /></Link></Button>
        <h1 className="text-2xl font-bold">Register External Standard</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-blue-600" /> Source Information</CardTitle>
            <CardDescription>Track standards from ISO, ASTM, or Equipment Manufacturers.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Document Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., General requirements for the competence of testing laboratories" 
                required 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Issuer / Organization</Label>
                <Input placeholder="ISO, ASTM, CLSI" value={formData.issuer} onChange={e => setFormData({...formData, issuer: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>External Reference ID</Label>
                <Input placeholder="ISO/IEC 17025" value={formData.external_id} onChange={e => setFormData({...formData, external_id: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Current Version/Year</Label>
                <Input placeholder="2017" value={formData.version_tag} onChange={e => setFormData({...formData, version_tag: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Review Cycle (Days)</Label>
                <Input type="number" value={formData.review_cycle_days} onChange={e => setFormData({...formData, review_cycle_days: e.target.value})} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Scope/Description</Label>
              <Textarea 
                placeholder="How is this used in the lab?" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-blue-700">
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Registering..." : "Add to Registry"}
          </Button>
        </div>
      </form>
    </div>
  );
}
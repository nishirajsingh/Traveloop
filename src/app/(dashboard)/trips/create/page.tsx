"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { tripSchema } from "@/validations";

type FormValues = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  isPublic: boolean;
  totalBudget: string;
};

export default function CreateTripPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { isPublic: false, totalBudget: "0" },
  });

  const isPublic = watch("isPublic");

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      totalBudget: parseFloat(data.totalBudget) || 0,
      coverImage: data.coverImage || "",
    };

    const parsed = tripSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || "Failed to create trip");
    } else {
      const json = await res.json();
      toast.success("Trip created!");
      router.push(`/trips/${json.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/trips" className="text-[#94A3B8] hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Trip</h1>
          <p className="text-[#94A3B8] text-sm">Plan your next adventure</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass rounded-xl p-6 space-y-5">
        <div className="space-y-1.5">
          <Label>Trip Title *</Label>
          <Input
            placeholder="e.g. Summer Europe Adventure"
            className="bg-[#0F172A]/60 border-[#334155]"
            {...register("title")}
          />
          {errors.title && <p className="text-red-400 text-xs">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            placeholder="Describe your trip..."
            rows={3}
            className="bg-[#0F172A]/60 border-[#334155] resize-none"
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start Date *</Label>
            <Input
              type="date"
              className="bg-[#0F172A]/60 border-[#334155]"
              {...register("startDate")}
            />
            {errors.startDate && <p className="text-red-400 text-xs">{errors.startDate.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>End Date *</Label>
            <Input
              type="date"
              className="bg-[#0F172A]/60 border-[#334155]"
              {...register("endDate")}
            />
            {errors.endDate && <p className="text-red-400 text-xs">{errors.endDate.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Total Budget (USD)</Label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            className="bg-[#0F172A]/60 border-[#334155]"
            {...register("totalBudget")}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Cover Image URL</Label>
          <Input
            placeholder="https://..."
            className="bg-[#0F172A]/60 border-[#334155]"
            {...register("coverImage")}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl bg-[#0F172A]/40">
          <div>
            <p className="text-sm font-medium text-white">Make trip public</p>
            <p className="text-xs text-[#94A3B8]">Anyone with the link can view this trip</p>
          </div>
          <button
            type="button"
            onClick={() => setValue("isPublic", !isPublic)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              isPublic ? "bg-blue-500" : "bg-[#334155]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                isPublic ? "translate-x-5.5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Create Trip
        </Button>
      </form>
    </div>
  );
}

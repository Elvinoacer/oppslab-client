import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { RichProfileForm } from "@/components/dashboard/profile-rich-form";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      bio: true,
      location: true,
      skills: true,
      richProfile: true,
    },
  });

  const richProfile = (user?.richProfile || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
        <p className="text-muted-foreground">
          Build your comprehensive profile. This data powers your AI-generated resumes.
        </p>
      </div>

      <div className="grid gap-6">
        <ProfileForm user={user || {}} />
        <RichProfileForm initialData={richProfile} />
      </div>
    </div>
  );
}

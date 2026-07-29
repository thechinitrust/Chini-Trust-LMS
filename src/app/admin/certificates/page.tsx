import { createClient } from "@/lib/supabase/server";
import { listCertificates } from "@/lib/data/certificates";
import { listProfiles } from "@/lib/data/users";
import { listCourses } from "@/lib/data/courses";
import { CertificatesTable } from "./certificates-table";

export default async function AdminCertificatesPage() {
  const supabase = await createClient();
  const [certificates, profiles, courses] = await Promise.all([
    listCertificates(supabase),
    listProfiles(supabase),
    listCourses(supabase),
  ]);
  return <CertificatesTable certificates={certificates} profiles={profiles} courses={courses} />;
}

import { redirect } from "next/navigation";

// Legacy route — the technical org form is replaced by the conversational
// audit wizard at /start.
export default function OnboardingPage() {
  redirect("/start");
}

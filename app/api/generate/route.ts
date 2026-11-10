import { NextResponse } from "next/server";
export const runtime = "nodejs";
const safe = (v: unknown, max = 5000) => typeof v === "string" ? v.trim().slice(0,max) : "";
function demoLetter(body: Record<string, any>, name: string, role: string, company: string) {
  const skills = safe(body.skills,800) || "the skills and strengths I have developed through my education and practical learning";
  const experience = safe(body.experience,1200) || "my academic work and personal projects";
  const projects = safe(body.projects,1200);
  return [
    name,
    safe(body.location,160),
    [safe(body.email,160),safe(body.phone,80)].filter(Boolean).join(" | "),
    "",
    "Dear Hiring Manager,",
    "",
    "I am writing to express my interest in the " + role + " position at " + company + ". I am excited by the opportunity to contribute to your team and bring a thoughtful, motivated approach to this role.",
    "",
    "Through " + experience + ", I have developed strengths in " + skills + ". I am eager to apply these capabilities to the priorities outlined in the job description and continue growing in a collaborative environment.",
    projects ? " My work on " + projects + " has helped me put these skills into practice." : "",
    "",
    "I am particularly interested in this opportunity because it aligns with my professional goals and gives me the chance to make a meaningful contribution. I would welcome the opportunity to discuss how my background and enthusiasm could support your team.",
    "",
    "Thank you for your time and consideration. I look forward to hearing from you.",
    "",
    "Sincerely,",
    name
  ].filter((line) => line !== null).join("\n");
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = safe(body.name,120), role = safe(body.role,160), company = safe(body.company,160);
    const description = safe(body.description,5000);
    if (!name || !role || !company || !description) return NextResponse.json({ error: "Please add your name, target role, company and job description." }, { status: 400 });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      if (body.demoMode === true) return NextResponse.json({ letter: demoLetter(body,name,role,company), mode:"demo" });
      return NextResponse.json({ error: "Live AI is not configured. Add OPENAI_API_KEY in Vercel Environment Variables, or choose Try demo to preview the workflow." }, { status: 503 });
    }
    const prompt = "Write a compelling, ATS-friendly cover letter using only the applicant facts provided. Never invent experience, qualifications, metrics, dates, or company facts. If information is missing, omit it. Tailor language to the job description. Return only the letter, with a professional greeting and sign-off. Length: " + (safe(body.length,30) || "Medium") + ". Tone: " + (safe(body.tone,40) || "Professional") + ". Template: " + safe(body.template,80) + ".\nAPPLICANT: " + JSON.stringify({name,education:safe(body.education),skills:safe(body.skills),experience:safe(body.experience),projects:safe(body.projects),achievements:safe(body.achievements),certifications:safe(body.certifications),applicantType:safe(body.applicantType)}) + "\nROLE: " + role + "\nCOMPANY: " + company + "\nCOMPANY LOCATION: " + safe(body.companyLocation,160) + "\nJOB DESCRIPTION: " + description;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type":"application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.75, messages: [{role:"system",content:"You are an expert career-writing assistant. Be specific, truthful, concise and human."},{role:"user",content:prompt}] })
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("AI provider error", response.status, detail.slice(0,500));
      return NextResponse.json({ error: "The AI provider could not complete this request. Check your API key, billing and model access." }, { status: 502 });
    }
    const data = await response.json();
    const letter = data.choices?.[0]?.message?.content?.trim();
    if (!letter) return NextResponse.json({error:"The AI returned an empty response. Please try again."},{status:502});
    return NextResponse.json({ letter, mode:"ai" });
  } catch (error) {
    console.error("Cover letter generation failed", error);
    return NextResponse.json({ error:"Something went wrong while generating your letter." }, { status:500 });
  }
}
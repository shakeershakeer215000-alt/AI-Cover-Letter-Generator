import { NextResponse } from "next/server";
export const runtime = "nodejs";
const safe = (v: unknown, max = 5000) => typeof v === "string" ? v.trim().slice(0,max) : "";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = safe(body.name,120), role = safe(body.role,160), company = safe(body.company,160);
    const description = safe(body.description,5000);
    if (!name || !role || !company || !description) return NextResponse.json({ error: "Please add your name, target role, company and job description." }, { status: 400 });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI is not configured yet. Add OPENAI_API_KEY in Vercel Environment Variables, or use Demo mode to preview the workflow." }, { status: 503 });
    const prompt = `Write a compelling, ATS-friendly cover letter using only the applicant facts provided. Never invent experience, qualifications, metrics, or company facts. If information is missing, omit it rather than fabricate it. Tailor language to the job description. Return only the letter, with a professional greeting and sign-off. Length: ${safe(body.length,30) || "Medium"}. Tone: ${safe(body.tone,40) || "Professional"}.\nAPPLICANT: ${JSON.stringify({name,education:safe(body.education),skills:safe(body.skills),experience:safe(body.experience),projects:safe(body.projects),achievements:safe(body.achievements),certifications:safe(body.certifications),applicantType:safe(body.applicantType)})}\nROLE: ${role}\nCOMPANY: ${company}\nCOMPANY LOCATION: ${safe(body.companyLocation,160)}\nJOB DESCRIPTION: ${description}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { "Content-Type":"application/json", Authorization: `Bearer ${apiKey}` },
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
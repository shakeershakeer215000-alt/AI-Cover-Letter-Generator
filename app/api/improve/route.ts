import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { letter, action } = await req.json();
    if (typeof letter !== "string" || letter.trim().length < 20 || letter.length > 12000) return NextResponse.json({error:"Please provide a valid cover letter."},{status:400});
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({error:"Add OPENAI_API_KEY to enable AI editing."},{status:503});
    const tasks: Record<string,string> = { professional:"Make the tone more professional and confident without changing facts.", grammar:"Correct grammar, spelling and punctuation only.", shorten:"Shorten this letter while preserving its strongest points.", expand:"Expand the letter with relevant detail, but do not invent facts.", improve:"Improve clarity, flow and impact without inventing information." };
    const response = await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",temperature:.5,messages:[{role:"system",content:"You are a careful professional editor. Preserve all facts. Return only the revised letter."},{role:"user",content:`${tasks[action]||tasks.improve}\n\n${letter}`}]})});
    if(!response.ok) return NextResponse.json({error:"The AI editing request failed. Check provider configuration."},{status:502});
    const data=await response.json(); return NextResponse.json({letter:data.choices?.[0]?.message?.content?.trim()||letter});
  } catch { return NextResponse.json({error:"Unable to edit this letter right now."},{status:500}); }
}
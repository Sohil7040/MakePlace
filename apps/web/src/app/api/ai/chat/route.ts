import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are MakePlace AI, an intelligent assistant embedded in the MakePlace STEM Robotics Academy platform.

Your role:
- Help students document their engineering projects effectively
- Suggest improvements to project descriptions, journal entries, and portfolios
- Provide guidance on the engineering design process (ideation → research → design → build → test)
- Help students reflect on their learning and articulate their skills
- Offer constructive, encouraging feedback in a professional yet friendly tone

Style:
- Keep responses concise (2-4 sentences typically)
- Be specific and actionable in your suggestions
- Use professional language appropriate for a STEM educational context
- If asked about something outside your scope, politely redirect to platform-relevant topics

You have context about the MakePlace platform which includes: Project Workspaces, Design Journals (Canva-style canvas), Portfolio Builder, Task Boards, Badge System, and Mentor feedback features.`;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured. Please add GEMINI_API_KEY to your .env file.' },
      { status: 503 }
    );
  }

  try {
    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Build Gemini API request
    const geminiMessages = messages.map((msg: { role: string; text: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    const requestBody = {
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT + (context ? `\n\nCurrent context: ${context}` : '') }],
      },
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 512,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', response.status, errorBody);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const data = await response.json();
    
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiText) {
      return NextResponse.json(
        { error: 'No response generated. Please try rephrasing your message.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ text: aiText });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

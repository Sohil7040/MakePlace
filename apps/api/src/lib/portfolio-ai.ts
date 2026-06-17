import { GoogleGenAI } from '@google/genai';
import type { BadgeAward, Project, Student } from '@prisma/client';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  mediaUrls: string[];
}

export interface PortfolioContent {
  about: string;
  projects: PortfolioProject[];
  skills: string[];
  highlights: string[];
}

type ProjectWithMedia = Project & { media: { url: string; type: string; caption: string | null }[] };
type BadgeWithMeta = BadgeAward & { badge: { name: string; description: string }; note?: string | null };

export interface PortfolioContext {
  student: Student & { program: { name: string } };
  projects: ProjectWithMedia[];
  badges: BadgeWithMeta[];
  mentorName: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  refinementMessage?: string;
}

function formatProjectsJson(projects: ProjectWithMedia[]) {
  return JSON.stringify(
    projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      tags: p.tags,
      status: p.status,
      mediaUrls: p.media.map((m) => m.url),
    })),
    null,
    2
  );
}

function formatBadgesJson(badges: BadgeWithMeta[]) {
  return JSON.stringify(
    badges.map((b) => ({
      name: b.badge.name,
      description: b.badge.description,
      note: b.note,
      awardedAt: b.awardedAt,
    })),
    null,
    2
  );
}

function formatConversationHistory(history: Array<{ role: string; content: string }>) {
  if (!history.length) return '[]';
  return JSON.stringify(history, null, 2);
}

function buildMakePlacePrompt(ctx: PortfolioContext): string {
  const { student, projects, badges, mentorName, conversationHistory = [], refinementMessage } = ctx;
  const isIterative = conversationHistory.length > 0 || Boolean(refinementMessage);

  const executionNote = isIterative
    ? `Iterative Execution: The student has provided follow-up feedback. Parse their latest request in the context of the conversation log and adapt the portfolio fields intelligently while maintaining data consistency.${
        refinementMessage ? `\nLatest student request: "${refinementMessage}"` : ''
      }`
    : 'Initial Execution: The student chat input history is empty. Synthesize the raw project data, badges, and program metadata into an immaculate baseline portfolio framework.';

  return `You are the elite AI Engine for "MakePlace" — a premier STEM, Robotics, and Maker academy in India. Your objective is to generate or iteratively refine high-impact, professional student portfolios optimized for presentation dashboards and public parent portal views (designed to scale cleanly into 1280 × 720 proportions with balanced margins).

### 1. CORE DATA CONTEXT
- Student Profile: ${student.fullName}, Age ${student.age}
- Enrolled Program: ${student.program.name}
- Assigned Lead Mentor: ${mentorName}
- Completed Projects: ${formatProjectsJson(projects)}
- Earned Badges: ${formatBadgesJson(badges)}

### 2. BRANDING, VISUAL THEME, & TONAL GUIDELINES
When framing descriptions, headlines, and summaries, adapt your narrative tone to mirror the academy's distinct visual personality:
- Tonal Voice: Warm, enthusiastic, yet deeply technical and structured. It must read cleanly and professionally to parents, prospective mentors, and external evaluators.
- Brand Archetype: Space age innovation meets modernist architectural structure.
- Editorial Polish: Use clear, technical typography cues (evoking clean Space Grotesk headings and highly readable Plus Jakarta Sans body structures). Avoid generic fluff; focus heavily on tangible engineering milestones, code execution, prototyping, and hardware-software integration.

### 3. CHAT INTERACTION & REFINEMENT ROLE
${executionNote}

### 4. CONVERSATION LOG HISTORY
${formatConversationHistory(conversationHistory)}

### 5. STRICT OUTPUT FORMAT SPECIFICATION
You must return EXCLUSIVELY a single, valid JSON object. Do not include markdown code block syntax (such as \`\`\`json), do not include trailing chat remarks, and do not include conversational prefaces. Any deviation breaks the parsing pipeline.

The JSON structure must match this schema exactly:

{
  "about": "A compelling, narrative-driven personal summary detailing the student's technical journey, engineering objectives, and creative focus at MakePlace.",
  "projects": [
    {
      "id": "String matching the original project tracking ID",
      "title": "Polished, high-impact version of the project title",
      "description": "An engaging project breakdown outlining the engineering problem solved, technologies/hardware stacks utilized, and final outcomes achieved.",
      "mediaUrls": ["Array of matching string URLs provided in the context data"]
    }
  ],
  "skills": [
    "Array of 5 to 8 crisp, highly specific technical core competencies displayed across their work, e.g., Arduino Microcontrollers, C++, CAD Modeling, Rapid Prototyping"
  ],
  "highlights": [
    "Array of 3 to 4 major callouts, unique design milestones, or accomplishments tied directly to their earned badges and mentor feedback"
  ]
}`;
}

function parsePortfolioJson(text: string): PortfolioContent {
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse portfolio response');

  const parsed = JSON.parse(jsonMatch[0]) as PortfolioContent;

  if (!parsed.about || !Array.isArray(parsed.projects) || !Array.isArray(parsed.skills) || !Array.isArray(parsed.highlights)) {
    throw new Error('Portfolio response missing required fields');
  }

  return parsed;
}

function enrichPortfolioContent(content: PortfolioContent, projects: ProjectWithMedia[]): PortfolioContent {
  return {
    ...content,
    projects: content.projects.map((project, index) => {
      const source = projects.find((p) => p.id === project.id) || projects[index];
      const fallbackMedia = source?.media.map((m) => m.url) || [];

      return {
        id: project.id || source?.id || `project-${index}`,
        title: project.title || source?.title || 'Untitled Project',
        description: project.description || source?.description || '',
        mediaUrls: project.mediaUrls?.length ? project.mediaUrls : fallbackMedia,
      };
    }),
    skills: content.skills.slice(0, 8),
    highlights: content.highlights.slice(0, 4),
  };
}

async function callPortfolioAI(prompt: string): Promise<PortfolioContent> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text || '';
  return parsePortfolioJson(text);
}

export async function generatePortfolio(ctx: PortfolioContext): Promise<PortfolioContent> {
  const prompt = buildMakePlacePrompt({ ...ctx, conversationHistory: [] });
  const content = await callPortfolioAI(prompt);
  return enrichPortfolioContent(content, ctx.projects);
}

export async function refinePortfolio(
  ctx: PortfolioContext,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<PortfolioContent> {
  const prompt = buildMakePlacePrompt({
    ...ctx,
    conversationHistory,
    refinementMessage: userMessage,
  });
  const content = await callPortfolioAI(prompt);
  return enrichPortfolioContent(content, ctx.projects);
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

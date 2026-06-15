import Anthropic from '@anthropic-ai/sdk';
import type { BadgeAward, Project, Student } from '@prisma/client';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

export interface PortfolioContent {
  about: string;
  projects: Array<{ title: string; description: string; highlights: string[] }>;
  skills: string[];
  highlights: string[];
}

interface GenerateInput {
  student: Student & { program: { name: string } };
  projects: (Project & { media: { url: string; type: string; caption: string | null }[] })[];
  badges: (BadgeAward & { badge: { name: string; description: string } })[];
}

function buildPrompt(input: GenerateInput): string {
  const { student, projects, badges } = input;
  const projectList = projects
    .map(
      (p) =>
        `- ${p.title}: ${p.description}${p.tags.length ? ` (tags: ${p.tags.join(', ')})` : ''}`
    )
    .join('\n');
  const badgeList = badges.map((b) => `- ${b.badge.name}: ${b.badge.description}`).join('\n');

  return `Generate a personalized, enthusiastic student portfolio for ${student.fullName}, aged ${student.age}, enrolled in ${student.program.name}. Their projects include:
${projectList || '- No projects yet'}

They have earned these badges:
${badgeList || '- No badges yet'}

Write in a warm, encouraging tone suitable for parents and future mentors. Include an about section, project highlights, and key skills demonstrated. Return ONLY valid JSON with this structure:
{
  "about": "string",
  "projects": [{ "title": "string", "description": "string", "highlights": ["string"] }],
  "skills": ["string"],
  "highlights": ["string"]
}`;
}

export async function generatePortfolio(input: GenerateInput): Promise<PortfolioContent> {
  const prompt = buildPrompt(input);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse portfolio response');

  return JSON.parse(jsonMatch[0]) as PortfolioContent;
}

export async function refinePortfolio(
  currentContent: PortfolioContent,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<PortfolioContent> {
  const messages = [
    {
      role: 'user' as const,
      content: `Current portfolio JSON:\n${JSON.stringify(currentContent, null, 2)}\n\nPlease update the portfolio based on this request: ${userMessage}\n\nReturn ONLY the updated JSON with the same structure: { about, projects[], skills[], highlights[] }`,
    },
    ...conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages,
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse portfolio response');

  return JSON.parse(jsonMatch[0]) as PortfolioContent;
}

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

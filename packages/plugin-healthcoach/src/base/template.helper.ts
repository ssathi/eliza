import { readFile } from 'fs/promises';

export async function pickTopic(): Promise<string> {
    const data = await readFile('../characters/healthcoach.topics.json', 'utf8');
    const topics: string[] = JSON.parse(data);
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
}

export async function pickTemplate(): Promise<any> {
  const data = await readFile('../characters/healthcoach.templates.json', 'utf8');
  const templates = JSON.parse(data);
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

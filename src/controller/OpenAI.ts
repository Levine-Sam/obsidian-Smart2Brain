import { requestUrl } from 'obsidian';

export async function isAPIKeyValid(openAIApiKey: string) {
    try {
        const response = await requestUrl({
            method: 'GET',
            url: `https://api.openai.com/v1/models`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openAIApiKey}`,
            },
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

export async function getOpenAIModelNames(openAIApiKey: string): Promise<{ gen: string[]; embed: string[] }> {
    try {
        const response = await requestUrl({
            method: 'GET',
            url: `https://api.openai.com/v1/models`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${openAIApiKey}`,
            },
        });

        if (response.status !== 200) return { gen: [], embed: [] };
        const data = response.json as { data?: Array<{ id: string }> };
        const ids = (data?.data || []).map((m) => m.id);

        // Heuristic split: embeddings vs. everything else suitable for generation/chat
        const embed = ids.filter((id) => /embedding/i.test(id));
        const gen = ids
            .filter((id) => !embed.includes(id))
            .filter((id) => !/(whisper|tts|audio|image|vision|clip|moderation)/i.test(id));

        return { gen: gen.sort(), embed: embed.sort() };
    } catch (error) {
        return { gen: [], embed: [] };
    }
}

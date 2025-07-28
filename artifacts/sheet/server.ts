import { myProvider } from '@/lib/ai/providers';
import { getSheetPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { streamObject } from 'ai';
import { z } from 'zod';

export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title, context, dataStream }) => {
    let draftContent = '';

    // Build the prompt with context if provided
    const prompt = context
      ? `Title: ${title}\n\nContext from conversation: ${context}\n\nGenerate the spreadsheet based on the title and context provided.`
      : title;

    const sheetPrompt = await getSheetPrompt();
    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: sheetPrompt.content,

      prompt,
      schema: z.object({
        csv: z.string().describe('CSV data'),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.writeData({
            type: 'sheet-delta',
            content: csv,
          });

          draftContent = csv;
        }
      }
    }

    dataStream.writeData({
      type: 'sheet-delta',
      content: draftContent,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const updatePrompt = await updateDocumentPrompt(document.content, 'sheet');
    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updatePrompt.content,

      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.writeData({
            type: 'sheet-delta',
            content: csv,
          });

          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});

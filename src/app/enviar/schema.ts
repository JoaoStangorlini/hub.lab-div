import { z } from 'zod';

export const submissionSchema = z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(60, 'Título muito longo (máx 60)').default(''),
    authors: z.string().min(3, 'Informe os autores principais').max(60, 'Muito longo (máx 60)').default(''),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').default(''),
    whatsapp: z.string().default(''),
    video_url: z.string().url('Link inválido').or(z.literal('')).default(''),
    external_link: z.string().url('Link inválido').or(z.literal('')).default(''),
    technical_details: z.string().default(''),
    alt_text: z.string().max(300, 'Máximo 300 caracteres').default(''),
    testimonial: z.string().default(''),
    read_guide: z.boolean().refine(v => v === true, 'Você deve ler o guia').default(false),
    accepted_cc: z.boolean().refine(v => v === true, 'Você deve aceitar a licença').default(false),
    tags: z.array(z.string()).default([]),
    reading_time: z.number().default(0),
    use_pseudonym: z.boolean().default(false),
    event_year: z.string().min(4, 'Selecione o ano').default(new Date().getFullYear().toString()),
    pseudonym_id: z.string().uuid().optional(),
    new_pseudonym: z.string().max(30, 'Apelido muito longo').optional(),
    co_authors: z.array(z.any()).default([]),
    quiz: z.array(z.object({
        id: z.string(),
        question: z.string().min(5, 'Pergunta muito curta').max(200, 'Pergunta muito longa'),
        options: z.array(z.string().min(1, 'Opção não pode ser vazia')).length(4, 'Deve ter exatamente 4 opções'),
        correct_option: z.coerce.number().min(0).max(3)
    })).max(2, 'Máximo de 2 perguntas').optional().default([])
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;

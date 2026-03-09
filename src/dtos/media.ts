import { MediaType } from '@/types';

/**
 * PostDTO: Sanitized data for public display.
 * Prevents leaking internal database fields.
 */
export interface PostDTO {
    id: string;
    title: string;
    authors: string;
    description: string;
    category?: string;
    mediaType: MediaType;
    mediaUrl: string | string[];
    isFeatured: boolean;
    tags?: string[];
    readingTime?: number;
    createdAt: string;
    views?: number;
    likeCount: number;
    saveCount: number;
    commentCount: number;
    avatarUrl?: string;
    authorXp?: number;
    authorLevel?: number;
    authorIsLabDiv?: boolean;
    priority?: boolean;
    location_lat?: number;
    location_lng?: number;
    location_name?: string;
    status: string;
}

/**
 * AdminPostDTO: Extended DTO for administrative operations.
 * Includes moderation fields while maintaining sanitized types.
 */
export interface AdminPostDTO extends PostDTO {
    externalLink?: string;
    technicalDetails?: string;
    adminFeedback?: string;
    aiSuggestedTags?: string[];
    aiSuggestedAlt?: string;
    aiStatus?: string;
    whatsapp?: string;
    eventDate?: string;
    // New fields for expansion
    quiz?: any;
    testimonial?: string;
    altText?: string;
    coAuthors?: string[];
    pseudonym?: string;
    eventYear?: number;
    format?: string; // media_type
}

/**
 * UserDTO: Public user profile data.
 * Strictly excludes email and private metadata.
 */
export interface UserDTO {
    id: string;
    name: string;
    avatar?: string;
    handle?: string;
    role: string;
}

/**
 * Converter: Map database Submission to PostDTO
 */
export function mapToPostDTO(submission: any, counts?: { likes?: number, saves?: number, comments?: number }, avatarUrl?: string): PostDTO {
    const profile = submission.profiles || {};

    return {
        id: submission.id,
        title: submission.title,
        authors: submission.authors,
        description: submission.description,
        category: submission.category,
        mediaType: submission.media_type,
        mediaUrl: submission.media_url,
        isFeatured: submission.is_featured,
        tags: submission.tags,
        readingTime: typeof submission.reading_time === 'number' ? submission.reading_time : 0,
        createdAt: String(submission.created_at),
        views: Number(submission.views || submission.view_count || 0),
        likeCount: Number(counts?.likes ?? submission.like_count ?? 0),
        saveCount: Number(counts?.saves ?? 0),
        commentCount: Number(counts?.comments ?? 0),
        avatarUrl: avatarUrl || profile.avatar_url || submission.avatar_url,
        authorXp: profile.xp,
        authorLevel: profile.level,
        authorIsLabDiv: profile.is_labdiv,
        location_lat: typeof submission.location_lat === 'number' ? submission.location_lat : undefined,
        location_lng: typeof submission.location_lng === 'number' ? submission.location_lng : undefined,
        location_name: submission.location_name,
        status: String(submission.status),
    };
}

/**
 * Converter: Map database Submission to AdminPostDTO
 */
export function mapToAdminPostDTO(submission: any, counts?: { likes?: number, saves?: number, comments?: number }): AdminPostDTO {
    const post = mapToPostDTO(submission, counts);
    return {
        ...post,
        externalLink: submission.external_link,
        technicalDetails: submission.technical_details,
        adminFeedback: submission.admin_feedback,
        aiSuggestedTags: submission.ai_suggested_tags,
        aiSuggestedAlt: submission.ai_suggested_alt,
        aiStatus: submission.ai_status,
        whatsapp: submission.whatsapp,
        eventDate: submission.event_date ? String(submission.event_date) : undefined,
        quiz: submission.quiz,
        testimonial: submission.testimonial,
        altText: submission.alt_text || submission.ai_suggested_alt,
        coAuthors: submission.co_authors,
        pseudonym: submission.pseudonym,
        eventYear: submission.event_year,
        format: submission.media_type,
    };
}

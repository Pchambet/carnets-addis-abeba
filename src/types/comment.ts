export interface Comment {
    id: string;
    letter_id: string;
    parent_id: string | null;
    author: string;
    email: string | null;
    content: string;
    is_claire: boolean;
    approved: boolean;
    created_at: string;
    replies?: Comment[];
}

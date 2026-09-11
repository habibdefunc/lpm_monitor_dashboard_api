import {Documentation} from "@prisma/client"

export type DocumentationResponse = {
    id: number
    activity_id: number
    file_name: string
    mime_type: string
    size: number
    uploaded_by: number | null
    created_at: string
    download_url: string
}

export function toDocumentationResponse(document: Documentation): DocumentationResponse {
    return {
        id: document.id,
        activity_id: document.activity_id,
        file_name: document.file_name,
        mime_type: document.mime_type,
        size: document.size,
        uploaded_by: document.uploaded_by,
        created_at: document.created_at.toISOString(),
        download_url: "/api/activities/" + document.activity_id + "/documentations/" + document.id + "/download"
    }
}

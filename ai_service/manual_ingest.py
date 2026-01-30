import asyncio
import os
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import Client, create_client

import google.generativeai as genai


def _require_non_empty(value: object, field_name: str) -> str:
    if value is None:
        raise Exception(f"DOCUMENT INGEST FAILED: {field_name} is empty or null")

    text = str(value)
    if not text.strip():
        raise Exception(f"DOCUMENT INGEST FAILED: {field_name} is empty or null")

    return text.strip()


def _require_uuid(value: object, field_name: str) -> str:
    text = _require_non_empty(value, field_name)
    try:
        parsed = uuid.UUID(text)
    except Exception as e:
        raise Exception(
            f"DOCUMENT INGEST FAILED: {field_name} is not a valid UUID: {text}"
        ) from e

    return str(parsed)


async def ingest_manually() -> None:
    load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

    print("Initialize Manual Ingestion...")

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise Exception("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")

    supabase: Client = create_client(url, key)

    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise Exception("Missing GEMINI_API_KEY/GOOGLE_API_KEY for embeddings")

    genai.configure(api_key=api_key)

    model_name = os.environ.get("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")
    print(f"Using Embedding Model: {model_name}")

    count_response = (
        supabase.table("document_embeddings")
        .select("*", count="exact", head=True)
        .execute()
    )
    print(f"Initial DB Count: {count_response.count}")

    print("Fetching Projects...")
    response = supabase.table("projects_master").select("*").execute()
    projects = response.data or []

    if not projects:
        print("No projects found in DB to ingest.")
        return

    print(f"Found {len(projects)} projects. processing...")

    for project in projects:
        # Use the project UUID as the document UUID for deterministic upserts.
        project_id = _require_uuid(project.get("id"), "project_id")
        document_id = _require_uuid(project_id, "document_id")

        title = project.get("project_name") or "Untitled"
        category = "CONTRACT"
        status = "Review"
        doc_type = "text"

        doc_text = (
            f"Project Code: {project.get('project_code')}\n"
            f"Name: {project.get('project_name')}\n"
            f"Status: {project.get('status')}\n"
            f"Value: {project.get('total_value_aed')}\n"
            f"Description: {project.get('description', '')}"
        )

        # Strict payload: ONLY columns confirmed to exist right now
        # (content/metadata are stored in document_embeddings, not documents)
        doc_payload = {
            "id": document_id,
            "title": title or "Untitled",
            "category": category,
            "status": status,
            "project_id": project_id,
            "type": doc_type,
            "storage_path": None,
            "version": 1,
        }

        # Avoid sending nulls.
        doc_payload = {k: v for k, v in doc_payload.items() if v is not None}

        print(f"  -> Upserting Document {document_id}...")
        doc_res = supabase.table("documents").upsert(doc_payload).execute()

        if getattr(doc_res, "error", None):
            raise Exception(f"DOCUMENT UPSERT FAILED: {doc_res.error}")

        if not getattr(doc_res, "data", None):
            raise Exception("DOCUMENT UPSERT FAILED: No rows returned")

        print(f"  -> [Phase 1] Document Upserted: {document_id}")

        embed_res = genai.embed_content(
            model=model_name,
            content=doc_text,
            task_type="retrieval_document",
            output_dimensionality=1536,
        )
        vector = embed_res["embedding"]

        embedding_payload = {
            "document_id": document_id,
            "content": doc_text,
            "embedding": vector,
            "metadata": {"type": "project", "code": project.get("project_code")},
        }

        emb_res = (
            supabase.table("document_embeddings").upsert(embedding_payload).execute()
        )

        if getattr(emb_res, "error", None):
            raise Exception(f"EMBEDDING UPSERT FAILED: {emb_res.error}")

        if not getattr(emb_res, "data", None):
            raise Exception("EMBEDDING UPSERT FAILED: No rows returned")

        print(f"  -> [Phase 2] Embedding Upserted for {title}")

    final_count = (
        supabase.table("document_embeddings")
        .select("*", count="exact", head=True)
        .execute()
    )
    print(f"Final DB Count: {final_count.count}")


if __name__ == "__main__":
    asyncio.run(ingest_manually())

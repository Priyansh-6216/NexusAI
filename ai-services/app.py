from fastapi import FastAPI

app = FastAPI(
    title="NexusAI AI Service",
    description="Python AI utilities for embeddings, RAG, and model orchestration.",
    version="0.1.0",
)

@app.get("/")
def root():
    return {"status": "ok", "service": "nexusai-ai-services"}

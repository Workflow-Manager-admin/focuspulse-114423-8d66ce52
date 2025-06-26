from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# PUBLIC_INTERFACE
app = FastAPI(
    title="FocusTimer Backend API",
    description=(
        "Backend scaffold for the FocusTimer Pomodoro App. "
        "Provides health check and CORS support. "
        "Ready for expansion—add API endpoints in the future."
    ),
    version="0.1.0",
    openapi_tags=[
        {
            "name": "health",
            "description": "Health check and system endpoints.",
        },
        # Add new tags for future features/endpoints here.
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PUBLIC_INTERFACE
@app.get(
    "/",
    summary="Health Check",
    description="Returns a simple message indicating that the API is up.",
    tags=["health"],
    response_model=dict,
    response_description="Health message.",
)
def health_check():
    """
    Health check endpoint.

    Returns:
        dict: A message indicating the backend is healthy.
    """
    return {"message": "Healthy"}

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import io
from PIL import Image

app = FastAPI(title="AuraLens AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/v1/generate-code")
async def generate_code(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a valid image format.")
    
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        width, height = image.size
    except Exception:
        raise HTTPException(status_code=422, detail="Could not process image stream.")

    generated_html = f"""
<div class="generated-wrapper">
  <header class="generated-header">
    <div>
      <h1>Aura Workspace</h1>
      <p>Auto-generated from wireframe (Source Dimensions: {width}x{height}px)</p>
    </div>
    <button class="export-btn">Export Code</button>
  </header>
  <main class="generated-grid">
    <div class="card">
      <h3>Total Inquiries</h3>
      <p class="metric-val">12,842</p>
      <span class="trend-pos">+14.2% from last month</span>
    </div>
    <div class="card">
      <h3>Conversion Rate</h3>
      <p class="metric-val">8.4%</p>
      <span class="trend-pos">+2.1% optimization</span>
    </div>
    <div class="card">
      <h3>Active Latency</h3>
      <p class="metric-val">24ms</p>
      <span class="trend-neutral">Edge Optimized</span>
    </div>
  </main>
</div>
"""
    return {"filename": file.filename, "code": generated_html.strip()}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AuraLens Backend Engine"}
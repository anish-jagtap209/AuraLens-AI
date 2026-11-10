import subprocess
import sys
import os

def run_app():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Path to virtual environment python executable
    if os.name == 'nt':  # Windows
        python_executable = os.path.join(backend_dir, "venv", "Scripts", "python.exe")
    else:
        python_executable = os.path.join(backend_dir, "venv", "bin", "python")

    if not os.path.exists(python_executable):
        python_executable = sys.executable  # Fallback to global python

    print("[*] Starting AuraLens AI Backend (FastAPI on port 8000)...")
    backend_process = subprocess.Popen(
        [python_executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"],
        cwd=backend_dir
    )

    print("[*] Starting AuraLens AI Frontend (HTTP Server on port 3000)...")
    frontend_process = subprocess.Popen(
        [python_executable, "-m", "http.server", "3000"],
        cwd=frontend_dir
    )

    print("\n[+] AuraLens AI is running!")
    print("    -> Frontend: http://localhost:3000")
    print("    -> Backend Docs: http://127.0.0.1:8000/docs")
    print("    Press Ctrl+C to stop both servers.\n")

    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n[*] Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    run_app()
import os, uuid, logging
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from rag.pdf_processor import load_and_split_pdfs
from rag.vector_store import build_vector_store
from features.revision_plan import generate_revision_plan
from features.flashcards import generate_flashcards
from features.quiz import generate_quiz
from features.chat import answer_question

load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY", "")

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

sessions = {}  # session_id -> { vector_store, pdf_names }

def err(msg, code=400):
    if code == 500:
        print(f"INTERNAL SERVER ERROR: {msg}")
        logger.error(f"Internal Server Error: {msg}")
        msg = "Gemini is busy right now. Please wait a moment and try again."
    return jsonify({"error": msg}), code


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.post("/api/upload")
def upload():
    files = request.files.getlist("files")
    if not files or all(f.filename == "" for f in files):
        return err("No files uploaded.")
    try:
        logger.info("Processing %d PDF(s)…", len(files))
        chunks = load_and_split_pdfs(files)
        if not chunks:
            return err("Could not extract text from the PDFs.", 422)
        vs = build_vector_store(chunks)
        sid = str(uuid.uuid4())
        sessions[sid] = {"vector_store": vs, "pdf_names": [f.filename for f in files]}
        return jsonify({"session_id": sid, "pdf_names": sessions[sid]["pdf_names"], "chunks_indexed": len(chunks)})
    except Exception as e:
        return err(str(e), 500)

@app.post("/api/revision-plan")
def revision_plan():
    body = request.get_json(silent=True) or {}
    s = sessions.get(body.get("session_id", ""))
    if not s: return err("Session not found.", 404)
    try:
        plan = generate_revision_plan(s["vector_store"], exam_date_info=body.get("exam_date_info", ""))
        return jsonify({"plan": plan})
    except Exception as e:
        return err(str(e), 500)

@app.post("/api/flashcards")
def flashcards():
    body = request.get_json(silent=True) or {}
    s = sessions.get(body.get("session_id", ""))
    if not s: return err("Session not found.", 404)
    try:
        cards = generate_flashcards(s["vector_store"], topic=body.get("topic", ""), num_cards=int(body.get("num_cards", 10)))
        return jsonify({"flashcards": cards})
    except Exception as e:
        return err(str(e), 500)

@app.post("/api/quiz")
def quiz():
    body = request.get_json(silent=True) or {}
    s = sessions.get(body.get("session_id", ""))
    if not s: return err("Session not found.", 404)
    try:
        questions = generate_quiz(s["vector_store"], topic=body.get("topic", ""), num_questions=int(body.get("num_questions", 5)))
        return jsonify({"questions": questions})
    except Exception as e:
        return err(str(e), 500)

@app.post("/api/chat")
def chat():
    body = request.get_json(silent=True) or {}
    s = sessions.get(body.get("session_id", ""))
    if not s: return err("Session not found.", 404)
    message = (body.get("message") or "").strip()
    if not message: return err("Message cannot be empty.")
    try:
        reply = answer_question(s["vector_store"], message, body.get("history", []))
        return jsonify({"reply": reply})
    except Exception as e:
        return err(str(e), 500)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    if os.path.exists(os.path.join(dist, "index.html")):
        return send_from_directory(dist, "index.html")
    return err("Frontend not built. Run: cd frontend && npm run build", 404)

if __name__ == "__main__":
    app.run(debug=True, port=8000)

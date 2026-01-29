const notesList = document.getElementById("notesList");
const fab = document.getElementById("fab");
const editor = document.getElementById("editor");
const textInput = document.getElementById("textInput");
const unlockTimeInput = document.getElementById("unlockTime");
const lockBtn = document.getElementById("lockBtn");

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let confirmStep = false;

/* ---------- MODAL ---------- */
function openModal() {
  editor.classList.add("show");
  document.body.classList.add("modal-open");
  textInput.focus();
}

function closeModal() {
  editor.classList.remove("show");
  document.body.classList.remove("modal-open");

  // Reset confirm state safely
  confirmStep = false;
  lockBtn.textContent = "Lock Note";
  
  // Clear inputs
  textInput.value = "";
  unlockTimeInput.value = "";
}

fab.onclick = openModal;

editor.onclick = e => {
  if (e.target === editor) closeModal();
};

// ESC key to close modal
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && editor.classList.contains("show")) {
    closeModal();
  }
});

/* ---------- CRYPTO ---------- */
async function deriveKey(ts) {
  const base = await crypto.subtle.importKey(
    "raw",
    encoder.encode(String(ts)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("text-lock"),
      iterations: 100000,
      hash: "SHA-256"
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encrypt(text, ts) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(ts);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );
  return { iv: [...iv], data: [...new Uint8Array(encrypted)] };
}

async function decrypt(payload, ts) {
  const key = await deriveKey(ts);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(payload.iv) },
    key,
    new Uint8Array(payload.data)
  );
  return decoder.decode(decrypted);
}

/* ---------- STORAGE ---------- */
function loadNotes() {
  return JSON.parse(localStorage.getItem("notes") || "[]");
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

/* ---------- TIME FORMATTING ---------- */
function formatTimeRemaining(ms) {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h remaining`;
  if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s remaining`;
  return `${seconds}s remaining`;
}

/* ---------- UI ---------- */
let isLoading = true;

function showSkeletons(count = 5) {
  notesList.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("li");
    skeleton.className = "skeleton-note";
    skeleton.innerHTML = `
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
    `;
    notesList.appendChild(skeleton);
  }
}

async function renderNotes() {
  const notes = loadNotes();
  const now = Date.now();

  // Show loading skeletons on first load
  if (isLoading) {
    showSkeletons();
    isLoading = false;
    // Short delay to show skeleton effect
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  notesList.innerHTML = "";

  // Show empty state if no notes
  if (notes.length === 0) {
    notesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔒</div>
        <p><strong>No locked notes yet</strong></p>
        <p>Create your first time-locked note using the + button</p>
      </div>
    `;
    return;
  }

  for (let i = notes.length - 1; i >= 0; i--) {
    const note = notes[i];
    const li = document.createElement("li");
    li.className = "note";

    /* Auto-remove after viewing window */
    if (note.viewUntil && now > note.viewUntil) {
      notes.splice(i, 1);
      saveNotes(notes);
      continue;
    }

    /* Still locked */
    if (now < note.unlockTime) {
      li.innerHTML = `
        <strong>Locked</strong>
        <small>${formatTimeRemaining(note.unlockTime - now)}</small>
      `;
    }

    /* Ready to unlock */
    else if (!note.unlocked) {
      li.innerHTML = `
        <strong>Ready to Unlock</strong>
        <small>Unlock time has been reached</small>
      `;

      const btn = document.createElement("button");
      btn.textContent = "🔓 Reveal Text";
      btn.onclick = async () => {
        const ok = confirm("Reveal this text? You will have 20 minutes to view it before it's permanently deleted.");
        if (!ok) return;

        try {
          note.plaintext = await decrypt(note.encrypted, note.unlockTime);
          note.unlocked = true;
          note.viewUntil = Date.now() + 20 * 60 * 1000;
          saveNotes(notes);
          renderNotes();
        } catch (error) {
          alert("Failed to decrypt note. It may be corrupted.");
          console.error(error);
        }
      };

      li.appendChild(btn);
    }

    /* Unlocked + viewing */
    else {
      const timeLeft = note.viewUntil - now;
      li.innerHTML = `
        <strong>Unlocked</strong>
        <small>View time remaining: ${formatTimeRemaining(timeLeft)}</small>
        <pre>${escapeHtml(note.plaintext)}</pre>
      `;
    }

    notesList.appendChild(li);
  }
}

/* ---------- UTILITY ---------- */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ---------- EVENTS ---------- */
lockBtn.onclick = async () => {
  const text = textInput.value.trim();
  const unlockTimeValue = unlockTimeInput.value;
  
  if (!text) {
    alert("Please enter some text to lock");
    textInput.focus();
    return;
  }
  
  if (!unlockTimeValue) {
    alert("Please select an unlock time");
    unlockTimeInput.focus();
    return;
  }
  
  const ts = new Date(unlockTimeValue).getTime();
  const now = Date.now();
  
  if (ts <= now) {
    alert("Unlock time must be in the future");
    unlockTimeInput.focus();
    return;
  }

  if (!confirmStep) {
    confirmStep = true;
    lockBtn.textContent = "✓ Confirm Lock";
    lockBtn.style.background = "var(--success)";
    return;
  }

  try {
    const encrypted = await encrypt(text, ts);
    const notes = loadNotes();
    notes.push({ encrypted, unlockTime: ts });

    saveNotes(notes);
    closeModal();
    renderNotes();
  } catch (error) {
    alert("Failed to encrypt note. Please try again.");
    console.error(error);
  }
};

// Reset confirm step when input changes
textInput.oninput = () => {
  if (confirmStep) {
    confirmStep = false;
    lockBtn.textContent = "Lock Note";
    lockBtn.style.background = "";
  }
};

unlockTimeInput.onchange = () => {
  if (confirmStep) {
    confirmStep = false;
    lockBtn.textContent = "Lock Note";
    lockBtn.style.background = "";
  }
};

// Update UI every second
setInterval(renderNotes, 1000);

// Initial render
renderNotes();
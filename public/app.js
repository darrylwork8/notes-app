const API = '/api/notes';

let editingId = null;

const grid       = document.getElementById('notes-grid');
const emptyMsg   = document.getElementById('empty-msg');
const overlay    = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const inputTitle = document.getElementById('input-title');
const inputContent = document.getElementById('input-content');

document.getElementById('btn-new').addEventListener('click', () => openModal());
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('btn-save').addEventListener('click', saveNote);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

function openModal(note = null) {
  editingId = note ? note.id : null;
  modalTitle.textContent = note ? 'Edit Note' : 'New Note';
  inputTitle.value = note ? note.title : '';
  inputContent.value = note ? note.content : '';
  overlay.classList.remove('hidden');
  inputTitle.focus();
}

function closeModal() {
  overlay.classList.add('hidden');
  editingId = null;
}

async function saveNote() {
  const title = inputTitle.value.trim();
  const content = inputContent.value.trim();
  if (!title) { inputTitle.focus(); return; }

  const method = editingId ? 'PUT' : 'POST';
  const url    = editingId ? `${API}/${editingId}` : API;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, content }),
  });

  closeModal();
  loadNotes();
}

async function deleteNote(id) {
  if (!confirm('Delete this note?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadNotes();
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function renderNotes(notes) {
  const cards = grid.querySelectorAll('.note-card');
  cards.forEach(c => c.remove());

  if (!notes.length) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <h3>${escHtml(note.title)}</h3>
      <p>${escHtml(note.content)}</p>
      <span class="note-meta">Created ${formatDate(note.created_at)}</span>
      <div class="note-actions">
        <button class="btn btn-secondary btn-edit">Edit</button>
        <button class="btn btn-danger btn-delete">Delete</button>
      </div>`;
    card.querySelector('.btn-edit').addEventListener('click', () => openModal(note));
    card.querySelector('.btn-delete').addEventListener('click', () => deleteNote(note.id));
    grid.appendChild(card);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadNotes() {
  const res = await fetch(API);
  const notes = await res.json();
  renderNotes(notes);
}

loadNotes();

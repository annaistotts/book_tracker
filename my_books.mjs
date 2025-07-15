// Modal and Add/Edit Folder Logic for My Books

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-folder-btn');
  const modal = document.getElementById('add-folder-modal');
  const closeModal = document.getElementById('close-modal');
  const form = document.getElementById('add-folder-form');
  const foldersGrid = document.querySelector('.folders-grid');
  const emptyState = document.getElementById('empty-state');
  const STORAGE_KEY = 'myBooksFolders';

  // Edit modal elements
  const editModal = document.getElementById('edit-folder-modal');
  const closeEditModal = document.getElementById('close-edit-modal');
  const editForm = document.getElementById('edit-folder-form');
  const editTitleInput = document.getElementById('edit-folder-title');
  const editEmojiSelect = document.getElementById('edit-folder-emoji');
  const deleteBtn = document.getElementById('delete-folder-btn');

  let editingIndex = null;

  const searchInput = document.querySelector('.search-input');

  // Helper: Render a folder item
  function renderFolder({emoji, title}, index) {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder-item';
    folderDiv.innerHTML = `
      <div class="folder-icon">
        <button class="folder-edit-btn" title="Edit Folder" data-index="${index}">
          <img src="images/pencil-simple.svg" alt="Edit">
        </button>
        <span>${emoji}</span>
      </div>
      <div class="folder-title"></div>
    `;
    folderDiv.querySelector('.folder-title').textContent = title;
    folderDiv.querySelector('.folder-edit-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditModal(index);
    });
    foldersGrid.appendChild(folderDiv);
  }

  // Show/hide empty state
  function updateEmptyState(folders) {
    if (folders.length === 0) {
      emptyState.style.display = '';
    } else {
      emptyState.style.display = 'none';
    }
  }

  // Filter and render folders by search
  function renderFilteredFolders(query) {
    const folders = getFolders();
    const filtered = folders.filter(f => f.title.toLowerCase().includes(query.toLowerCase()));
    foldersGrid.innerHTML = '';
    filtered.forEach((folder, i) => renderFolder(folder, folders.indexOf(folder)));
    updateEmptyState(filtered);
  }

  // Search bar event
  searchInput.addEventListener('input', (e) => {
    renderFilteredFolders(e.target.value);
  });

  // Load folders from localStorage
  function loadFolders() {
    const query = searchInput.value;
    if (query) {
      renderFilteredFolders(query);
    } else {
      foldersGrid.innerHTML = '';
      const folders = getFolders();
      folders.forEach((folder, i) => renderFolder(folder, i));
      updateEmptyState(folders);
    }
  }

  // Save folders to localStorage
  function saveFolders(folders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  }

  // Get folders from localStorage
  function getFolders() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  // Open modal
  addBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    form.reset();
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  });

  // Close modal when clicking outside modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // Handle form submission (Add)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = form['folder-title'].value.trim();
    const emoji = form['folder-emoji'].value;
    if (!title) return;
    const folders = getFolders();
    folders.push({ emoji, title });
    saveFolders(folders);
    loadFolders();
    modal.style.display = 'none';
    document.body.style.overflow = '';
  });

  // --- Edit Modal Logic ---
  function openEditModal(index) {
    const folders = getFolders();
    const folder = folders[index];
    if (!folder) return;
    editingIndex = index;
    editTitleInput.value = folder.title;
    editEmojiSelect.value = folder.emoji;
    editModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  closeEditModal.addEventListener('click', () => {
    editModal.style.display = 'none';
    document.body.style.overflow = '';
    editingIndex = null;
  });

  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
      editModal.style.display = 'none';
      document.body.style.overflow = '';
      editingIndex = null;
    }
  });

  // Save changes (Edit)
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (editingIndex === null) return;
    const folders = getFolders();
    folders[editingIndex] = {
      emoji: editEmojiSelect.value,
      title: editTitleInput.value.trim()
    };
    saveFolders(folders);
    loadFolders();
    editModal.style.display = 'none';
    document.body.style.overflow = '';
    editingIndex = null;
  });

  // Delete folder
  deleteBtn.addEventListener('click', () => {
    if (editingIndex === null) return;
    const folders = getFolders();
    folders.splice(editingIndex, 1);
    saveFolders(folders);
    loadFolders();
    editModal.style.display = 'none';
    document.body.style.overflow = '';
    editingIndex = null;
  });

  // Initial load
  loadFolders();
}); 
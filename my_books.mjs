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
    folderDiv.style.cursor = 'pointer';
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
    // Make folder clickable to open
    folderDiv.addEventListener('click', (e) => {
      if (e.target.closest('.folder-edit-btn')) return;
      window.location.href = `my_books.html?folder=${index}`;
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

  // --- Folder Contents View ---
  const folderContentsSection = document.getElementById('folder-contents-section');
  const folderContentsTitle = document.getElementById('folder-contents-title');
  const folderBooksGrid = document.getElementById('folder-books-grid');
  const folderEmptyState = document.getElementById('folder-empty-state');
  const backToFoldersBtn = document.getElementById('back-to-folders');

  function getUrlParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function showFolderContents(index) {
    const folders = getFolders();
    const folder = folders[index];
    if (!folder) return;
    // Hide folder list, show folder contents
    document.querySelector('.folders-section').style.display = 'none';
    folderContentsSection.style.display = '';
    folderContentsTitle.textContent = `${folder.emoji} ${folder.title}`;
    folderBooksGrid.innerHTML = '';
    folderBooksGrid.className = 'book-grid'; // Use the same grid as discover.html
    const books = folder.books || [];
    if (books.length === 0) {
      folderEmptyState.style.display = '';
    } else {
      folderEmptyState.style.display = 'none';
      books.forEach((book, bookIdx) => {
        // Container for cover + meta
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'stretch';
        container.style.width = '220px';
        // Book cover
        const coverDiv = document.createElement('div');
        coverDiv.className = 'book-cover';
        coverDiv.style.width = '220px';
        coverDiv.style.height = '330px';
        coverDiv.style.margin = '0';
        // Make the cover a link
        const coverLink = document.createElement('a');
        coverLink.href = book.infoLink;
        coverLink.target = '_blank';
        coverLink.rel = 'noopener';
        coverLink.style.display = 'block';
        coverLink.style.width = '100%';
        coverLink.style.height = '100%';
        coverLink.style.overflow = 'hidden';
        coverLink.innerHTML = `<img src="${book.image}" alt="${book.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;border:none;" />`;
        coverDiv.appendChild(coverLink);
        // Title row (below cover)
        const titleRow = document.createElement('div');
        titleRow.className = 'book-title-row';
        titleRow.style.width = '220px';
        titleRow.style.marginTop = '0.5rem';
        const title = document.createElement('div');
        title.className = 'book-title';
        title.textContent = book.title;
        title.style.fontSize = '1rem';
        title.style.fontWeight = '600';
        title.style.overflow = 'hidden';
        title.style.textOverflow = 'ellipsis';
        title.style.whiteSpace = 'nowrap';
        titleRow.appendChild(title);
        // Actions row (Mark as read + Remove)
        const actionsRow = document.createElement('div');
        actionsRow.className = 'book-actions-row';
        actionsRow.style.display = 'flex';
        actionsRow.style.justifyContent = 'space-between';
        actionsRow.style.alignItems = 'center';
        actionsRow.style.width = '220px';
        actionsRow.style.marginTop = '0.5rem';
        // Mark as read button
        const markReadBtn = document.createElement('button');
        markReadBtn.className = 'modal-add-btn';
        markReadBtn.textContent = 'Mark as read';
        markReadBtn.style.flex = '1';
        markReadBtn.style.marginRight = '0.5rem';
        // TODO: Add mark as read logic if needed
        // Remove (minus) button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'circle-remove-btn';
        removeBtn.title = 'Remove from folder';
        removeBtn.innerHTML = '<span class="minus-icon">&minus;</span>';
        removeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          removeBookFromFolder(index, book.infoLink);
        });
        actionsRow.appendChild(markReadBtn);
        actionsRow.appendChild(removeBtn);
        container.appendChild(coverDiv);
        container.appendChild(titleRow);
        container.appendChild(actionsRow);
        folderBooksGrid.appendChild(container);
      });
    }
  }

  function removeBookFromFolder(folderIdx, infoLink) {
    const folders = getFolders();
    if (!folders[folderIdx] || !folders[folderIdx].books) return;
    folders[folderIdx].books = folders[folderIdx].books.filter(b => b.infoLink !== infoLink);
    saveFolders(folders);
    showFolderContents(folderIdx);
  }

  if (backToFoldersBtn) {
    backToFoldersBtn.addEventListener('click', () => {
      window.location.href = 'my_books.html';
    });
  }

  // On load, check for folder param
  const folderParam = getUrlParam('folder');
  if (folderParam !== null) {
    document.querySelector('.folders-section').style.display = 'none';
    folderContentsSection.style.display = '';
    showFolderContents(Number(folderParam));
  } else {
    document.querySelector('.folders-section').style.display = '';
    folderContentsSection.style.display = 'none';
  }

  // Initial load
  loadFolders();
}); 
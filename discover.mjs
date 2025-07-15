// Google Books API integration for discover.html

const categories = [
  { name: 'Sci-Fi', query: 'science fiction', sectionTitle: 'Sci-Fi' },
  { name: 'Fantasy', query: 'fantasy', sectionTitle: 'Fantasy' },
  { name: 'Adventure', query: 'adventure', sectionTitle: 'Adventure' },
  { name: 'Romance', query: 'romance', sectionTitle: 'Romance' },
];

const API_URL = 'https://www.googleapis.com/books/v1/volumes?q=subject:';
const MAX_BOOKS = 4; // Number of covers to show per category
const PAGE_SIZE = 28;

function getSectionByTitle(title) {
  return Array.from(document.querySelectorAll('.section')).find(
    section => section.querySelector('.section-title')?.textContent.trim() === title
  );
}

function getBestImage(item) {
  const imageLinks = item.volumeInfo.imageLinks || {};
  const best =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail;
  if (best) return best;
  if (item.id) {
    return `https://books.google.com/books/content?id=${item.id}&printsec=frontcover&img=1&zoom=3`;
  }
  return '';
}

function getCategoryByName(name) {
  return categories.find(cat => cat.name === name || cat.sectionTitle === name);
}

function getUrlParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function setupViewAllButtons() {
  document.querySelectorAll('.view-all-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const cat = btn.getAttribute('data-category');
      window.location.href = `discover.html?category=${encodeURIComponent(cat)}`;
    });
  });
}

async function fetchBooks(category, startIndex = 0, maxResults = MAX_BOOKS) {
  const url = `${API_URL}${encodeURIComponent(category.query)}&orderBy=relevance&maxResults=${maxResults}&startIndex=${startIndex}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.items) {
    console.warn(`No books found for category: ${category.name}`, data);
    return [];
  }
  const books = data.items
    .map(item => ({
      title: item.volumeInfo.title,
      image: getBestImage(item),
      infoLink: item.volumeInfo.infoLink || '#',
    }))
    .filter(book => book.image)
    .sort((a, b) => a.title.localeCompare(b.title));
  if (books.length === 0) {
    console.warn(`No books with images found for category: ${category.name}`, data.items);
  }
  return books;
}

// --- Book Grid Rendering with Save Button ---
function renderBookGrid(section, books) {
  const grid = section.querySelector('.book-grid');
  grid.innerHTML = '';
  books.forEach(book => {
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
    // Title + Save row (below cover)
    const belowDiv = document.createElement('div');
    belowDiv.className = 'book-meta-row';
    belowDiv.style.width = '220px';
    // Title
    const title = document.createElement('div');
    title.className = 'book-title';
    title.textContent = book.title;
    title.style.flex = '1';
    title.style.fontSize = '0.95rem';
    title.style.overflow = 'hidden';
    title.style.textOverflow = 'ellipsis';
    title.style.whiteSpace = 'nowrap';
    // Save button
    const saveBtn = document.createElement('button');
    saveBtn.className = 'circle-add-btn';
    saveBtn.title = 'Save to folder';
    saveBtn.innerHTML = '<span class="plus-icon">+</span>';
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openSaveModal(book);
    });
    belowDiv.appendChild(title);
    belowDiv.appendChild(saveBtn);
    container.appendChild(coverDiv);
    container.appendChild(belowDiv);
    grid.appendChild(container);
  });
}

// --- Save Modal Logic ---
const SAVE_STORAGE_KEY = 'myBooksFolders';
let bookToSave = null;
function openSaveModal(book) {
  bookToSave = book;
  const modal = document.getElementById('save-folder-modal');
  const closeModal = document.getElementById('close-save-modal');
  const form = document.getElementById('save-folder-form');
  const folderList = document.getElementById('save-folder-list');
  // Load folders from localStorage
  const folders = JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY) || '[]');
  folderList.innerHTML = '';
  if (folders.length === 0) {
    folderList.innerHTML = '<div style="margin-bottom:1rem;">No folders available. Create folders in My Books first.</div>';
  } else {
    folders.forEach((folder, idx) => {
      const id = `save-folder-checkbox-${idx}`;
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.marginBottom = '0.5rem';
      div.innerHTML = `<input type="checkbox" id="${id}" name="folders" value="${idx}"><label for="${id}" style="margin-left:0.5rem;">${folder.emoji} ${folder.title}</label>`;
      folderList.appendChild(div);
    });
  }
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // Close logic
  closeModal.onclick = () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    bookToSave = null;
  };
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      bookToSave = null;
    }
  };
  // Form submit
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!bookToSave) return;
    const checked = Array.from(form.querySelectorAll('input[name="folders"]:checked')).map(cb => parseInt(cb.value));
    if (checked.length === 0) return;
    // Save book to selected folders
    const folders = JSON.parse(localStorage.getItem(SAVE_STORAGE_KEY) || '[]');
    checked.forEach(idx => {
      if (!folders[idx].books) folders[idx].books = [];
      // Avoid duplicate by infoLink
      if (!folders[idx].books.some(b => b.infoLink === bookToSave.infoLink)) {
        folders[idx].books.push({
          title: bookToSave.title,
          image: bookToSave.image,
          infoLink: bookToSave.infoLink
        });
      }
    });
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(folders));
    modal.style.display = 'none';
    document.body.style.overflow = '';
    bookToSave = null;
  };
}

// --- Update displayCovers to use new grid ---
async function displayCovers() {
  for (const category of categories) {
    const section = getSectionByTitle(category.sectionTitle);
    if (!section) continue;
    const grid = section.querySelector('.book-grid');
    const books = (await fetchBooks(category)).filter(book => book.image);
    renderBookGrid(section, books);
  }
}

// --- View All Page Logic ---
async function displayViewAll(categoryName) {
  const category = getCategoryByName(categoryName);
  if (!category) return;
  // Hide all sections except the one for this category
  document.querySelectorAll('.section').forEach(section => {
    const title = section.querySelector('.section-title')?.textContent.trim();
    if (title !== category.sectionTitle) {
      section.style.display = 'none';
    } else {
      section.style.display = 'block';
    }
  });
  // Remove the book grid and view all button, replace with a new grid
  const section = getSectionByTitle(category.sectionTitle);
  if (!section) return;
  let grid = section.querySelector('.book-grid');
  if (grid) grid.remove();
  let btn = section.querySelector('.view-all-btn');
  if (btn) btn.remove();
  // Create new grid
  grid = document.createElement('div');
  grid.className = 'book-grid';
  section.appendChild(grid);
  // Add Load More button
  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'view-all-btn';
  loadMoreBtn.textContent = 'Load More';
  section.appendChild(loadMoreBtn);
  let startIndex = 0;
  let allLoaded = false;
  let allBooks = [];
  async function loadMore() {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
    const books = (await fetchBooks(category, startIndex, PAGE_SIZE)).filter(book => book.image);
    // Append new books to allBooks
    allBooks = allBooks.concat(books);
    // Only render the new books (append to grid)
    books.forEach(book => {
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
      // Title + Save row (below cover)
      const belowDiv = document.createElement('div');
      belowDiv.className = 'book-meta-row';
      belowDiv.style.width = '220px';
      // Title
      const title = document.createElement('div');
      title.className = 'book-title';
      title.textContent = book.title;
      title.style.flex = '1';
      title.style.fontSize = '0.95rem';
      title.style.overflow = 'hidden';
      title.style.textOverflow = 'ellipsis';
      title.style.whiteSpace = 'nowrap';
      // Save button
      const saveBtn = document.createElement('button');
      saveBtn.className = 'circle-add-btn';
      saveBtn.title = 'Save to folder';
      saveBtn.innerHTML = '<span class="plus-icon">+</span>';
      saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openSaveModal(book);
      });
      belowDiv.appendChild(title);
      belowDiv.appendChild(saveBtn);
      container.appendChild(coverDiv);
      container.appendChild(belowDiv);
      grid.appendChild(container);
    });
    startIndex += PAGE_SIZE;
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load More';
    if (books.length < PAGE_SIZE) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'No More Books';
      allLoaded = true;
    }
  }
  loadMoreBtn.addEventListener('click', loadMore);
  // Initial load
  await loadMore();
}

// --- Init ---
const categoryParam = getUrlParam('category');
if (categoryParam) {
  displayViewAll(categoryParam);
} else {
  displayCovers();
  setupViewAllButtons();
} 
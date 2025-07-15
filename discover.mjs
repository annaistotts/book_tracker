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

async function displayCovers() {
  for (const category of categories) {
    const section = getSectionByTitle(category.sectionTitle);
    if (!section) continue;
    const covers = section.querySelectorAll('.book-cover');
    const books = (await fetchBooks(category)).filter(book => book.image);
    covers.forEach((coverDiv, i) => {
      coverDiv.style.position = 'relative';
      coverDiv.style.overflow = 'hidden';
      if (i < books.length) {
        coverDiv.innerHTML = `<a href="${books[i].infoLink}" target="_blank" rel="noopener" style="display:block;width:100%;height:100%"><img src="${books[i].image}" alt="${books[i].title}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:8px;border:none;" /></a>`;
        coverDiv.style.background = 'none';
        coverDiv.style.display = 'block';
      } else {
        coverDiv.style.display = 'none'; // Hide unused slots
      }
    });
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
  async function loadMore() {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';
    const books = (await fetchBooks(category, startIndex, PAGE_SIZE)).filter(book => book.image);
    books.forEach(book => {
      const coverDiv = document.createElement('div');
      coverDiv.className = 'book-cover';
      coverDiv.style.position = 'relative';
      coverDiv.style.overflow = 'hidden';
      coverDiv.innerHTML = `<a href="${book.infoLink}" target="_blank" rel="noopener" style="display:block;width:100%;height:100%"><img src="${book.image}" alt="${book.title}" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;border-radius:8px;border:none;" /></a>`;
      grid.appendChild(coverDiv);
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
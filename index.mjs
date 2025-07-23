// Book data for Continue Reading
const continueBooks = [
  { title: 'Dune', query: 'Dune Frank Herbert' },
  { title: '1984', query: '1984 George Orwell' },
  { title: 'To Kill a Mockingbird', query: 'To Kill a Mockingbird Harper Lee' },
  { title: 'Pride and Prejudice', query: 'Pride and Prejudice Jane Austen' }
];

function getBestImage(volumeInfo) {
  const imageLinks = volumeInfo.imageLinks || {};
  return (
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    ''
  );
}

async function fetchGoogleBooksData(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.items && data.items[0] && data.items[0].volumeInfo) {
      const info = data.items[0].volumeInfo;
      return {
        title: info.title,
        cover: getBestImage(info),
        infoLink: info.infoLink || '#'
      };
    }
  } catch (e) {}
  return { title: query, cover: '', infoLink: '#' };
}

async function renderContinueReading() {
  const grid = document.getElementById('continue-reading-grid');
  if (!grid) return;
  grid.innerHTML = '';
  // Fetch all book data in parallel
  const booksData = await Promise.all(continueBooks.map(book => fetchGoogleBooksData(book.query)));
  for (const apiBook of booksData) {
    const a = document.createElement('a');
    a.href = apiBook.infoLink;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'book-link';
    a.innerHTML = `
      <div class="book-item">
        <div class="book-icon" style="background-image: url('${apiBook.cover}');"></div>
        <div class="book-info"><h4>${apiBook.title}</h4></div>
      </div>
    `;
    grid.appendChild(a);
  }
}

import { displayCovers, setupViewAllButtons } from './discover.mjs';

document.addEventListener('DOMContentLoaded', () => {
  renderContinueReading();
  // Only run discover logic if not on discover.html
  if (!window.location.pathname.endsWith('discover.html')) {
    displayCovers();
    setupViewAllButtons();
  }
}); 
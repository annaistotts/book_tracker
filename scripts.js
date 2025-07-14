document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-menu');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('show');
    });
  }

  // Review Form
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const title = document.getElementById('book-title').value;
      const review = document.getElementById('review-text').value;

      const newReview = { title, review };
      let reviews = JSON.parse(localStorage.getItem('bookReviews')) || [];
      reviews.push(newReview);
      localStorage.setItem('bookReviews', JSON.stringify(reviews));

      alert('Review saved!');
      reviewForm.reset();
    });
  }

  // Load Reviews on Profile Page
  const reviewList = document.getElementById('review-list');
  if (reviewList) {
    const reviews = JSON.parse(localStorage.getItem('bookReviews')) || [];

    reviews.forEach(review => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${review.title}:</strong> ${review.review}`;
      reviewList.appendChild(li);
    });
  }
});


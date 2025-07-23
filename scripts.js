document.addEventListener("DOMContentLoaded", function () {
  //Load saved profile from localStorage
  const savedProfile = JSON.parse(localStorage.getItem("userProfile"));

  //Update top-right profile icon on all pages
  const profileIcon = document.getElementById("profile-icon");
  if (profileIcon && savedProfile && savedProfile.username) {
    profileIcon.textContent = savedProfile.username.charAt(0).toUpperCase();
  }

  //Mobile Menu Toggle
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-menu');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('show');
    });
  }

  //Profile Form Handling
  const profileForm = document.getElementById("profile-form");

  function updateDisplayedProfile(profile) {
    const usernameDisplay = document.getElementById("profile-username");
    const profileIcon = document.getElementById("profile-icon");
    const profileBubble = document.getElementById("profile-bubble");
    const profileBio = document.getElementById("profile-bio");

    if (usernameDisplay && profile.username) {
      usernameDisplay.textContent = profile.username;
    }

    if (profileIcon && profile.username) {
      profileIcon.textContent = profile.username.charAt(0).toUpperCase();
    }

    if (profileBubble && profile.username) {
      profileBubble.textContent = profile.username.charAt(0).toUpperCase();
    }

    if (profileBio && profile.bio) {
      profileBio.textContent = profile.bio;
    }
  }

  //Fill form fields and profile display if data exists
  if (savedProfile) {
    //Only populate form if it exists (on profile page)
    if (profileForm) {
      document.getElementById("username").value = savedProfile.username || "";
      document.getElementById("first-name").value = savedProfile.firstName || "";
      document.getElementById("last-name").value = savedProfile.lastName || "";
      document.getElementById("email").value = savedProfile.email || "";
      document.getElementById("bio").value = savedProfile.bio || "";
    }

    //Update username and bio display
    updateDisplayedProfile(savedProfile);
  }

  //Save form data to localStorage on submit
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const profileData = {
        username: document.getElementById("username").value.trim(),
        firstName: document.getElementById("first-name").value.trim(),
        lastName: document.getElementById("last-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        bio: document.getElementById("bio").value.trim(),
      };

      localStorage.setItem("userProfile", JSON.stringify(profileData));
      updateDisplayedProfile(profileData);
      alert("Profile saved successfully!");
    });
  }

  // --- STREAKS SECTION LOGIC ---
  const streakGrid = document.querySelector('.streak-grid');
  const streakDots = streakGrid ? Array.from(streakGrid.querySelectorAll('.streak-dot')) : [];
  const markBtn = document.getElementById('mark-read-btn');
  const clearBtn = document.getElementById('clear-streak-btn');
  const STREAK_KEY = 'readingStreakDays';
  const NUM_DAYS = streakDots.length;

  // Load streak state from localStorage or default to all false
  let streakState = Array(NUM_DAYS).fill(false);
  const stored = JSON.parse(localStorage.getItem(STREAK_KEY));
  if (Array.isArray(stored) && stored.length === NUM_DAYS) {
    streakState = stored;
  }

  // Selection state (for multi-select)
  let selected = [];

  function renderStreak() {
    streakDots.forEach((dot, i) => {
      dot.classList.toggle('selected', selected.includes(i));
      dot.classList.toggle('marked', streakState[i]);
      if (streakState[i]) {
        dot.style.boxShadow = '0 0 0 3px #3b82f6aa';
        dot.style.opacity = '1';
      } else {
        dot.style.boxShadow = '';
        dot.style.opacity = '0.5';
      }
    });
    updateButtonText();
    updateClearButton();
  }

  function updateButtonText() {
    if (!markBtn) return;
    if (selected.length === 0) {
      // Only today (last dot) is relevant
      if (streakState[NUM_DAYS-1]) {
        markBtn.textContent = 'Unmark Today';
      } else {
        markBtn.textContent = 'Mark Today';
      }
    } else {
      // Multi-select
      const allMarked = selected.every(i => streakState[i]);
      if (allMarked) {
        markBtn.textContent = 'Unmark Selection';
      } else {
        markBtn.textContent = 'Mark Selection';
      }
    }
  }

  function updateClearButton() {
    if (!clearBtn) return;
    if (selected.length > 0) {
      clearBtn.style.display = '';
      clearBtn.textContent = 'Clear Selection';
    } else {
      clearBtn.style.display = 'none';
    }
  }

  // Dot click handler
  streakDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === NUM_DAYS-1) {
        // Today dot: single select
        selected = [];
        renderStreak();
      } else {
        // Toggle selection for manual days
        if (selected.includes(i)) {
          selected = selected.filter(idx => idx !== i);
        } else {
          selected.push(i);
        }
        renderStreak();
      }
    });
  });

  // Mark/Unmark button handler
  if (markBtn) {
    markBtn.addEventListener('click', () => {
      if (selected.length === 0) {
        // Today
        streakState[NUM_DAYS-1] = !streakState[NUM_DAYS-1];
      } else {
        const allMarked = selected.every(i => streakState[i]);
        selected.forEach(i => {
          streakState[i] = allMarked ? false : true;
        });
      }
      localStorage.setItem(STREAK_KEY, JSON.stringify(streakState));
      selected = [];
      renderStreak();
    });
  }

  // Clear button handler
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      selected = [];
      renderStreak();
    });
  }

  // Initial render
  renderStreak();
});

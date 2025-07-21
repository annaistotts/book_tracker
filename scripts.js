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
});

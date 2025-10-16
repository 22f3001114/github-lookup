const form = document.getElementById('github-form');
const usernameInput = document.getElementById('github-username');
const gitStatus = document.getElementById('github-status');
const accountAgeDiv = document.getElementById('github-account-age');

const getAccountAgeInYears = (createdDateStr) => {
  const createdDate = new Date(createdDateStr);
  const now = new Date();
  let years = now.getFullYear() - createdDate.getFullYear();
  // Adjust if creation month/day hasn't arrived yet this year
  if (
    now.getMonth() < createdDate.getMonth() ||
    (now.getMonth() === createdDate.getMonth() && now.getDate() < createdDate.getDate())
  ) {
    years -= 1;
  }
  return years;
};

const LOCAL_KEY_PREFIX = 'github-user-';

function showStatus(message) {
  gitStatus.textContent = message;
}

function showAccountAge(ageYears, createdAt) {
  accountAgeDiv.textContent = `${ageYears} years (Created: ${createdAt.slice(0, 10)})`;
}

async function lookupGitHubUser(username) {
  showStatus('Lookup started...');
  accountAgeDiv.textContent = '';
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error('User not found');
    const data = await res.json();
    const createdAt = data.created_at;
    const ageYears = getAccountAgeInYears(createdAt);
    if (ageYears >= 0 && createdAt) {
      showAccountAge(ageYears, createdAt);
      showStatus('Lookup succeeded!');
      // Cache result in localStorage
      localStorage.setItem(`${LOCAL_KEY_PREFIX}${username}`, JSON.stringify({
        username,
        ageYears,
        createdAt
      }));
    } else {
      showStatus('Failed: could not calculate account age.');
    }
  } catch (err) {
    showStatus('Lookup failed: ' + err.message);
  }
}

// Submit event
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  if (username) lookupGitHubUser(username);
});

// Repopulate form and info on page load from last successful lookup
window.addEventListener('DOMContentLoaded', () => {
  // Try for every stored key (Optional: loop if you want multiple user cache—usually you can just use a fixed key)
  for (const key in localStorage) {
    if (key.startsWith(LOCAL_KEY_PREFIX)) {
      try {
        const saved = JSON.parse(localStorage.getItem(key));
        usernameInput.value = saved.username;
        showAccountAge(saved.ageYears, saved.createdAt);
        showStatus('Loaded from cache!');
      } catch {}
      break; // Only use the first cache we find
    }
  }
});

const STORAGE_KEY = "thoughtspace_posts_v1";
const form = document.getElementById("post-form");
const postsEl = document.getElementById("posts");
const emptyEl = document.getElementById("empty-state");
const countEl = document.getElementById("post-count");

let posts = [];
try { posts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { posts = []; }

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}

function renderPosts() {
  countEl.textContent = posts.length;
  emptyEl.classList.toggle("hidden", posts.length > 0);
  postsEl.innerHTML = posts.map(post => `
    <article class="post-card" data-post-id="${post.id}">
      <div class="post-meta">
        <span class="post-avatar">${escapeHTML(post.author.trim().charAt(0).toUpperCase() || "A")}</span>
        <span class="post-author">${escapeHTML(post.author)}</span>
        <span>·</span><span>${escapeHTML(post.date)}</span>
      </div>
      <h3>${escapeHTML(post.title)}</h3>
      <p class="post-body">${escapeHTML(post.body)}</p>
      <div class="post-actions">
        <button class="text-button comments-toggle" type="button">♡ ${post.comments.length} comment${post.comments.length === 1 ? "" : "s"}</button>
        <button class="text-button delete-post" type="button">Delete post</button>
      </div>
      <div class="comment-area">
        <div class="comment-list">${post.comments.map(comment => `
          <div class="comment"><strong>${escapeHTML(comment.author)}</strong>${escapeHTML(comment.text)}</div>
        `).join("") || '<p class="hint">No comments yet. Start the conversation.</p>'}</div>
        <form class="comment-form">
          <input name="commentAuthor" maxlength="40" placeholder="Your name" aria-label="Your name" required>
          <input name="commentText" maxlength="500" placeholder="Write a comment..." aria-label="Write a comment" required>
          <button class="button" type="submit">Comment →</button>
        </form>
      </div>
    </article>
  `).join("");
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const author = document.getElementById("author").value.trim();
  const title = document.getElementById("title").value.trim();
  const body = document.getElementById("body").value.trim();
  if (!author || !title || !body) return;
  posts.unshift({
    id: (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    author, title, body,
    date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    comments: []
  });
  savePosts();
  renderPosts();
  form.reset();
  document.getElementById("feed").scrollIntoView({ behavior: "smooth", block: "start" });
});

postsEl.addEventListener("click", event => {
  const card = event.target.closest(".post-card");
  if (!card) return;
  const id = card.dataset.postId;
  if (event.target.closest(".comments-toggle")) {
    card.querySelector(".comment-area").classList.toggle("open");
  }
  if (event.target.closest(".delete-post")) {
    if (confirm("Delete this post and its comments?")) {
      posts = posts.filter(post => post.id !== id);
      savePosts();
      renderPosts();
    }
  }
});

postsEl.addEventListener("submit", event => {
  if (!event.target.matches(".comment-form")) return;
  event.preventDefault();
  const card = event.target.closest(".post-card");
  const post = posts.find(item => item.id === card.dataset.postId);
  const author = event.target.elements.commentAuthor.value.trim();
  const text = event.target.elements.commentText.value.trim();
  if (!post || !author || !text) return;
  post.comments.push({ author, text });
  savePosts();
  renderPosts();
  const updatedCard = postsEl.querySelector(`[data-post-id="${post.id}"]`);
  updatedCard.querySelector(".comment-area").classList.add("open");
});

renderPosts();

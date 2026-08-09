/* ==========================================================================
   Portfolio interactivity — no framework, no build step, no backend.
   Everything here reads from PROJECTS / CATEGORIES in projects-data.js.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  initNavToggle();
  initSmoothScroll();
  initReveal();
  initTrace();
  initProjects();
  initBrief();
});

/* ---------------------------------------------------------------------- */
/* Footer year                                                             */
/* ---------------------------------------------------------------------- */
function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------------------- */
/* Mobile nav                                                               */
/* ---------------------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

/* ---------------------------------------------------------------------- */
/* Smooth scrolling with sticky header offset                             */
/* ---------------------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      anchor.blur();
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = 72;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        if (history.pushState) {
          history.pushState(null, null, targetId);
        } else {
          location.hash = targetId;
        }
      }
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Scroll reveal                                                            */
/* ---------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------------------- */
/* Hero terminal trace — cycles real lines from the work above             */
/* ---------------------------------------------------------------------- */
function initTrace() {
  const body = document.getElementById("traceBody");
  if (!body) return;

  const sequences = [
    [
      { html: '<span class="tag">[agent]</span> anomalous impressions detected: campaign #4471' },
      { html: '<span class="dim">retrieving weather, news, advisory signals…</span>' },
      { html: '<span class="tag">[agent]</span> cross-referencing 3 sources' },
      { html: '<span class="ok">✓ explanation grounded — 2 citations attached</span>' },
    ],
    [
      { html: '<span class="tag">[kpi]</span> reach·frequency·affinity·impressions' },
      { html: '<span class="dim">applying occlusion, illumination, weather factors…</span>' },
      { html: '<span class="ok">✓ 130,482,201 records attributed today</span>' },
    ],
    [
      { html: '<span class="tag">[rag]</span> new workspace: tenant provisioned' },
      { html: '<span class="dim">crawling site → chunking → embedding…</span>' },
      { html: '<span class="ok">✓ demo-ready in 4m 12s, zero data leakage</span>' },
    ],
    [
      { html: '<span class="tag">[vision]</span> frame-level airbag event scan' },
      { html: '<span class="dim">UNet → SAM refinement pass…</span>' },
      { html: '<span class="ok">✓ report generated in 40s (was 35 hrs)</span>' },
    ],
  ];

  let seqIndex = 0;
  let cancelled = false;

  function typeSequence() {
    if (cancelled) return;
    body.innerHTML = "";
    const seq = sequences[seqIndex];
    seq.forEach((line, i) => {
      const div = document.createElement("div");
      div.className = "trace-line";
      div.style.animationDelay = `${i * 0.45}s`;
      div.innerHTML = line.html;
      body.appendChild(div);
    });
    const cursor = document.createElement("span");
    cursor.className = "trace-cursor";
    const last = body.lastElementChild;
    if (last) last.appendChild(document.createTextNode(" ")), last.appendChild(cursor);

    seqIndex = (seqIndex + 1) % sequences.length;
    setTimeout(typeSequence, seq.length * 450 + 2600);
  }

  typeSequence();
}

/* ---------------------------------------------------------------------- */
/* Projects: render, filter, modal                                         */
/* ---------------------------------------------------------------------- */
function initProjects() {
  const grid = document.getElementById("projectGrid");
  const filterRow = document.getElementById("filterRow");
  const noResults = document.getElementById("noResults");
  if (!grid || !filterRow || typeof PROJECTS === "undefined") return;

  let activeFilter = "all";

  // --- render filter chips ---
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.type = "button";
    btn.textContent = cat.label;
    btn.setAttribute("aria-pressed", cat.key === "all" ? "true" : "false");
    btn.dataset.key = cat.key;
    btn.addEventListener("click", () => {
      activeFilter = cat.key;
      filterRow.querySelectorAll(".chip").forEach((c) =>
        c.setAttribute("aria-pressed", String(c.dataset.key === activeFilter))
      );
      renderGrid();
    });
    filterRow.appendChild(btn);
  });

  // --- render cards ---
  function renderGrid() {
    grid.innerHTML = "";
    const visible = PROJECTS.filter(
      (p) => activeFilter === "all" || p.categories.includes(activeFilter)
    );
    noResults.classList.toggle("is-visible", visible.length === 0);

    visible.forEach((p) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "project-card";
      card.setAttribute("aria-haspopup", "dialog");

      const media = p.video
        ? `<video src="${p.video}" poster="${p.poster || ""}" muted loop playsinline preload="none" onmouseenter="this.play()" onmouseleave="this.pause()"></video>`
        : (p.poster
          ? `<img src="${p.poster}" alt="${escapeHtml(p.name)}" style="width:100%;height:100%;object-fit:cover;">`
          : `<div class="no-media">${escapeHtml(p.kicker)}</div>`);

      card.innerHTML = `
        <div class="card-media">
          <span class="card-org-tag">${escapeHtml(p.org.split("—")[0].trim())}</span>
          ${media}
        </div>
        <div class="card-body">
          <div class="card-head-block">
            <div class="card-kicker">${escapeHtml(p.kicker)}</div>
            <div class="card-title">${escapeHtml(p.name)}</div>
          </div>
          <p class="card-hook">${escapeHtml(p.hook)}</p>
          <div class="card-stats">
            ${(p.stats || [])
          .slice(0, 2)
          .map(
            (s) =>
              `<div><div class="cstat-value">${escapeHtml(s.value)}</div><div class="cstat-label">${escapeHtml(s.label)}</div></div>`
          )
          .join("")}
          </div>
          <div class="card-foot"><span>View case study</span><span>→</span></div>
        </div>
      `;
      card.addEventListener("click", () => openModal(p));
      grid.appendChild(card);
    });
  }

  renderGrid();

  // --- modal wiring ---
  const overlay = document.getElementById("modalOverlay");
  const closeBtn = document.getElementById("modalClose");
  let lastFocused = null;

  function openModal(p) {
    lastFocused = document.activeElement;
    document.getElementById("modalOrg").textContent = p.org;
    document.getElementById("modalTitle").textContent = p.name;
    document.getElementById("modalKicker").textContent = p.kicker;

    const media = document.getElementById("modalMedia");
    let mediaHtml = "";
    // if (p.video) {
    //   mediaHtml = `<video src="${p.video}" poster="${p.poster || ""}" muted loop playsinline autoplay controls></video>`;
    // } else if (p.poster) {
    //   mediaHtml = `<img src="${p.poster}" alt="${escapeHtml(p.name)}" style="width:100%;max-height:420px;object-fit:contain;background:#0d0e12;border-radius:4px;display:block;">`;
    // }
    // if (p.extraImage) {
    //   mediaHtml += `<img src="${p.extraImage}" alt="${escapeHtml(p.name)} technical visualization" style="width:100%;max-height:420px;object-fit:contain;background:#0d0e12;border-radius:4px;margin-top:1rem;display:block;">`;
    // }
    // media.innerHTML = mediaHtml;

    if (p.video) {
      mediaHtml = `<video src="${p.video}" poster="${p.poster || ""}" muted loop playsinline autoplay controls
        style="width:100%;height:420px;object-fit:contain;background:#0d0e12;border-radius:4px;display:block;"></video>`;
    } else if (p.poster) {
      mediaHtml = `<img src="${p.poster}" alt="${escapeHtml(p.name)}"
        style="width:100%;height:420px;object-fit:contain;background:#0d0e12;border-radius:4px;display:block;">`;
    } else {
      mediaHtml = `<div class="no-media">${escapeHtml(p.kicker || "No media available")}</div>`;
    }

    if (p.extraImage) {
      mediaHtml += `<img src="${p.extraImage}" alt="${escapeHtml(p.name)} technical visualization"
        style="width:100%;height:420px;object-fit:contain;background:#0d0e12;border-radius:4px;margin-top:1rem;display:block;">`;
    }

    media.innerHTML = mediaHtml;

    const statsEl = document.getElementById("modalStats");
    statsEl.innerHTML = (p.stats || [])
      .map(
        (s) =>
          `<div><div class="cstat-value">${escapeHtml(s.value)}</div><div class="cstat-label">${escapeHtml(s.label)}</div></div>`
      )
      .join("");
    statsEl.style.display = (p.stats || []).length ? "flex" : "none";

    const bodyContent = document.getElementById("modalBodyContent");
    if (p.phases) {
      bodyContent.innerHTML = `
        <div class="modal-section">
          <h4>Three-phase build</h4>
          ${p.phases
          .map(
            (ph) => `
            <div class="modal-phase">
              <h5>${escapeHtml(ph.title)}</h5>
              <p><span class="lbl">Challenge</span>${escapeHtml(ph.challenge)}</p>
              <p><span class="lbl">Solution</span>${escapeHtml(ph.solution)}</p>
            </div>`
          )
          .join("")}
        </div>
      `;
    } else {
      bodyContent.innerHTML = `
        <div class="modal-section">
          <h4>Challenge</h4>
          <ul>${p.challenge.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
        </div>
        <div class="modal-section">
          <h4>Solution</h4>
          <ul>${p.solution.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul>
        </div>
      `;
    }

    document.getElementById("modalTags").innerHTML = (p.tags || [])
      .map((t) => `<span class="pill">${escapeHtml(t)}</span>`)
      .join("");

    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    const vid = document.querySelector("#modalMedia video");
    if (vid) vid.pause();
    if (lastFocused) lastFocused.focus();
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------------------------------------------------------------------- */
/* Contact quick-brief — builds a mailto: link, nothing is stored/sent     */
/* until the visitor's own mail client opens                              */
/* ---------------------------------------------------------------------- */
function initBrief() {
  const roleWrap = document.getElementById("briefRole");
  const areaWrap = document.getElementById("briefArea");
  const notes = document.getElementById("briefNotes");
  const previewText = document.getElementById("briefPreviewText");
  const sendBtn = document.getElementById("briefSend");
  if (!roleWrap || !areaWrap) return;

  const roles = ["Part-time (3 days/week)", "Graduate Program", "Contract role", "Full-time role", "Project-based consulting"];
  const areas = ["Agentic AI / GenAI", "Data Engineering", "Computer Vision", "General advisory"];

  let selectedRole = null;
  let selectedArea = null;

  function makeChips(container, options, onSelect) {
    options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chip-on-ink";
      btn.textContent = opt;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", () => {
        const isPressed = btn.getAttribute("aria-pressed") === "true";
        container.querySelectorAll(".chip-on-ink").forEach((c) => c.setAttribute("aria-pressed", "false"));
        if (!isPressed) {
          btn.setAttribute("aria-pressed", "true");
          onSelect(opt);
        } else {
          onSelect(null);
        }
      });
      container.appendChild(btn);
    });
  }

  makeChips(roleWrap, roles, (val) => {
    selectedRole = val;
    updatePreview();
  });
  makeChips(areaWrap, areas, (val) => {
    selectedArea = val;
    updatePreview();
  });
  notes.addEventListener("input", updatePreview);

  function buildMessage() {
    const role = selectedRole || "a role";
    const area = selectedArea || "your work";
    const extra = notes.value.trim();
    const subject = `Portfolio enquiry — ${selectedRole || "Let's talk"}${selectedArea ? " · " + selectedArea : ""}`;
    let body = `Hi Gagandeep,\n\nI came across your portfolio and I'm reaching out about ${role.toLowerCase()} focused on ${area.toLowerCase()}.\n`;
    if (extra) body += `\n${extra}\n`;
    body += `\nLooking forward to hearing from you.\n`;
    return { subject, body };
  }

  function updatePreview() {
    const { subject, body } = buildMessage();
    previewText.innerHTML = `<strong>${escapeHtml(subject)}</strong> — ${escapeHtml(body.split("\n").filter(Boolean)[1] || body)}`;
    sendBtn.href = `mailto:bhaskargagandeep@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  updatePreview();
}

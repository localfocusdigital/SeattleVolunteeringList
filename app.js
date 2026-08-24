"use strict";

const REGIONS = {
  all: "Everywhere",
  seattle: "Seattle",
  eastside: "Eastside",
  south: "South King County",
  north: "North King & Snohomish",
  regional: "Regional / Statewide"
};

const CATS = {
  hunger: "Hunger & Food",
  housing: "Homelessness & Housing",
  youth: "Youth & Education",
  seniors: "Seniors",
  animals: "Animals",
  enviro: "Environment & Trails",
  health: "Health & Crisis Lines",
  refugees: "Refugees & Immigrants",
  dv: "Safety & DV Support",
  justice: "Justice & Advocacy",
  arts: "Arts & Museums",
  community: "Community & Events"
};

const el = id => document.getElementById(id);
const state = { region: "all", cats: new Set(), q: "" };

function initTheme() {
  const sync = () => {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    el("iconMoon").hidden = dark;
    el("iconSun").hidden = !dark;
  };
  sync();
  el("themeToggle").addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") !== "dark";
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("vps_theme", dark ? "dark" : "light");
    sync();
  });
}

function buildFilters() {
  const rc = el("regionChips");
  Object.entries(REGIONS).forEach(([key, label]) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.dataset.region = key;
    b.textContent = label;
    b.setAttribute("data-active", key === "all" ? "true" : "false");
    b.addEventListener("click", () => {
      state.region = key;
      document.querySelectorAll("#regionChips .chip").forEach(x =>
        x.setAttribute("data-active", x.dataset.region === key ? "true" : "false"));
      render();
    });
    rc.appendChild(b);
  });

  const cc = el("catChips");
  Object.entries(CATS).forEach(([key, label]) => {
    const count = ORGS.filter(o => o.c.includes(key)).length;
    if (!count) return;
    const b = document.createElement("button");
    b.className = "chip cat";
    b.dataset.cat = key;
    b.innerHTML = `${label}<span class="chip-count">${count}</span>`;
    b.setAttribute("data-active", "false");
    b.addEventListener("click", () => {
      state.cats.has(key) ? state.cats.delete(key) : state.cats.add(key);
      b.setAttribute("data-active", state.cats.has(key) ? "true" : "false");
      render();
    });
    cc.appendChild(b);
  });
}

function matches(o) {
  if (state.region !== "all" && o.r !== state.region) return false;
  if (state.cats.size && ![...state.cats].every(c => o.c.includes(c))) return false;
  if (state.q) {
    const hay = `${o.n} ${o.a} ${o.d} ${o.c.map(c => CATS[c]).join(" ")}`.toLowerCase();
    if (!hay.includes(state.q)) return false;
  }
  return true;
}

function card(o) {
  const cardEl = document.createElement("article");
  cardEl.className = "card";
  const tags = o.c.map(c => `<span class="tag">${CATS[c]}</span>`).join("");
  let host;
  try { host = new URL(o.u).hostname.replace(/^www\./, ""); } catch { host = o.u; }
  cardEl.innerHTML =
    `<div class="card-top"><h3>${o.n}</h3><span class="area">${o.a}</span></div>
     <p class="desc">${o.d}</p>
     <div class="tags">${tags}</div>
     <a class="visit" href="${o.u}" target="_blank" rel="noopener">Volunteer info · ${host}
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>
     </a>`;
  return cardEl;
}

function render() {
  const list = ORGS.filter(matches);
  const grid = el("grid");
  grid.innerHTML = "";
  list.forEach((o, i) => {
    const c = card(o);
    c.style.animationDelay = `${Math.min(i * 25, 300)}ms`;
    grid.appendChild(c);
  });
  el("empty").hidden = list.length > 0;
  el("resultCount").textContent = `Showing ${list.length} of ${ORGS.length} organizations`;
}

function initStats() {
  el("stats").innerHTML =
    `<span><b>${ORGS.length}</b> organizations</span>
     <span><b>${CATS_COUNT}</b> causes</span>
     <span><b>6+</b> cities &amp; counties</span>`;
}

const CATS_COUNT = Object.keys(CATS).length;

function init() {
  initTheme();
  buildFilters();

  document.querySelectorAll("[data-region]").forEach(() => {});
  el("search").addEventListener("input", e => {
    state.q = e.target.value.trim().toLowerCase();
    render();
  });

  el("clearFilters").addEventListener("click", () => {
    state.cats.clear();
    state.q = "";
    state.region = "all";
    el("search").value = "";
    document.querySelectorAll("#regionChips .chip").forEach(c =>
      c.setAttribute("data-active", c.dataset.region === "all" ? "true" : "false"));
    document.querySelectorAll("#catChips .chip").forEach(c =>
      c.setAttribute("data-active", "false"));
    render();
  });

  window.addEventListener("scroll", () => {
    document.querySelector(".nav").classList.toggle("scrolled", window.scrollY > 8);
  }, { passive: true });

  const subEl = document.querySelector(".sub");
  if (subEl) subEl.innerHTML = subEl.innerHTML.replace("{{COUNT}}", `<b>${ORGS.length}</b>`);

  initStats();
  render();
}

document.addEventListener("DOMContentLoaded", init);

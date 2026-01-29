/* ============================================================
   GLOBAL STATE
============================================================ */

let players = [];
let gameweeks = [];
let selectedTeam = {
  GK: [],
  DEF: [],
  MID: [],
  FWD: []
};

let budget = 100.0;
let transfersUsed = 0;
const maxTransfers = 2;

/* ============================================================
   INITIAL LOAD
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  await loadPlayers();
  await loadGameweeks();
  loadSavedTeam();
  renderPlayersList();
  renderTeam();
  updateBudgetDisplay();
  updateCountyLimits();
  updatePointsTable();
});

/* ============================================================
   LOAD DATA FILES
============================================================ */

async function loadPlayers() {
  const res = await fetch("data/players.json");
  players = await res.json();
}

async function loadGameweeks() {
  const res = await fetch("data/gameweeks.json");
  gameweeks = await res.json();

  const select = document.getElementById("gameweekSelect");
  gameweeks.forEach(gw => {
    const opt = document.createElement("option");
    opt.value = gw.id;
    opt.textContent = gw.name;
    select.appendChild(opt);
  });

  select.addEventListener("change", updatePointsTable);
}

/* ============================================================
   RENDER PLAYER LIST
============================================================ */

function renderPlayersList() {
  const list = document.getElementById("playersList");
  list.innerHTML = "";

  const posFilter = document.getElementById("positionFilter").value;
  const countyFilter = document.getElementById("countyFilter").value.toLowerCase();
  const searchFilter = document.getElementById("searchFilter").value.toLowerCase();

  const filtered = players.filter(p => {
    const matchesPos = !posFilter || p.position === posFilter;
    const matchesCounty = !countyFilter || p.county.toLowerCase().includes(countyFilter);
    const matchesSearch = !searchFilter || p.name.toLowerCase().includes(searchFilter);
    return matchesPos && matchesCounty && matchesSearch;
  });

  filtered.forEach(player => {
    const card = createPlayerCard(player);
    card.draggable = true;

    card.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", player.id);
    });

    list.appendChild(card);
  });
}

/* ============================================================
   CREATE PLAYER CARD
============================================================ */

function createPlayerCard(player) {
  const card = document.createElement("div");
  card.className = "player-card";
  card.dataset.id = player.id;

  card.innerHTML = `
    <div class="player-info">
      <span class="player-name">${player.name}</span>
      <span class="player-meta">${player.county} · ${player.position}</span>
    </div>
    <div class="player-price">€${player.price.toFixed(1)}m</div>
  `;

  return card;
}

/* ============================================================
   DRAG & DROP TEAM BUILDER
============================================================ */

document.querySelectorAll(".dropzone").forEach(zone => {
  zone.addEventListener("dragover", e => e.preventDefault());

  zone.addEventListener("drop", e => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData("text/plain");
    const player = players.find(p => p.id == playerId);

    if (!player) return;

    const position = zone.dataset.position;
    const max = parseInt(zone.dataset.max);

    if (selectedTeam[position].length >= max) {
      alert(`You already have the maximum number of ${position} players.`);
      return;
    }

    if (!canAfford(player.price)) {
      alert("Not enough budget.");
      return;
    }

    if (!countyAllowed(player.county)) {
      alert("You already have 3 players from this county.");
      return;
    }

    addPlayerToTeam(player, position);
  });
});

/* ============================================================
   TEAM MANAGEMENT
============================================================ */

function addPlayerToTeam(player, position) {
  selectedTeam[position].push(player);
  budget -= player.price;
  transfersUsed++;
  saveTeam();
  renderTeam();
  updateBudgetDisplay();
  updateCountyLimits();
  updatePointsTable();
}

function removePlayerFromTeam(player, position) {
  selectedTeam[position] = selectedTeam[position].filter(p => p.id !== player.id);
  budget += player.price;
  transfersUsed++;
  saveTeam();
  renderTeam();
  updateBudgetDisplay();
  updateCountyLimits();
  updatePointsTable();
}

function renderTeam() {
  ["GK", "DEF", "MID", "FWD"].forEach(pos => {
    const zone = document.getElementById(`zone${pos}`);
    zone.innerHTML = "";

    selectedTeam[pos].forEach(player => {
      const card = createPlayerCard(player);
      card.classList.add("in-team");

      card.addEventListener("click", () => {
        if (transfersUsed >= maxTransfers) {
          alert("You have used all transfers for this gameweek.");
          return;
        }
        removePlayerFromTeam(player, pos);
      });

      zone.appendChild(card);
    });
  });

  document.getElementById("totalPlayers").textContent =
    `${totalPlayers()}/15`;

  document.getElementById("transfersUsed").textContent =
    `${transfersUsed}/${maxTransfers}`;
}

function totalPlayers() {
  return (
    selectedTeam.GK.length +
    selectedTeam.DEF.length +
    selectedTeam.MID.length +
    selectedTeam.FWD.length
  );
}

/* ============================================================
   COUNTY LIMITS
============================================================ */

function updateCountyLimits() {
  const counts = {};

  Object.values(selectedTeam).flat().forEach(p => {
    counts[p.county] = (counts[p.county] || 0) + 1;
  });

  const container = document.getElementById("countyLimits");
  container.innerHTML = "";

  Object.keys(counts).forEach(county => {
    const div = document.createElement("div");
    div.textContent = `${county}: ${counts[county]}/3`;

    if (counts[county] > 3) {
      div.classList.add("county-warning");
    }

    container.appendChild(div);
  });
}

function countyAllowed(county) {
  const count = Object.values(selectedTeam)
    .flat()
    .filter(p => p.county === county).length;

  return count < 3;
}

/* ============================================================
   BUDGET
============================================================ */

function canAfford(price) {
  return budget - price >= 0;
}

function updateBudgetDisplay() {
  document.getElementById("budgetRemaining").textContent =
    `€${budget.toFixed(1)}m`;
}

/* ============================================================
   SAVE / LOAD TEAM
============================================================ */

function saveTeam() {
  localStorage.setItem("gaaFantasyTeam", JSON.stringify(selectedTeam));
  localStorage.setItem("gaaFantasyBudget", budget);
}

function loadSavedTeam() {
  const saved = localStorage.getItem("gaaFantasyTeam");
  const savedBudget = localStorage.getItem("gaaFantasyBudget");

  if (saved) selectedTeam = JSON.parse(saved);
  if (savedBudget) budget = parseFloat(savedBudget);
}

/* ============================================================
   POINTS TABLE
============================================================ */

function updatePointsTable() {
  const tbody = document.getElementById("pointsTableBody");
  tbody.innerHTML = "";

  const gwId = document.getElementById("gameweekSelect").value;
  const gw = gameweeks.find(g => g.id == gwId);

  if (!gw) return;

  const teamPlayers = Object.values(selectedTeam).flat();

  teamPlayers.forEach(player => {
    const gwPoints = gw.scores[player.id] || 0;
    const seasonTotal = player.seasonTotal || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${player.name}</td>
      <td>${player.county}</td>
      <td>${player.position}</td>
      <td>€${player.price.toFixed(1)}m</td>
      <td>${gwPoints}</td>
      <td>${seasonTotal}</td>
    `;

    tbody.appendChild(row);
  });
}

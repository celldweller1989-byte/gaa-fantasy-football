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
    const opt = document.createElement("

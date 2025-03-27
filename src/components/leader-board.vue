<template>
  <div class="leaderboard-container">
    <div class="leaderboard-header">
      <img :src="FCLogo" alt="FC Logo" class="leaderboard-logo" />
      <div class="leaderboard-title"> AMG Leaderboard </div>
    </div>
    <!-- Tabs for leaderboards -->
    <div class="leaderboard-tabs">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{ active: activeTab === index }"
        @click="switchTab(index)"
      >
        {{ tab.name }}
      </button>
    </div>
    <!-- Sub-Tabs (for the first main tab) -->
    <div v-if="activeTab === 0" class="sub-tabs">
      <div
        v-for="(subTab, index) in subTabs"
        :key="index"
        :class="['sub-tab', { active: activeSubTab === index }]"
        @click="changeSubTab(index)"
      >
        {{ subTab }}
      </div>
    </div>
    <div class="scorecard-container" v-if="teamScores.length > 0 && !isLoading && (activeTab === 1)">
      <h2 class="scorecard-title">Last Updated</h2>
      <div class="scorecard">
        <div v-for="(team, index) in teamScores" :key="index" class="teamScores">
          <div class="team-details">
            <p class="team-name">{{ team.name }}</p>
            <p class="team-score">{{ team.score }}</p>
          </div>
        </div> 
      </div>
    </div>
    <!-- Show medals table if data is available -->
    <div class="medals-container" v-if="medals.length > 0 && activeTab === 2">
      <div class="medals-table">
        <div class="medals-row header">
          <div class="medal-cell name">Player</div>
          <div class="medal-cell gold">
            <i class="fas fa-medal gold-icon"></i>
          </div>
          <div class="medal-cell silver">
            <i class="fas fa-medal silver-icon"></i>
          </div>
          <div class="medal-cell bronze">
            <i class="fas fa-medal bronze-icon"></i>
          </div>
          <div class="medal-cell total">Total</div>
        </div>
        <div v-for="(player, index) in medals" :key="index" class="medals-row">
          <div class="medal-cell name">{{ player.name }}</div>
          <div class="medal-cell gold">{{ player.gold }}</div>
          <div class="medal-cell silver">{{ player.silver }}</div>
          <div class="medal-cell silver">{{ player.bronze }}</div>
          <div class="medal-cell total">{{ player.total }}</div>
        </div>
      </div>
    </div>
    <div class="leaderboard-ranking" v-if="!isLoading && activeTab !== 2">
      <table border="1">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player Name</th>
            <th v-if="activeTab !== 'A'">Points</th>
            <th v-if="activeTab === 'A'">Portfolio Value</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="player in players" :key="player.rank"
            :class="{'top-rank': Number(player.rank) <= topX}"
            @click="fetchPlayerBreakup(player.name)"
          >
            <td>
              <!-- winner icon for rank 1 , highlight for other win positions -->
              {{ player.rank }}
              <span v-if="Number(player.rank) === 1" class="winner-icon">
                <i class="fa fa-trophy"></i>
              </span>
            </td>
            <td>{{ player.name }}</td>
            <td>{{ player.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
     <!-- Modal for Player Breakup -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3>{{ selectedPlayer.name }}'s Points Breakup</h3>
        <table class="breakup-table">
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(player, index) in playerBreakup" :key="index" :class="getRowClass(index)">
              <td class="player-name">{{ player.name }}
                <span v-if="isCaptain(playerBreakup, index)"> (C)</span>
                <span v-else-if="isViceCaptain(playerBreakup, index)"> (VC)</span>
              </td>
              <td class="player-points">{{ player.points }}</td>
            </tr>
          </tbody>
        </table>
        <button class="close-btn" @click="closeModal">Close</button>
      </div>
    </div>
    <div v-if="isLoading" class="spinner-container">
      <i class="fas fa-spinner fa-spin fa-3x"></i>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import FCLogo from "@/assets/FcLogo.jpg";

const apiKey = "AIzaSyBRYMU5I2ihjMGDgju--7pK9r665sexUXA";
const players = ref([]);
const activeTab = ref(0);
const activeSubTab = ref(0);
const topX = ref(3);
const spreadSheetId = ref("");
const scoresSpreadSheetId = ref("");
const range = ref("");
const scoresRange = ref("");
const isLoading = ref(false);
const teamScores = ref([]);
const medals = ref([]);
const subTabs = ref(['Leaderboard', 'Biggest Gainers', 'Biggest Losers']); 

const tabs = ref([
  { name: 'Stocktion' },
  { name: 'IPL' },
  { name: 'HOF' },
]);

const showModal = ref(false);
const selectedPlayer = ref({});
const playerBreakup = ref([]);

const closeModal = () => {
  showModal.value = false;
  playerBreakup.value = [];
};


async function switchTab(tab) {
  console.log("Tab: ", tab);
  activeTab.value = tab;
  if (tab === 0) {
    topX.value = 6;
    spreadSheetId.value = "1zfByy4yd6-ZCO69a467Ci3KEkhevq2Dpn3cBQjeXIjk";
    range.value = "Leaderboard!B3:D28";
    scoresSpreadSheetId.value = "";
  } else if (tab === 1) {
    // IPL
    topX.value = 13; 
    spreadSheetId.value = "1NK3zvBqGE6i6Dnwb64V1tkv14Jd6gk9PICCJKs9HfU4"; // Auction sheet
    range.value = "Points & Ranking!A20:D73";
    scoresSpreadSheetId.value = "1TFtvGg_TnWN65tDA4cax6eaEi2W7NFIoKXadNEO989c"; // LiveScoring sheet
    scoresRange.value = "Fixtures!F1:G2";
  } else {
    spreadSheetId.value = "1iJkr2Xn6QHzARlA6yMHAK40ndCORwyCMVkfeDQ9weYs";
    range.value = "Series!G3:K50"
  }
  if (tab === 2) {
    await fetchMedalBoard(spreadSheetId.value, range.value);
  } else {
    console.log("featch lb..");
    await fetchLeaderBoard(spreadSheetId.value, range.value, scoresSpreadSheetId.value, scoresRange.value);
  }
}

async function fetchLeaderBoard(spreadSheetId, range, scoresSpreadSheetId, scoresRange) {
  isLoading.value = true;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?key=${apiKey}`;
  console.log("url: ", url);
  let response = await fetch(url);
  let json = await response.json();
  
  players.value = json.values.map(row => ({
  name: row[0],
  points: row[1],
  rank: row[2]?.trim()
  }));

  if (scoresSpreadSheetId !== "") {
    const scoresURL = `https://sheets.googleapis.com/v4/spreadsheets/${scoresSpreadSheetId}/values/${scoresRange}?key=${apiKey}`
    let scoresResponse = await fetch(scoresURL);
    let data = await scoresResponse.json();

    teamScores.value = [
      { name: data?.values[0]?.[0], score: data?.values[0]?.[1]},
      { name: data?.values[1]?.[0], score: data?.values[1]?.[1]},
    ]
  } else {
    teamScores.value = [];
  }
  isLoading.value = false;
}

// Fetch Player Breakup from "Final Teams"
async function fetchPlayerBreakup(playerName)  {
  const range = "Final Teams and Points!A1:DD1"; // Row 1 where participant names are stored
  let breakupSpreadSheetId = "1NK3zvBqGE6i6Dnwb64V1tkv14Jd6gk9PICCJKs9HfU4";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${breakupSpreadSheetId}/values/${range}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const headerRow = data.values[0];

    // Find the player's position in row 1
    const colIndex = headerRow.findIndex((name) => name.trim().toLowerCase() === playerName.trim().toLowerCase());
    if (colIndex === -1) {
      alert(`${playerName} not found in Final Teams.`);
      return;
    }


    // Get the column letter based on index (A, B, C, ...)
    const colLetter1 =  getColumnLetter(colIndex + 1); // For name column
    const colLetter2 =  getColumnLetter(colIndex + 2); // For points column


    // Get player name and points from the respective columns
    const dataRange = `Final Teams and Points!${colLetter1}2:${colLetter2}17`;
    const urlData = `https://sheets.googleapis.com/v4/spreadsheets/${breakupSpreadSheetId}/values/${dataRange}?key=${apiKey}`;
    const dataResponse = await fetch(urlData);
    const playerData = await dataResponse.json();

    // Format data to name and points
    playerBreakup.value = playerData.values.map((row) => ({
      name: row[0],
      points: row[1],
    }));

    // Show modal
    selectedPlayer.value = { name: playerName };
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching player breakup:", error);
  }
}

async function fetchMedalBoard(spreadSheetId, range) {
  isLoading.value = true;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?key=${apiKey}`;
  let response = await fetch(url);
  let json = await response.json();
  medals.value = json.values.map(row => ({
    name: row[0],
    gold: row[1],
    silver: row[2].trim(),
    bronze: row[3],
    total: row[4],
  }));
  isLoading.value = false;
}

const changeSubTab = async(index) => {
  activeSubTab.value = index;
  if (index === 0) {
    switchTab(0);
  } else if (index === 1) {
    topX.value = 5;
    spreadSheetId.value = "1Qc1QqvoG_sINlPNBaT9oBR927IQ27T1zPYdkzTTqxNM";
    range.value = "Big Movers!B4:C13";
    scoresSpreadSheetId.value = "";
    fetchTopMovers(spreadSheetId.value, range.value);
  } else {
    topX.value = 5;
    spreadSheetId.value = "1Qc1QqvoG_sINlPNBaT9oBR927IQ27T1zPYdkzTTqxNM";
    range.value = "Big Movers!D4:E13";
    scoresSpreadSheetId.value = "";
    fetchTopMovers(spreadSheetId.value, range.value);
  }
};

async function fetchTopMovers(spreadSheetId, range) {
  isLoading.value = true;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?key=${apiKey}`;
  let response = await fetch(url);
  let json = await response.json();
  let current_rank = ref(0);
  
  players.value = json.values.map(row => ({
  rank: current_rank.value +=1,
  name: row[0],
  points: row[1]
  }));
  isLoading.value = false;
}

function getColumnLetter(colIndex) {
  let letter = "";
  while (colIndex > 0) {
    let mod = (colIndex - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    colIndex = Math.floor((colIndex - mod) / 26);
  }
  return letter;
}

// Helper to determine row class for styling
const getRowClass = (index) => {
  return index < 4 ? 'bold-row' : ''
}

// Get the highest value for first 2 and next 2 rows
function highestFirstTwo(playerData) {
  return Math.max(playerData[0]?.points || 0, playerData[1]?.points || 0)
}

function highestNextTwo(playerData) {
  return Math.max(playerData[2]?.points || 0, playerData[3]?.points || 0)
}

// Check if a row is captain (C) or vice-captain (VC)
const isCaptain = (playerBreakup, index) => {
  return index < 2 && playerBreakup[index]?.points == highestFirstTwo(playerBreakup)
}

const isViceCaptain = (playerBreakup, index) => {
  return index >= 2 && index < 4 && playerBreakup[index]?.points == highestNextTwo(playerBreakup)
}

onMounted(() => {
  switchTab(0);
})

</script>

<style scoped>
.leaderboard-container {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: white;
  overflow-y: scroll;
  overflow-x: hidden;
}

.leaderboard-header {
  color: white;
  height: 60px;
  text-align: center;
  align-items: center;
  background-color: black;
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  position: relative;
}

.leaderboard-logo {
  height: 80px;
  margin-left: 0rem;
  display: flex;
  align-items: center;
}

.leaderboard-title {
  font-size: 20px;
  font-weight: 500;
  text-align: center;
  align-items: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
}

.leaderboard-tabs {
  margin: 20px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.leaderboard-tabs button {
  padding: 10px 20px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #ddd;
  background-color: #f4f4f4;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.leaderboard-tabs button.active {
  background-color: #007bff;
  color: #fff;
}

.leaderboard-tabs button:hover:not(.active) {
  background-color: #e0e0e0;
}

.scorecard-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px auto;
  padding: 15px;
  max-width: 20%;
  background-color: #1e1e1e;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.4);
  font-family: Arial, sans-serif;
}

.scorecard-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 15px;
  color: #f39c12;
  text-align: center;
  margin-top: 4px;
}

.scorecard {
  width: 100%;
  border-radius: 8px;
  background-color: #2c2c2c;
  padding: 10px;
}

.teamScores {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  margin: 8px 0;
  background-color: #3c3c3c;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.team-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.team-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1abc9c;
  margin-right: 10px;
}

.team-score {
  font-size: 1.2rem;
  color: #f1c40f;
  text-align: right;
}

.teamScores p {
  margin: 5px 0;
}

.leaderboard-ranking {
  margin: 30px auto;
  width: 90%;
  font-size: 20px;
  font-weight: 400;
  background-color: white;
}

table {
  margin-top: 20px;
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: center;
}

th {
  color: black;
  font-size: 16px;
}

td {
  color: black;
}

.winner-icon {
  color: gold;
}

.top-rank {
  background-color: #f0f8ff;
  color: #333;
  font-weight: bold;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f8f8;
  color: #333;
}

/* medals */

.medals-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px auto;
  padding: 15px;
  max-width: 100%;
  /* background-color: #1e1e1e; */
  background-color: 2b2b2b;
  color: #ffffff;
  border-radius: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.4);
  overflow-y: scroll;
}

.medals-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  /* color: #f39c12; */
  text-align: center;
  color: #ffcc00;
}

.medals-table {
  width: 100%;
  border-collapse: collapse;
  /* background-color: #2c2c2c; */
  background-color: #3b3b3b;
}

.medals-row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  /* border-bottom: 1px solid #444; */
  border-bottom: 1px solid #555;
}

.header {
  font-weight: bold;
  /* background-color: #333; */
  background-color: #444;
}

.medal-cell {
  flex: 1;
  text-align: center;
}

.gold-icon {
  color: #f1c40f;
}

.silver-icon {
  color: #bdc3c7;
}

.bronze-icon {
  color: #cd7f32;
}

/* Responsive styles */
@media (max-width: 768px) {
  .scorecard-container {
    padding: 10px;
    max-width: 60%;
  }

  .scorecard-title {
    font-size: 1rem;
  }

  .team-name, .team-score {
    font-size: 0.9rem;
  }
}

/* Sub-Tabs */
.sub-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 30px;
}

.sub-tab {
  margin: 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: black;
  cursor: pointer;
  position: relative;
}

.sub-tab.active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 2px;
  border-bottom: 3px solid blue;
}

@media(max-width: 480px) {
  .team {
    flex-direction: column;
    align-items: flex-start;
  }

  .team-details {
    width: 100%;
  }

  .team-name, .team-score {
    font-size: 0.8rem;
  }
}


/* Modal Styles */
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal Container */
.modal-content {
  background: #f5f5f5;
  padding: 25px;
  border-radius: 12px;
  width: 450px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  animation: fadeIn 0.3s ease-in-out;
  max-height: 600px; /* Set a max height for scroll */
  overflow-y: auto; 
}

/* Modal Header */
.modal-header {
  border-bottom: 1px solid #ddd;
  padding-bottom: 12px;
  margin-bottom: 15px;
}

/* Modal Title */
.modal-header h3 {
  font-size: 22px;
  color: #333;
  margin: 0;
}

/* Breakup Table */
.breakup-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* Table Header */
.breakup-table th {
  background-color: #4a4a4a;
  color: #fff;
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

/* Table Rows */
.breakup-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  text-align: left;
  color: #333;
}

/* Highlight Row on Hover */
.breakup-table tr:hover {
  background-color: #f1f1f1;
}

/* Modal Footer */
.modal-footer {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* Close Button - Centered & Styled */
.close-btn {
  background-color: #4a4a4a;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

/* Hover Effect */
.close-btn:hover {
  background-color: #333;
  transform: scale(1.05);
}

/* Fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  .modal-content {
    width: 90%;
    padding: 15px;
  }

  .modal-header h3 {
    font-size: 18px;
  }

  .breakup-table th,
  .breakup-table td {
    padding: 10px;
    font-size: 14px;
  }

  .close-btn {
    padding: 8px 16px;
    font-size: 12px;
    margin-top: 12px;
  }
}

.bold-row {
  font-weight: bold;
}

.player-name span {
  color: #28a745;
  font-weight: bold;
}

</style>

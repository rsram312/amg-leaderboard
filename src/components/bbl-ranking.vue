<template>
  <div class="leaderboard-container">
    <div class="leaderboard-header"> BBL24 Leaderboard </div>
    <!-- Tabs for leaderboards -->
    <div class="leaderboard-tabs">
      <button 
        :class="{active: activeTab === 'A' }"
        @click="switchTab('A')"
      >
        BBL
      </button>
      <button 
        :class="{active: activeTab === 'B' }"
        @click="switchTab('B')"
      >
        Cont18
      </button>
      <button 
        :class="{active: activeTab === 'C' }"
        @click="switchTab('C')"
      >
        Cont19
      </button>
    </div>
    <div class="leaderboard-ranking">
      <table border="1" v-if="activeTab === 'A'">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in playersA" :key="player.rank">
            <td>{{ player.rank }}</td>
            <td>{{ player.name }}</td>
            <td>{{ player.points }}</td>
          </tr>
        </tbody>
      </table>
      <table border="1" v-if="activeTab === 'B'">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in playersB" :key="player.rank">
            <td>{{ player.rank }}</td>
            <td>{{ player.name }}</td>
            <td>{{ player.points }}</td>
          </tr>
        </tbody>
      </table>
      <table border="1" v-if="activeTab === 'C'">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in playersC" :key="player.rank">
            <td>{{ player.rank }}</td>
            <td>{{ player.name }}</td>
            <td>{{ player.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const apiKey = "AIzaSyBRYMU5I2ihjMGDgju--7pK9r665sexUXA";
const playersA = ref([]);
const playersB = ref([]);
const playersC = ref([]);
const activeTab = ref("A");

async function switchTab(tab) {
  activeTab.value = tab;
  if (tab === "A" && playersA.value.length === 0) {
    await fetchBBLLeaderBoard();
  } else if (tab === "B" && playersB.value.length === 0) {
    await fetchCont18LeaderBoard();
  } else {
    await fetchCont19LeaderBoard();
  }
}

async function fetchBBLLeaderBoard() {
  const spreadSheetId = "1Jcr9VLnB-eMirOUMTMRNzYNcNa5qQc-5uEhpwvgoryg";
  const range = "Points & Ranking!A20:D51";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?key=${apiKey}`;

  let response = await fetch(url);
  let json = await response.json();
  playersA.value = json.values.map(row => ({
    name: row[0],
    points: row[1],
    rank: row[2]
  }));
}

async function fetchCont18LeaderBoard() {
  const spreadSheetId = "1xTy9duTv5QszfJaygTGJ2cncZzSUu7gR_csh7Xf9WOg";
  const range = "Top 15!A32:C40";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?key=${apiKey}`;

  let response = await fetch(url);
  let json = await response.json();
  playersB.value = json.values.map(row => ({
    name: row[0],
    points: row[1],
    rank: row[2]
  }));
}

async function fetchCont19LeaderBoard() {
  const spreadSheetId = "1foupfKzz4lkWi4NJSVFXnMs2UD3FrPlTb-k9IJdozK8";
  const range = "Top 15!A32:C43";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetId}/values/${range}?key=${apiKey}`;

  let response = await fetch(url);
  let json = await response.json();
  playersC.value = json.values.map(row => ({
    name: row[0],
    points: row[1],
    rank: row[2]
  }));
}
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
  font-size: 22px;
  padding-top: 30px;
  height: 60px;
  text-align: center;
  align-items: center;
  background-color: black;
  font-weight: 500;
}

.leaderboard-tabs {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.leaderboard-tabs button {
  padding: 10px 20px;
  font-size: 16px;
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

.leaderboard-ranking {
  margin: 20px auto;
  max-height: 600px;
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
  text-align: left;
}

th {
  color: black;
  font-size: 16px;
}

td {
  color: black;
}
</style>

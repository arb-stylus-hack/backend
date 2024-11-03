import express from 'express';
import matchesService from '../services/matches.js';

const matchesRouter = express.Router();
matchesService.setToken(process.env.RIOT_API_KEY);

matchesRouter.get('/', async (request, response) => {
  const { player1_tag, player1_name, player2_tag, player2_name } = request.query;

  if (!player1_tag || !player1_name || !player2_tag || !player2_name) {
    return response.status(400).json({ error: 'Missing player names or tags in query parameters' });
  }

  try {
    const [player1Data, player2Data] = await Promise.all([
      matchesService.getPlayerPuuid(player1_name, player1_tag),
      matchesService.getPlayerPuuid(player2_name, player2_tag),
    ]);

    // Extract PUUIDs
    const player1Puuid = player1Data.puuid;
    const player2Puuid = player2Data.puuid;

    // Construct the URLs for match IDs requests
    const matchUrlPlayer1 = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${player1Puuid}/ids?start=0&count=100&api_key=${process.env.RIOT_API_KEY}`;
    const matchUrlPlayer2 = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${player2Puuid}/ids?start=0&count=100&api_key=${process.env.RIOT_API_KEY}`;

    // Fetch match IDs for both players
    const [player1Matches, player2Matches] = await Promise.all([
      fetch(matchUrlPlayer1).then(res => res.json()),
      fetch(matchUrlPlayer2).then(res => res.json()),
    ]);

    // Find the first common match ID
    const commonMatch = player1Matches.find(matchId => player2Matches.includes(matchId));

    if (!commonMatch) {
      return response.status(404).json({ error: 'No common matches found' });
    }

    // Fetch match details using the common match ID
    const matchDetailsUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${commonMatch}?api_key=${process.env.RIOT_API_KEY}`;
    const matchDetails = await fetch(matchDetailsUrl).then(res => res.json());

    // Find team IDs for both players in the participants array
    const player1Participant = matchDetails.info.participants.find(participant => participant.puuid === player1Puuid);
    const player2Participant = matchDetails.info.participants.find(participant => participant.puuid === player2Puuid);

    if (!player1Participant || !player2Participant) {
      return response.status(404).json({ error: 'Player participants not found in match details' });
    }

    const player1TeamId = player1Participant.teamId;
    const player2TeamId = player2Participant.teamId;

    // Check the teams object for win properties
    const player1Team = matchDetails.info.teams.find(team => team.teamId === player1TeamId);
    const player2Team = matchDetails.info.teams.find(team => team.teamId === player2TeamId);

    if (player1Team && player2Team) {
      const player1Win = player1Team.win; // true or false
      const player2Win = player2Team.win; // true or false

      // Respond with the team IDs and their win status
      response.json({
        player1: {  name: player1_name,
          tag: player1_tag, teamId: player1TeamId, win: player1Win },
        player2: { name: player2_name,
          tag: player2_tag,teamId: player2TeamId, win: player2Win },
      });
    } else {
      response.status(404).json({ error: 'Teams not found for players in match details' });
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Failed to retrieve player data from Riot API' });
  }
});


matchesRouter.get('/test', async (request, response) => {
  try {
    const testUrl = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/skibidi%20nunu/ohio?api_key=RGAPI-a6a3a230-af4f-4771-9a21-099afc158d19`;
    const data = await matchesService.get(testUrl);
    response.json(data);
  } catch (error) {
    console.error('Error in test route:', error);
    response.status(500).json({ error: 'Test API call failed' });
  }
});


export default matchesRouter;

import axios from 'axios';

let riotApiToken = process.env.RIOT_API_KEY; // Set the token from the environment variable

const setToken = (newToken) => {
  riotApiToken = process.env.RIOT_API_KEY; // This function allows you to change the token if needed
};

// General function to make a GET request with Riot API token
const get = async (url) => {
  const config = {
    headers: { 'X-Riot-Token': riotApiToken },
  };
  try {
    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.log('err Riot API Key:', process.env.RIOT_API_KEY);
    console.log('err riotApiToken API Key:', riotApiToken);  
    console.error('Error in API call:', error);
    throw error; // Re-throw the error for further handling if needed
  }
};

const getPlayerPuuid = async (name, tag) => {
    const apiKey = process.env.RIOT_API_KEY; // Get the API key from the environment variable
    const url = `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?api_key=${apiKey}`;
    
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in API call:', error);
      throw error; // Re-throw the error for further handling if needed
    }
  };

export default { setToken, getPlayerPuuid, get };

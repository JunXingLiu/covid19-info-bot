const { Client } = require("discord.js");
const { config } = require("dotenv");
const axios = require("axios");

config({
  path: __dirname + "/.env",
});

const endPoint = "https://pomber.github.io/covid19/timeseries.json";
const jokeEndPoint = "https://icanhazdadjoke.com/slack";
const localEndPoint =
  "https://covid-19-coronavirus-statistics.p.rapidapi.com/v1/stats";

const localHeaders = {
  "content-type": "application/octet-stream",
  "x-rapidapi-host": "covid-19-coronavirus-statistics.p.rapidapi.com",
  "x-rapidapi-key": process.env.COVID19_TOKEN,
};

const client = new Client({
  disableEveryone: true,
});

client.on("ready", () => {
  console.log(`I am now online, my name is ${client.user.username}`);

  client.user.setPresence({
    status: "online",
    game: {
      name: "Info Bot",
      type: "LISTENING TO -COVID19",
    },
  });
});

client.on("message", async (message) => {
  const prefix = "-";

  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLocaleLowerCase();

  if (cmd === "covid19") {
    const msg = await message.channel.send("Searching");
    let country = args.join(" ");
    let getCovidData = async () => {
      try {
        let response = await axios.get(endPoint);
        let allCountryKeys = Object.keys(response.data);
        for (i = 0; i < allCountryKeys.length; i++) {
          if (allCountryKeys[i].toLowerCase() === country.toLowerCase()) {
            country = allCountryKeys[i];
            break;
          }
        }
        let allCovidData = response.data[country];
        let latest = allCovidData[allCovidData.length - 1];
        return latest;
      } catch (err) {
        msg.edit(
          `Country is not recognized! or... there are no cases in ${country}`
        );
        return false;
      }
    };
    let { date, confirmed, deaths, recovered } = await getCovidData();
    if (
      date !== undefined &&
      confirmed !== undefined &&
      deaths !== undefined &&
      recovered !== undefined
    ) {
      msg.edit(
        `${country}: As of ${date}\nConfirmed: ${confirmed}\nDeaths: ${deaths}\nRecovered: ${recovered}`
      );
    }
  } else if (cmd === "joke") {
    const msg = await message.channel.send("Joke Incoming...");
    const header = {
      "Content-Type": "application/json",
      "User-Agent": "My Library (https://github.com/JunXingLiu/)",
    };
    let getJoke = async () => {
      let response = await axios.get(jokeEndPoint, { headers: header });
      return response.data.attachments[0].fallback;
    };
    let joke = await getJoke();
    message.channel.send(joke, { tts: true });
  } else if (cmd === "local") {
    const msg = await message.channel.send("Searching");
    let prov = args.join(" ");
    let getCovidDataLocal = async () => {
      try {
        let localReponse = await axios({
          method: "GET",
          url: localEndPoint,
          headers: localHeaders,
          params: {
            country: "Canada",
          },
        });
        let provinceData = localReponse.data.data.covid19Stats;
        for (i = 0; i < provinceData.length; i++) {
          if (
            provinceData[i]["province"].toLowerCase() === prov.toLowerCase()
          ) {
            return provinceData[i];
          }
        }
        return false;
      } catch (err) {
        console.log(err);
      }
    };

    let {
      lastUpdate,
      keyId,
      confirmed,
      deaths,
      recovered,
    } = await getCovidDataLocal();
    if (
      lastUpdate !== undefined &&
      keyId !== undefined &&
      confirmed !== undefined &&
      deaths !== undefined &&
      recovered !== undefined
    ) {
      msg.edit(
        `${keyId}: As of ${lastUpdate}\nConfirmed: ${confirmed}\nDeaths: ${deaths}\nRecovered: ${recovered}`
      );
    } else {
      msg.edit(
        `Cannot find the province of ${prov} in Canada. Please enter -local [province]`
      );
    }
  }
});

client.login(process.env.ACCESS_TOKEN);

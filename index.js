const { Client } = require("discord.js");
const { config } = require("dotenv");
const axios = require("axios");

const endPoint = "https://pomber.github.io/covid19/timeseries.json";

const client = new Client({
  disableEveryone: true,
});

config({
  path: __dirname + "/.env",
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
  const country = args[1].charAt(0).toUpperCase() + args[1].slice(1);
  const cmd = args.shift().toLocaleLowerCase();

  if (cmd === "covid19") {
    const msg = await message.channel.send("Searching");
    let getCovidData = async () => {
      try {
        let reponse = await axios.get(endPoint);
        let allCovidData = reponse.data[country];
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
  }
});

client.login(process.env.ACCESS_TOKEN);

const { BaseCommand } = require("../commandStructure/baseCommand.js");
const { GameMap } = require("../modules/matchBuilderClasses.js");
const { constructEmbeddedDiscordMessage } = require("../modules/discordPrinter.js");
const { getAllApprovedMaps } = require("../modules/salesforceDataReader.js");

class GenerateMapCommand extends BaseCommand
{
    constructor()
    {
        super();

        this.COMMAND_NAME = "generateMap";
        this.COMMAND_ARGS = {
            c: {
                helpText: "The amount of players the map needs to accommodate",
                validateErrorText: "Enter a whole number greater than 0",
                validate: function (agrumentStringValue)
                {
                    let numericValue = Number(agrumentStringValue);
                    return (numericValue && numericValue > 0);
                }
            }
        }
    }

    async run(receivedCommandArgs, message, applicationCache)
    {
        let commandKeys = Object.keys(this.COMMAND_ARGS);

        let playerCount = this.getCommandArgument(commandKeys[0], receivedCommandArgs, (argumentString) => { return Number(argumentString); });
        let mapWrapperObject = await this.getRandomMap(playerCount);

        return constructEmbeddedDiscordMessage([{
            title: "Generated Map",
            description: `${mapWrapperObject.mapName}`
        }]);
    }

    async getRandomMap(playerCount)
    {
        let allApprovedMapObjects = await getAllApprovedMaps(playerCount);
        let selectedMapName = "", closetIndex = -1, closetDifference = Infinity;

        for (let i = 0; i < allApprovedMapObjects.length; i++)
        {
            let value = allApprovedMapObjects[i];
            let difference = playerCount - value.maxPlayerCount;

            if (difference == 0)
            {
                selectedMapName = value.mapNames[Math.floor(Math.random() * value.mapNames.length)];
                break;
            }
            else if (difference < 0)
            {
                let absDifference = Math.abs(difference);
                if (absDifference < closetDifference)
                {
                    closetIndex = i;
                    closetDifference = absDifference;
                }
            }
        };

        if (!selectedMapName)
        {
            selectedMapName = allApprovedMapObjects[closetIndex].mapNames[Math.floor(Math.random() * allApprovedMapObjects[closetIndex].mapNames.length)];
        }

        return new GameMap(selectedMapName, playerCount);
    }
}

module.exports = GenerateMapCommand.getExportObject();
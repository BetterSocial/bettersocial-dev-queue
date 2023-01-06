const stream = require('getstream')

require("dotenv").config();

const deleteReaction = async (reactionId) => {
    // Instantiate a new client (server side)
    const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
    const success = await client.reactions.delete(reactionId)

    return success
}

module.exports = {
    deleteReaction
}

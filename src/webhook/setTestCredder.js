const {
    dailyCredderUpdateQueue
} = require("../config");
const { dateCreted } = require("../utils");
const setTestCredder = async (req, res) => {
    try {
        const result = dailyCredderUpdateQueue.add({})
        return res.json({
            status: 'ok',
            result: result,
        })
    } catch (error) {
        console.log("error");
        console.log(error);
        return res.json({
            ststus: "error",
            message: error,
        });
    }

};

module.exports = { setTestCredder };

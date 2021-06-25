require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
// const { router } = require("bull-board");
// const { sendNewEmail } = require("./queues/email-queue");

const app = express();
const port = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// const getHook = require("./webhook/getData");
// const setHook = require("./webhook/setData");
const { createQueueNews } = require("./webhook/setNews");
// for bull admin
// app.use("/admin/queues", router);

// post from api
// app.post("/send-email", async (req, res) => {
//   const { message, ...restBody } = req.body;
//   await sendNewEmail({
//     ...restBody,
//     html: `<p>${message}</p>`,
//   });
//   res.send({ status: "ok" });
// });

app.get("/test", async (req, res) => {
  res.send({ status: "ok" });
});

// app.post("/hook", setHook);
app.post("/api/v1/news/message-posted", createQueueNews);
app.post("/api/v1/feed/viewpost", createQueueNews);
// app.get("/hook", getHook);

// app.post("/hook", setHook);

app.listen(port, () => console.log(`App running on port ${port}`));

// https://devcenter.heroku.com/articles/node-redis-workers

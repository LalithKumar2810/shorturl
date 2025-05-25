require("dotenv").config();
const express = require("express");
const path = require("path");
const staticRoute = require("./routes/staticRouter");
const urlRoute = require("./routes/url");
const { connectToMongoDB } = require("./connect");
const URL = require("./models/url");
const app = express();
const PORT = process.env.PORT || 8000;
// const PORT = process.env.PORT;
// const PORT = 8000;
// console.log("my name is ", process.env.myname);

// connect to mongoDB database
// connectToMongoDB("mongodb://localhost:27017/short-url").then(() =>
//   console.log("MongoDB connected")
// );
connectToMongoDB(process.env.MONGO_URL).then(() =>
  console.log("MongoDB connected")
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRoute);
app.use("/", staticRoute);

// app.get("/test", async (req, res) => {
//   const allUrls = await URL.find({});
//   return res.render("home", {
//     urls: allUrls,
//     name: "lalith",
//   });
// });

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  if (!entry) {
    return res.status(404).send("Short URL not found");
  }
  res.redirect(entry.redirectURL);
});
app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));

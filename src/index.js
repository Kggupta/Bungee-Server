// Loads the configuration from config.env to process.env
require('dotenv').config({ path: './config.env' });
const fs = require("fs")
const Path = require("path");

const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 22;
const app = express();

function requireAll(Directory) {
    fs.readdirSync(Directory).forEach(File => {
        const Absolute = Path.join(Directory, File);
        if (fs.statSync(Absolute).isDirectory()) {
            return requireAll(Absolute);
        } else {
            try {
                app.use(require(Absolute))
            } catch (e) {
                console.log("ROUTES FAILED FOR: " + Absolute);
            }
        }
    });
}

app.use(cors());
app.use(express.json());
requireAll(process.cwd() + "/src/routes");

app.use(function (err, _req, res, _next) {
  res.status(500)
  res.send('Invalid Path.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

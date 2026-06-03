const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());
app.use("/music", express.static(path.join(__dirname, "music"))); // ✅ Serve music files

// ✅ Get Songs API
app.get("/get-songs/:folder", (req, res) => {
    const folder = path.join(__dirname, "music", req.params.folder.replace(/%20/g, " "));
    
    if (!fs.existsSync(folder)) {
        return res.status(404).json({ error: "Folder not found" });
    }

    const songs = fs.readdirSync(folder)
        .filter(file => file.endsWith(".mp3"))
        .map(file => `music/${req.params.folder}/${file}`);

    res.json({ songs });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

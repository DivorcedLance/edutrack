import { app } from "./server";
import * as path from "path";
import { Request, Response } from "express";

const PORT = process.env.PORT || 3000;

// SPA Fallback: Serve index.html for any unknown routes
app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

app.listen(PORT, () => {
    console.log(`EduTrack API escuchando en puerto ${PORT}`);
});

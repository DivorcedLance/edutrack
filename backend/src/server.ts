import "reflect-metadata";
import { Container } from "inversify";
import { InversifyExpressServer } from "inversify-express-utils";
import * as cors from "cors";
import { TYPES } from "./core/types";
import { InMemoryGradeRepository } from "./modules/grades/repositories/GradeRepository";
import { GradeService } from "./modules/grades/services/GradeService";
import "./modules/grades/controllers/GradeController"; // Importar controlador para registrar metadata

const container = new Container();

// Bindings
container.bind(TYPES.GradeRepository).to(InMemoryGradeRepository);
container.bind(TYPES.GradeService).to(GradeService);

const server = new InversifyExpressServer(container);

server.setConfig((app) => {
    const express = require("express");
    const path = require("path");
    app.use(cors());
    app.use(express.json());
    
    // Serve static files from frontend/dist
    app.use(express.static(path.join(__dirname, "../../frontend/dist")));

    // Simple Request Logger
    app.use((req: any, res: any, next: any) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        if (Object.keys(req.body).length > 0) {
            console.log('Body:', JSON.stringify(req.body, null, 2));
        }
        next();
    });
});

const app = server.build();
export { app };

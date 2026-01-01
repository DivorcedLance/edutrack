import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "./types";
import { GradeApiService } from "../../modules/grades/services/GradeApiService";

const container = new Container();

// Bindings del Frontend (aquí usamos implementaciones HTTP)
container.bind(TYPES.GradeService).to(GradeApiService);

export { container };

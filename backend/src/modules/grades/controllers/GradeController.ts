import { controller, httpDelete, httpGet, httpPost, httpPut, requestBody, requestParam, response, request } from "inversify-express-utils";
import { inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGradeService } from "../domain/interfaces";
import { z } from "zod";
import { Request, Response } from "express";

const StudentParamsSchema = z.object({
    studentId: z.string().min(1)
});

const GradeSchema = z.object({
    courseCode: z.string().min(1),
    courseName: z.string().min(1),
    score: z.number().min(0).max(20),
    credits: z.number().min(1).max(10),
    academicPeriod: z.string().min(1),
    cycle: z.number().min(1).max(10),
    plan: z.string().min(1),
    type: z.enum(['E', 'O', 'EG', 'EE', 'OP', 'AL']),
    section: z.string().min(1),
    recordCode: z.string().min(1)
});

const StudentSchema = z.object({
    studentId: z.string().min(1),
    fullName: z.string().min(1),
    faculty: z.string().min(1),
    school: z.string().min(1),
    specialty: z.string().min(1),
    plan: z.string().min(1)
});

const UpdateGradeSchema = GradeSchema.partial();

@controller("/api/grades")
export class GradeController {
    constructor(@inject(TYPES.GradeService) private gradeService: IGradeService) {}

    @httpGet(":studentId")
    public async getGrades(@requestParam("studentId") studentId: string, @response() res: Response) {
        try {
            StudentParamsSchema.parse({ studentId });
            const result = await this.gradeService.getStudentGrades(studentId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: "Invalid Request" });
        }
    }

    @httpPost(":studentId")
    public async addGrade(@requestParam("studentId") studentId: string, @requestBody() body: any, @response() res: Response) {
        try {
            StudentParamsSchema.parse({ studentId });
            const gradeData = GradeSchema.parse(body);
            const result = await this.gradeService.addGrade(studentId, gradeData);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid Request" });
        }
    }

    @httpPut(":id")
    public async updateGrade(@requestParam("id") id: string, @requestBody() body: any, @response() res: Response) {
        try {
            const gradeUpdate = UpdateGradeSchema.parse(body);
            const result = await this.gradeService.updateGrade(id, gradeUpdate);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid Request" });
        }
    }

    @httpDelete(":id")
    public async deleteGrade(@requestParam("id") id: string, @response() res: Response) {
        try {
            await this.gradeService.deleteGrade(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(400).json({ error: "Invalid Request" });
        }
    }

    @httpPut("student/:studentId")
    public async updateStudent(@requestParam("studentId") studentId: string, @requestBody() body: any, @response() res: Response) {
        try {
            const studentData = StudentSchema.parse(body);
            const result = await this.gradeService.updateStudentInfo(studentId, studentData);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid Request" });
        }
    }

    @httpPost(":studentId/batch")
    public async addGradesBatch(@requestParam("studentId") studentId: string, @requestBody() body: any, @response() res: Response) {
        try {
            const { text } = body;
            if (!text || typeof text !== 'string') {
                return res.status(400).json({ error: "Se requiere el campo 'text' con el contenido a procesar" });
            }
            const result = await this.gradeService.addGradesFromText(studentId, text);
            return res.status(result.success ? 201 : 400).json(result);
        } catch (error) {
            return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid Request" });
        }
    }
}

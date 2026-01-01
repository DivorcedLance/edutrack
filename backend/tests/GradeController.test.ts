import * as request from "supertest";
import { app } from "../src/server";

describe("GradeController Integration Tests", () => {
    const studentId = "22200123";

    it("GET /api/grades/:studentId should return complete academic history", async () => {
        const response = await request(app).get(`/api/grades/${studentId}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("student");
        expect(response.body).toHaveProperty("creditSummary");
        expect(response.body).toHaveProperty("grades");
        expect(response.body.student.studentId).toBe(studentId);
    });

    it("POST /api/grades/:studentId should add a new grade with all fields", async () => {
        const newGrade = {
            courseCode: "TEST001",
            courseName: "Test Course",
            score: 15,
            credits: 3,
            academicPeriod: "2023-1",
            cycle: 2,
            plan: "2018",
            type: "O",
            section: "1",
            recordCode: "P-TEST001"
        };

        const response = await request(app)
            .post(`/api/grades/${studentId}`)
            .send(newGrade);

        expect(response.status).toBe(201);
        expect(response.body.courseCode).toBe(newGrade.courseCode);
        expect(response.body.courseName).toBe(newGrade.courseName);
        expect(response.body).toHaveProperty("id");
    });

    it("POST /api/grades/:studentId should return 400 for invalid data", async () => {
        const invalidGrade = {
            courseCode: "",
            courseName: "",
            score: 25,
            credits: 3
        };

        const response = await request(app)
            .post(`/api/grades/${studentId}`)
            .send(invalidGrade);

        expect(response.status).toBe(400);
    });

    it("PUT /api/grades/:id should update a grade", async () => {
        const addResponse = await request(app)
            .post(`/api/grades/${studentId}`)
            .send({
                courseCode: "UPD001",
                courseName: "To Update",
                score: 10,
                credits: 2,
                academicPeriod: "2023-1",
                cycle: 2,
                plan: "2018",
                type: "O",
                section: "1",
                recordCode: "P-UPD001"
            });
        
        const gradeId = addResponse.body.id;

        const updateData = { score: 20 };
        const response = await request(app)
            .put(`/api/grades/${gradeId}`)
            .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.score).toBe(20);
    });

    it("DELETE /api/grades/:id should delete a grade", async () => {
        const addResponse = await request(app)
            .post(`/api/grades/${studentId}`)
            .send({
                courseCode: "DEL001",
                courseName: "To Delete",
                score: 10,
                credits: 2,
                academicPeriod: "2023-1",
                cycle: 2,
                plan: "2018",
                type: "O",
                section: "1",
                recordCode: "P-DEL001"
            });
        
        const gradeId = addResponse.body.id;

        const response = await request(app).delete(`/api/grades/${gradeId}`);

        expect(response.status).toBe(204);
    });

    it("PUT /api/grades/student/:studentId should update student info", async () => {
        const studentData = {
            studentId: studentId,
            fullName: "UPDATED NAME",
            faculty: "Updated Faculty",
            school: "Updated School",
            specialty: "Updated Specialty",
            plan: "2018"
        };

        const response = await request(app)
            .put(`/api/grades/student/${studentId}`)
            .send(studentData);

        expect(response.status).toBe(200);
        expect(response.body.fullName).toBe("UPDATED NAME");
    });
});

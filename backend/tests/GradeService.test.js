"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GradeService_1 = require("../src/modules/grades/services/GradeService");
const jest_mock_extended_1 = require("jest-mock-extended");
describe("GradeService", () => {
    let gradeService;
    let gradeRepository;
    const mockStudent = {
        studentId: "22200123",
        fullName: "TEST STUDENT",
        faculty: "Test Faculty",
        school: "Test School",
        specialty: "Test Specialty",
        plan: "2018"
    };
    beforeEach(() => {
        gradeRepository = (0, jest_mock_extended_1.mock)();
        gradeService = new GradeService_1.GradeService(gradeRepository);
    });
    describe("getStudentGrades", () => {
        it("should return complete summary with grades and credit calculation", async () => {
            const mockGrades = [
                {
                    id: "1",
                    courseCode: "INE002",
                    courseName: "PROGRAMACIÓN Y COMPUTACIÓN",
                    score: 17,
                    credits: 2,
                    academicPeriod: "2022-1",
                    cycle: 1,
                    plan: "2018",
                    type: "E",
                    section: "2",
                    recordCode: "P-2022120120180INE0022P"
                },
                {
                    id: "2",
                    courseCode: "INO104",
                    courseName: "CÁLCULO I",
                    score: 19,
                    credits: 4,
                    academicPeriod: "2022-1",
                    cycle: 1,
                    plan: "2018",
                    type: "O",
                    section: "2",
                    recordCode: "P-2022120120180INO1042P"
                }
            ];
            gradeRepository.findAllByStudent.mockResolvedValue(mockGrades);
            gradeRepository.findStudentById.mockResolvedValue(mockStudent);
            const result = await gradeService.getStudentGrades("22200123");
            expect(result.student).toEqual(mockStudent);
            expect(result.grades).toHaveLength(2);
            expect(result.creditSummary.approvedCredits).toBe(6); // 2 + 4
            expect(result.creditSummary.obligatoryCredits).toBe(4);
            expect(result.creditSummary.weightedAverage).toBeCloseTo(18.333, 2);
        });
        it("should handle student not found", async () => {
            gradeRepository.findAllByStudent.mockResolvedValue([]);
            gradeRepository.findStudentById.mockResolvedValue(null);
            await expect(gradeService.getStudentGrades("999")).rejects.toThrow("Student not found");
        });
    });
    describe("addGrade", () => {
        it("should add a valid grade", async () => {
            const gradeData = {
                courseCode: "INO105",
                courseName: "BIOLOGÍA PARA CIENCIAS E INGENIERÍA",
                score: 18,
                credits: 4,
                academicPeriod: "2022-1",
                cycle: 1,
                plan: "2018",
                type: "O",
                section: "2",
                recordCode: "P-2022120120180INO1052P"
            };
            gradeRepository.save.mockImplementation(async (g) => g);
            const result = await gradeService.addGrade("22200123", gradeData);
            expect(result.courseCode).toBe("INO105");
            expect(result.score).toBe(18);
            expect(result.id).toBeDefined();
            expect(gradeRepository.save).toHaveBeenCalled();
        });
        it("should throw error for invalid score", async () => {
            const gradeData = {
                courseCode: "INO105",
                courseName: "Test",
                score: 25,
                credits: 4,
                academicPeriod: "2022-1",
                cycle: 1,
                plan: "2018",
                type: "O",
                section: "2",
                recordCode: "TEST"
            };
            await expect(gradeService.addGrade("22200123", gradeData)).rejects.toThrow("Score must be between 0 and 20");
        });
        it("should throw error for invalid credits", async () => {
            const gradeData = {
                courseCode: "INO105",
                courseName: "Test",
                score: 15,
                credits: 0,
                academicPeriod: "2022-1",
                cycle: 1,
                plan: "2018",
                type: "O",
                section: "2",
                recordCode: "TEST"
            };
            await expect(gradeService.addGrade("22200123", gradeData)).rejects.toThrow("Credits must be greater than 0");
        });
    });
});
//# sourceMappingURL=GradeService.test.js.map
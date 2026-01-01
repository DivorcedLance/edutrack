import { injectable } from "inversify";
import { IGrade, IGradeRepository, IStudent } from "../domain/interfaces";
import * as fs from 'fs';
import * as path from 'path';

interface IDataStore {
    students: { [studentId: string]: IStudent };
    grades: { [studentId: string]: IGrade[] };
}

@injectable()
export class InMemoryGradeRepository implements IGradeRepository {
    private readonly _filePath = path.join(__dirname, 'grades.json');
    private _dataStore: IDataStore = { students: {}, grades: {} };

    constructor() {
        this._loadData();
    }

    private _loadData() {
        if (fs.existsSync(this._filePath)) {
            const data = fs.readFileSync(this._filePath, 'utf-8');
            this._dataStore = JSON.parse(data);
        } else {
            // Datos de ejemplo basados en el historial académico - Periodo Académico 2022-1
            this._dataStore = {
                students: {
                    "22200123": {
                        studentId: "22200123",
                        fullName: "VERGARA PACHAS JOSE LUIS",
                        faculty: "INGENIERÍA DE SISTEMAS E INFORMÁTICA",
                        school: "E.P. De Ingeniería De Sistemas",
                        specialty: "Estudios Generales",
                        plan: "2018"
                    }
                },
                grades: {
                    "22200123": [
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
                            recordCode: "P - 2022120120180INE0022P"
                        },
                        {
                            id: "2",
                            courseCode: "INO101",
                            courseName: "REDACCIÓN Y TÉCNICAS DE COMUNICACIÓN EFECTIVA I",
                            score: 17,
                            credits: 3,
                            academicPeriod: "2022-1",
                            cycle: 1,
                            plan: "2018",
                            type: "O",
                            section: "2",
                            recordCode: "P - 2022120120180INO1012P"
                        },
                        {
                            id: "3",
                            courseCode: "INO102",
                            courseName: "MÉTODOS DE ESTUDIO UNIVERSITARIO",
                            score: 18,
                            credits: 2,
                            academicPeriod: "2022-1",
                            cycle: 1,
                            plan: "2018",
                            type: "O",
                            section: "2",
                            recordCode: "P - 2022120120180INO1022P"
                        },
                        {
                            id: "4",
                            courseCode: "INO103",
                            courseName: "DESARROLLO PERSONAL Y LIDERAZGO",
                            score: 19,
                            credits: 2,
                            academicPeriod: "2022-1",
                            cycle: 1,
                            plan: "2018",
                            type: "O",
                            section: "2",
                            recordCode: "P - 2022120120180INO1032P"
                        },
                        {
                            id: "5",
                            courseCode: "INO104",
                            courseName: "CÁLCULO I",
                            score: 19,
                            credits: 4,
                            academicPeriod: "2022-1",
                            cycle: 1,
                            plan: "2018",
                            type: "O",
                            section: "2",
                            recordCode: "P - 2022120120180INO1042P"
                        },
                        {
                            id: "6",
                            courseCode: "INO105",
                            courseName: "BIOLOGÍA PARA CIENCIAS E INGENIERÍA",
                            score: 18,
                            credits: 4,
                            academicPeriod: "2022-1",
                            cycle: 1,
                            plan: "2018",
                            type: "O",
                            section: "2",
                            recordCode: "P - 2022120120180INO1052P"
                        },
                        {
                            id: "7",
                            courseCode: "INO106",
                            courseName: "ÁLGEBRA Y GEOMETRÍA ANALÍTICA",
                            score: 18,
                            credits: 4,
                            academicPeriod: "2022-1",
                            cycle: 1,
                            plan: "2018",
                            type: "O",
                            section: "2",
                            recordCode: "P - 2022120120180INO1062P"
                        },
                        {
                            id: "8",
                            courseCode: "INO107",
                            courseName: "MEDIO AMBIENTE Y DESARROLLO SOSTENIBLE",
                            score: 17,
                            credits: 3,
                            academicPeriod: "2022-1",
                            cycle: 1,
                            plan: "2018",
                            type: "O",
                            section: "2",
                            recordCode: "P - 2022120120180INO1072P"
                        }
                    ]
                }
            };
            this._saveToFile();
        }
    }

    private _saveToFile() {
        fs.writeFileSync(this._filePath, JSON.stringify(this._dataStore, null, 2));
    }

    public async findAllByStudent(studentId: string): Promise<IGrade[]> {
        const grades = this._dataStore.grades[studentId] || [];
        return new Promise((resolve) => setTimeout(() => resolve([...grades]), 100));
    }

    public async findById(id: string): Promise<IGrade | null> {
        for (const grades of Object.values(this._dataStore.grades)) {
            const grade = grades.find(g => g.id === id);
            if (grade) return { ...grade };
        }
        return null;
    }

    public async save(grade: IGrade, studentId?: string): Promise<IGrade> {
        // Use provided studentId or default
        const sid = studentId || "22200123";
        
        if (!this._dataStore.grades[sid]) {
            this._dataStore.grades[sid] = [];
        }
        
        this._dataStore.grades[sid]!.push(grade);
        this._saveToFile();
        return { ...grade };
    }

    public async update(id: string, gradeUpdate: Partial<IGrade>): Promise<IGrade> {
        for (const grades of Object.values(this._dataStore.grades)) {
            const index = grades.findIndex(g => g.id === id);
            if (index !== -1 && grades[index]) {
                const updatedGrade: IGrade = { ...grades[index]!, ...gradeUpdate };
                grades[index] = updatedGrade;
                this._saveToFile();
                return updatedGrade;
            }
        }
        throw new Error("Grade not found");
    }

    public async delete(id: string): Promise<void> {
        for (const studentId in this._dataStore.grades) {
            const grades = this._dataStore.grades[studentId];
            if (grades) {
                this._dataStore.grades[studentId] = grades.filter(g => g.id !== id);
            }
        }
        this._saveToFile();
    }

    public async findStudentById(studentId: string): Promise<IStudent | null> {
        return this._dataStore.students[studentId] || null;
    }

    public async saveStudent(student: IStudent): Promise<IStudent> {
        this._dataStore.students[student.studentId] = student;
        this._saveToFile();
        return { ...student };
    }
}

export interface IGrade {
    id: string;
    courseCode: string; // Ej. INE002, INO101
    courseName: string; // Ej. PROGRAMACIÓN Y COMPUTACIÓN
    score: number; // Nota 0-20
    credits: number; // Créditos del curso
    academicPeriod: string; // Ej. 2022-1
    cycle: number; // Ciclo académico (1-10)
    plan: string; // Ej. 2018
    type: 'E' | 'O' | 'EG' | 'EE' | 'OP' | 'AL'; // E=Electivo, O=Obligatorio, EG=Electivo General, EE=Electivo Especialidad, OP=Optativo, AL=Alternativo
    section: string; // Sección
    recordCode: string; // Código de Acta
}

export interface ICreditSummary {
    requiredCredits: number;
    approvedCredits: number;
    obligatoryCredits: number;
    specialtyCredits: number;
    generalElectiveCredits: number;
    specialtyElectiveCredits: number;
    optionalCredits: number;
    alternativeCredits: number;
    otherSpecialtyCredits: number;
    repeatedCredits: number;
    otherCredits: number;
    remainingCredits: number;
    weightedAverage: number;
}

export interface IStudent {
    studentId: string; // Código de matrícula
    fullName: string;
    faculty: string;
    school: string;
    specialty: string;
    plan: string;
}

export interface IGradeSummary {
    student: IStudent;
    creditSummary: ICreditSummary;
    grades: IGrade[];
}

export interface IBatchImportResult {
    success: boolean;
    imported: number;
    failed: number;
    errors: string[];
    grades: IGrade[];
}

export interface IGradeService {
    getStudentGrades(studentId: string): Promise<IGradeSummary>;
    addGrade(studentId: string, grade: Omit<IGrade, 'id'>): Promise<IGrade>;
    addGradesFromText(studentId: string, text: string): Promise<IBatchImportResult>;
    updateGrade(id: string, grade: Partial<IGrade>): Promise<IGrade>;
    deleteGrade(id: string): Promise<void>;
    updateStudentInfo(studentId: string, studentInfo: IStudent): Promise<IStudent>;
}

export interface IGradeRepository {
    findAllByStudent(studentId: string): Promise<IGrade[]>;
    findById(id: string): Promise<IGrade | null>;
    save(grade: IGrade, studentId?: string): Promise<IGrade>;
    update(id: string, grade: Partial<IGrade>): Promise<IGrade>;
    delete(id: string): Promise<void>;
    findStudentById(studentId: string): Promise<IStudent | null>;
    saveStudent(student: IStudent): Promise<IStudent>;
}

import { injectable, inject } from "inversify";
import { TYPES } from "../../../core/types";
import { IGrade, IGradeRepository, IGradeService, IGradeSummary, ICreditSummary, IStudent, IBatchImportResult } from "../domain/interfaces";

@injectable()
export class GradeService implements IGradeService {
    constructor(
        @inject(TYPES.GradeRepository) private repo: IGradeRepository
    ) {}

    public async getStudentGrades(studentId: string): Promise<IGradeSummary> {
        const grades = await this.repo.findAllByStudent(studentId);
        const student = await this.repo.findStudentById(studentId);
        
        if (!student) {
            throw new Error("Student not found");
        }

        const creditSummary = this._calculateCreditSummary(grades);

        return {
            student,
            creditSummary,
            grades
        };
    }

    private _calculateCreditSummary(grades: IGrade[]): ICreditSummary {
        const approvedGrades = grades.filter(g => g.score >= 11);
        
        const obligatoryCredits = approvedGrades.filter(g => g.type === 'O').reduce((acc, g) => acc + g.credits, 0);
        const specialtyCredits = approvedGrades.filter(g => g.type === 'EE').reduce((acc, g) => acc + g.credits, 0);
        const generalElectiveCredits = approvedGrades.filter(g => g.type === 'EG').reduce((acc, g) => acc + g.credits, 0);
        const specialtyElectiveCredits = approvedGrades.filter(g => g.type === 'E').reduce((acc, g) => acc + g.credits, 0);
        const optionalCredits = approvedGrades.filter(g => g.type === 'OP').reduce((acc, g) => acc + g.credits, 0);
        const alternativeCredits = approvedGrades.filter(g => g.type === 'AL').reduce((acc, g) => acc + g.credits, 0);
        
        const approvedCredits = obligatoryCredits + specialtyCredits + generalElectiveCredits + 
                               specialtyElectiveCredits + optionalCredits + alternativeCredits;

        const totalCredits = grades.reduce((acc, g) => acc + g.credits, 0);
        const weightedSum = grades.reduce((acc, g) => acc + (g.score * g.credits), 0);
        const weightedAverage = totalCredits > 0 ? parseFloat((weightedSum / totalCredits).toFixed(3)) : 0;

        // TODO: Estos valores deberían venir de la configuración del plan de estudios
        const requiredCredits = 213;
        const remainingCredits = Math.max(0, requiredCredits - approvedCredits);

        return {
            requiredCredits,
            approvedCredits,
            obligatoryCredits,
            specialtyCredits,
            generalElectiveCredits,
            specialtyElectiveCredits,
            optionalCredits,
            alternativeCredits,
            otherSpecialtyCredits: 0,
            repeatedCredits: 0,
            otherCredits: 0,
            remainingCredits,
            weightedAverage
        };
    }

    public async addGrade(studentId: string, gradeData: Omit<IGrade, 'id'>): Promise<IGrade> {
        // Basic validation
        if (gradeData.score < 0 || gradeData.score > 20) throw new Error("Score must be between 0 and 20");
        if (gradeData.credits <= 0) throw new Error("Credits must be greater than 0");

        const newGrade: IGrade = {
            ...gradeData,
            id: Math.random().toString(36).substr(2, 9)
        };

        return await this.repo.save(newGrade, studentId);
    }

    public async updateGrade(id: string, gradeUpdate: Partial<IGrade>): Promise<IGrade> {
        if (gradeUpdate.score !== undefined && (gradeUpdate.score < 0 || gradeUpdate.score > 20)) {
            throw new Error("Score must be between 0 and 20");
        }
        return await this.repo.update(id, gradeUpdate);
    }

    public async deleteGrade(id: string): Promise<void> {
        await this.repo.delete(id);
    }

    public async updateStudentInfo(studentId: string, studentInfo: IStudent): Promise<IStudent> {
        return await this.repo.saveStudent(studentInfo);
    }

    public async addGradesFromText(studentId: string, text: string): Promise<IBatchImportResult> {
        const result: IBatchImportResult = {
            success: true,
            imported: 0,
            failed: 0,
            errors: [],
            grades: []
        };

        try {
            // Extraer el periodo académico del texto
            const periodMatch = text.match(/Periodo Acad[eé]mico\s+(\d{4}-\d)/i);
            const academicPeriod = periodMatch ? periodMatch[1] : '';

            if (!academicPeriod) {
                result.success = false;
                result.errors.push('No se pudo detectar el período académico en el formato "Periodo Académico XXXX-X"');
                return result;
            }

            // Dividir en líneas y filtrar las líneas vacías y encabezados
            const lines = text.split('\n')
                .map(line => line.trim())
                .filter(line => {
                    // Ignorar líneas vacías, encabezados y la línea del período
                    if (!line) return false;
                    if (line.toLowerCase().includes('periodo acad')) return false;
                    if (line.toLowerCase().includes('ciclo') && line.toLowerCase().includes('plan')) return false;
                    return true;
                });

            for (const line of lines) {
                try {
                    // Formato esperado: Ciclo Plan Tipo Código - Nombre Calif. Créd. Sec. Acta
                    // Ejemplo: 3 2018 O 20118033 - ORGANIZACIÓN Y ADMINISTRACIÓN 19 3.0 1 P - 2023020120180201180331P
                    
                    // Regex mejorado para capturar todos los componentes
                    const regex = /^(\d+)\s+(\d{4})\s+([A-Z]+)\s+([A-Z0-9]+)\s+-\s+([A-ZÁÉÍÓÚÑ\s]+?)\s+(\d+)\s+([\d.]+)\s+(\d+)\s+(.+)$/i;
                    const match = line.match(regex);

                    if (!match) {
                        result.errors.push(`No se pudo procesar la línea: ${line}`);
                        result.failed++;
                        continue;
                    }

                    const [, cycle, plan, type, courseCode, courseName, score, credits, section, recordCode] = match;

                    const gradeData: Omit<IGrade, 'id'> = {
                        courseCode: (courseCode || '').trim(),
                        courseName: (courseName || '').trim(),
                        score: parseInt(score || '0'),
                        credits: parseFloat(credits || '0'),
                        academicPeriod: academicPeriod,
                        cycle: parseInt(cycle || '1'),
                        plan: plan || '2018',
                        type: (type || 'O').toUpperCase() as 'E' | 'O' | 'EG' | 'EE' | 'OP' | 'AL',
                        section: (section || '1').trim(),
                        recordCode: (recordCode || 'N/A').trim()
                    };

                    // Validar datos
                    if (gradeData.score < 0 || gradeData.score > 20) {
                        result.errors.push(`Nota inválida (${gradeData.score}) para el curso ${courseCode || 'desconocido'}`);
                        result.failed++;
                        continue;
                    }

                    if (gradeData.credits <= 0) {
                        result.errors.push(`Créditos inválidos (${gradeData.credits}) para el curso ${courseCode || 'desconocido'}`);
                        result.failed++;
                        continue;
                    }

                    const newGrade = await this.addGrade(studentId, gradeData);
                    result.grades.push(newGrade);
                    result.imported++;

                } catch (error) {
                    result.errors.push(`Error procesando línea: ${line} - ${error instanceof Error ? error.message : 'Error desconocido'}`);
                    result.failed++;
                }
            }

            result.success = result.imported > 0;

        } catch (error) {
            result.success = false;
            result.errors.push(`Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }

        return result;
    }
}

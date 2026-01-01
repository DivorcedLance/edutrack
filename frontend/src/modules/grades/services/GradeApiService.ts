import { injectable } from 'inversify';
import axios from 'axios';
import type { IGrade, IGradeService, IGradeSummary, IStudent, IBatchImportResult } from '@/core/interfaces';

@injectable()
export class GradeApiService implements IGradeService {
    private readonly API_URL = 'http://localhost:3000/api/grades';

    async getStudentGrades(studentId: string): Promise<IGradeSummary> {
        const { data } = await axios.get<IGradeSummary>(`${this.API_URL}/${studentId}`);
        return data;
    }

    async addGrade(studentId: string, grade: Omit<IGrade, 'id'>): Promise<IGrade> {
        const { data } = await axios.post<IGrade>(`${this.API_URL}/${studentId}`, grade);
        return data;
    }

    async addGradesFromText(studentId: string, text: string): Promise<IBatchImportResult> {
        const { data } = await axios.post<IBatchImportResult>(`${this.API_URL}/${studentId}/batch`, { text });
        return data;
    }

    async updateGrade(id: string, grade: Partial<IGrade>): Promise<IGrade> {
        const { data } = await axios.put<IGrade>(`${this.API_URL}/${id}`, grade);
        return data;
    }

    async deleteGrade(id: string): Promise<void> {
        await axios.delete(`${this.API_URL}/${id}`);
    }

    async updateStudentInfo(studentId: string, studentInfo: IStudent): Promise<IStudent> {
        const { data } = await axios.put<IStudent>(`${this.API_URL}/student/${studentId}`, studentInfo);
        return data;
    }
}

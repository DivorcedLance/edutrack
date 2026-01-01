<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useDependency } from '@/shared/composables/useDependency';
import { TYPES } from '@/core/di/types';
import type { IGradeService, IGradeSummary, IGrade, IStudent } from '@/core/interfaces';

// PrimeVue Imports
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';

const gradeService = useDependency<IGradeService>(TYPES.GradeService);

const summary = ref<IGradeSummary | null>(null);
const loading = ref(true);
const studentId = "22200123";
const searchQuery = ref('');

const showDialog = ref(false);
const showStudentDialog = ref(false);
const showBatchDialog = ref(false);
const isEditing = ref(false);
const currentGradeId = ref<string | null>(null);
const batchText = ref('');
const batchResult = ref<any>(null);

const gradeForm = reactive({
    courseCode: '',
    courseName: '',
    score: 0,
    credits: 1,
    academicPeriod: '',
    cycle: 1,
    plan: '2018',
    type: 'O' as 'E' | 'O' | 'EG' | 'EE' | 'OP' | 'AL',
    section: '',
    recordCode: ''
});

const studentForm = reactive({
    studentId: '',
    fullName: '',
    faculty: '',
    school: '',
    specialty: '',
    plan: ''
});

const courseTypes = [
    { label: 'Obligatorio', value: 'O' },
    { label: 'Electivo', value: 'E' },
    { label: 'Electivo General', value: 'EG' },
    { label: 'Electivo Especialidad', value: 'EE' },
    { label: 'Optativo', value: 'OP' },
    { label: 'Alternativo', value: 'AL' }
];

const gradesByPeriod = computed(() => {
    if (!summary.value) return {};
    const grouped: { [key: string]: IGrade[] } = {};
    
    const filteredGrades = summary.value.grades.filter(grade => {
        const query = searchQuery.value.toLowerCase();
        return grade.courseName.toLowerCase().includes(query) || 
               grade.courseCode.toLowerCase().includes(query) ||
               grade.academicPeriod.toLowerCase().includes(query);
    });

    filteredGrades.forEach((grade) => {
        if (!grouped[grade.academicPeriod]) {
            grouped[grade.academicPeriod] = [];
        }
        grouped[grade.academicPeriod]!.push(grade);
    });
    return grouped;
});

const fetchGrades = async () => {
    loading.value = true;
    try {
        summary.value = await gradeService.getStudentGrades(studentId);
    } catch (e) {
        console.error("Error fetching grades", e);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchGrades);

const openNew = () => {
    isEditing.value = false;
    gradeForm.courseCode = '';
    gradeForm.courseName = '';
    gradeForm.score = 0;
    gradeForm.credits = 1;
    gradeForm.academicPeriod = '';
    gradeForm.cycle = 1;
    gradeForm.plan = '2018';
    gradeForm.type = 'O';
    gradeForm.section = '';
    gradeForm.recordCode = '';
    showDialog.value = true;
};

const editGrade = (grade: IGrade) => {
    isEditing.value = true;
    currentGradeId.value = grade.id;
    gradeForm.courseCode = grade.courseCode;
    gradeForm.courseName = grade.courseName;
    gradeForm.score = grade.score;
    gradeForm.credits = grade.credits;
    gradeForm.academicPeriod = grade.academicPeriod;
    gradeForm.cycle = grade.cycle;
    gradeForm.plan = grade.plan;
    gradeForm.type = grade.type;
    gradeForm.section = grade.section;
    gradeForm.recordCode = grade.recordCode;
    showDialog.value = true;
};

const saveGrade = async () => {
    try {
        const payload = {
            courseCode: gradeForm.courseCode,
            courseName: gradeForm.courseName,
            score: gradeForm.score,
            credits: gradeForm.credits,
            academicPeriod: gradeForm.academicPeriod,
            cycle: gradeForm.cycle,
            plan: gradeForm.plan,
            type: gradeForm.type,
            section: gradeForm.section,
            recordCode: gradeForm.recordCode
        };

        if (isEditing.value && currentGradeId.value) {
            await gradeService.updateGrade(currentGradeId.value, payload);
        } else {
            await gradeService.addGrade(studentId, payload);
        }
        showDialog.value = false;
        await fetchGrades();
    } catch (e) {
        console.error("Error saving grade", e);
    }
};

const deleteGrade = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta nota?')) {
        try {
            await gradeService.deleteGrade(id);
            await fetchGrades();
        } catch (e) {
            console.error("Error deleting grade", e);
        }
    }
};

const openStudentEdit = () => {
    if (summary.value?.student) {
        studentForm.studentId = summary.value.student.studentId;
        studentForm.fullName = summary.value.student.fullName;
        studentForm.faculty = summary.value.student.faculty;
        studentForm.school = summary.value.student.school;
        studentForm.specialty = summary.value.student.specialty;
        studentForm.plan = summary.value.student.plan;
        showStudentDialog.value = true;
    }
};

const saveStudentInfo = async () => {
    try {
        await gradeService.updateStudentInfo(studentId, studentForm as IStudent);
        showStudentDialog.value = false;
        await fetchGrades();
    } catch (e) {
        console.error("Error saving student info", e);
    }
};

const getTypeLabel = (type: string) => {
    const found = courseTypes.find(t => t.value === type);
    return found ? found.label : type;
};

const getSeverity = (score: number) => score >= 11 ? 'success' : 'danger';

const openBatchImport = () => {
    batchText.value = '';
    batchResult.value = null;
    showBatchDialog.value = true;
};

const processBatchImport = async () => {
    try {
        const result = await gradeService.addGradesFromText(studentId, batchText.value);
        batchResult.value = result;
        
        if (result.success) {
            await fetchGrades();
            setTimeout(() => {
                showBatchDialog.value = false;
            }, 2000);
        }
    } catch (e) {
        console.error("Error processing batch import", e);
        batchResult.value = {
            success: false,
            imported: 0,
            failed: 0,
            errors: ['Error de conexión con el servidor']
        };
    }
};
</script>

<template>
    <div class="min-h-screen bg-slate-50/50 p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
            <!-- Header Section -->
            <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                <div class="flex items-center gap-5">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 hover:rotate-3 transition-transform duration-300">
                        <i class="pi pi-book text-white text-2xl"></i>
                    </div>
                    <div>
                        <h1 class="text-4xl font-black text-slate-900 tracking-tighter">EduTrack</h1>
                        <p class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Gestión Académica</p>
                    </div>
                </div>
                <div class="flex gap-4 w-full md:w-auto">
                    <Button label="Importar Texto" icon="pi pi-file-import" severity="secondary" text @click="openBatchImport" class="flex-1 md:flex-none font-bold hover:bg-slate-100" />
                    <Button label="Nueva Nota" icon="pi pi-plus" @click="openNew" class="flex-1 md:flex-none shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all px-8 py-4 font-bold" />
                </div>
            </header>

        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <i class="pi pi-spin pi-spinner text-4xl text-blue-500 mb-4"></i>
            <p class="text-slate-400 animate-pulse">Cargando historial académico...</p>
        </div>

        <div v-else-if="summary" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Student & Summary Card -->
            <aside class="lg:col-span-4 space-y-8">
                <!-- Student Info Card -->
                <div class="bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div class="bg-gradient-to-r from-slate-800 to-slate-900 p-6 flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                <i class="pi pi-user text-white"></i>
                            </div>
                            <span class="text-white font-bold text-lg tracking-tight">Perfil del Estudiante</span>
                        </div>
                        <Button icon="pi pi-pencil" text rounded class="text-white/70 hover:text-white hover:bg-white/10 transition-colors w-8 h-8" @click="openStudentEdit" />
                    </div>
                    
                    <div class="p-6 space-y-6">
                        <div class="flex items-center gap-4 group">
                            <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-id-card text-blue-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Código de Matrícula</p>
                                <p class="font-black text-slate-800 text-lg tracking-tight">{{ summary.student.studentId }}</p>
                            </div>
                        </div>

                        <div class="h-px bg-slate-50"></div>

                        <div class="flex items-center gap-4 group">
                            <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-user text-indigo-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                                <p class="font-bold text-slate-800 text-base leading-tight">{{ summary.student.fullName }}</p>
                            </div>
                        </div>

                        <div class="h-px bg-slate-50"></div>

                        <div class="flex items-center gap-4 group">
                            <div class="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-building text-violet-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Facultad</p>
                                <p class="font-medium text-slate-600 text-sm leading-snug">{{ summary.student.faculty }}</p>
                            </div>
                        </div>

                        <div class="h-px bg-slate-50"></div>

                        <div class="flex items-center gap-4 group">
                            <div class="w-12 h-12 rounded-2xl bg-fuchsia-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                <i class="pi pi-map text-fuchsia-600 text-xl"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Escuela Profesional</p>
                                <p class="font-medium text-slate-600 text-sm leading-snug">{{ summary.student.school }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Credit Summary Card -->
                <div class="bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
                    <div class="p-6 border-b border-slate-50">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                                <i class="pi pi-chart-pie text-emerald-600"></i>
                            </div>
                            <span class="text-slate-800 font-bold text-lg">Resumen Académico</span>
                        </div>
                    </div>

                    <div class="p-8 flex flex-col items-center">
                        <div class="relative mb-8 group cursor-default">
                            <!-- Outer Ring -->
                            <div class="w-48 h-48 rounded-full border-[16px] border-slate-50 flex items-center justify-center relative z-10 bg-white">
                                <div class="text-center">
                                    <span class="block text-5xl font-black tracking-tighter text-slate-800 mb-1 group-hover:scale-110 transition-transform duration-300">
                                        {{ summary.creditSummary.weightedAverage }}
                                    </span>
                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Promedio Ponderado</span>
                                </div>
                            </div>
                            <!-- Decorative Glow -->
                            <div class="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full -z-0 scale-75 group-hover:scale-100 transition-transform duration-500"></div>
                        </div>

                        <div class="w-full grid grid-cols-1 gap-3">
                            <div class="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors group">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <i class="pi pi-check text-emerald-600 text-xs font-bold"></i>
                                    </div>
                                    <span class="text-xs font-bold text-emerald-900 uppercase tracking-wider">Créditos Aprobados</span>
                                </div>
                                <span class="text-xl font-black text-emerald-600">{{ summary.creditSummary.approvedCredits }}</span>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <i class="pi pi-list text-slate-600 text-xs font-bold"></i>
                                    </div>
                                    <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Créditos Requeridos</span>
                                </div>
                                <span class="text-xl font-black text-slate-700">{{ summary.creditSummary.requiredCredits }}</span>
                            </div>

                            <div class="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 hover:bg-amber-50 transition-colors group">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <i class="pi pi-exclamation-triangle text-amber-600 text-xs font-bold"></i>
                                    </div>
                                    <span class="text-xs font-bold text-amber-900 uppercase tracking-wider">Créditos Faltantes</span>
                                </div>
                                <span class="text-xl font-black text-amber-600">{{ summary.creditSummary.remainingCredits }}</span>
                            </div>
                        </div>

                        <div class="w-full mt-6">
                            <div class="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                <span>Progreso de la Carrera</span>
                                <span>{{ ((summary.creditSummary.approvedCredits / summary.creditSummary.requiredCredits) * 100).toFixed(1) }}%</span>
                            </div>
                            <div class="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                     :style="{ width: `${(summary.creditSummary.approvedCredits / summary.creditSummary.requiredCredits) * 100}%` }">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- Main Content -->
            <main class="lg:col-span-8 space-y-6">
                <!-- Filters -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
                    <div class="relative w-full">
                        <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <InputText v-model="searchQuery" 
                                  placeholder="Buscar por curso, código o periodo..." 
                                  class="w-full pl-12 py-4 border-slate-100 bg-slate-50/50 rounded-xl focus:bg-white transition-all" />
                    </div>
                </div>

                <!-- Grades by Period -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between px-2">
                        <h2 class="text-xl font-extrabold text-slate-800 tracking-tight">Historial Académico</h2>
                        <Tag :value="Object.keys(gradesByPeriod).length + ' Periodos'" severity="info" class="font-bold" />
                    </div>

                    <Accordion :multiple="true" :value="[0]" class="space-y-4">
                        <AccordionTab v-for="(grades, period) in gradesByPeriod" :key="period">
                            <template #header>
                                <div class="flex items-center justify-between w-full">
                                    <div class="flex items-center gap-6">
                                        <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-blue-100 transition-colors">
                                            <i class="pi pi-calendar text-blue-600 text-xl"></i>
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Periodo Académico</span>
                                            <span class="text-xl font-black text-slate-800 leading-none">{{ period }}</span>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-6">
                                        <div class="hidden md:flex flex-col items-end">
                                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Promedio</span>
                                            <div class="flex items-baseline gap-1">
                                                <span class="text-2xl font-black text-blue-600">
                                                    {{ (grades.reduce((acc, g) => acc + g.score, 0) / grades.length).toFixed(2) }}
                                                </span>
                                                <span class="text-xs font-bold text-slate-400">/ 20</span>
                                            </div>
                                        </div>
                                        <div class="h-8 w-px bg-slate-200 hidden md:block"></div>
                                        <Tag :value="grades.length + ' cursos'" severity="secondary" class="font-bold px-4 py-2 text-sm" />
                                    </div>
                                </div>
                            </template>
                            
                            <div class="overflow-hidden rounded-b-xl border-t border-slate-100">
                                <DataTable :value="grades" stripedRows responsiveLayout="stack" breakpoint="960px">
                                    <Column field="courseCode" header="Código" class="font-mono text-xs text-slate-500 w-24"></Column>
                                    <Column field="courseName" header="Asignatura" sortable>
                                        <template #body="slotProps">
                                            <div class="flex flex-col">
                                                <span class="font-bold text-slate-800">{{ slotProps.data.courseName }}</span>
                                                <span class="text-[10px] text-slate-400 md:hidden">{{ slotProps.data.courseCode }}</span>
                                            </div>
                                        </template>
                                    </Column>
                                    <Column field="type" header="Tipo" class="w-32">
                                        <template #body="slotProps">
                                            <Tag :value="getTypeLabel(slotProps.data.type)" severity="secondary" class="text-[10px] font-bold uppercase tracking-tight" />
                                        </template>
                                    </Column>
                                    <Column field="credits" header="Créd." class="text-center w-20">
                                        <template #body="slotProps">
                                            <div class="flex flex-col items-center">
                                                <span class="text-xs text-slate-400 md:hidden">Créditos</span>
                                                <span class="font-bold text-slate-700">{{ slotProps.data.credits }}</span>
                                            </div>
                                        </template>
                                    </Column>
                                    <Column field="score" header="Nota" class="w-24">
                                        <template #body="slotProps">
                                            <div class="flex flex-col items-center md:items-start">
                                                <span class="text-xs text-slate-400 md:hidden mb-1">Calificación</span>
                                                <Tag :value="slotProps.data.score.toString()" :severity="getSeverity(slotProps.data.score)" class="font-black text-sm px-4" />
                                            </div>
                                        </template>
                                    </Column>
                                    <Column header="Acciones" class="text-right w-28">
                                        <template #body="slotProps">
                                            <div class="flex justify-end gap-3">
                                                <Button icon="pi pi-pencil" severity="secondary" text rounded @click="editGrade(slotProps.data)" class="w-9 h-9 hover:bg-blue-50 hover:text-blue-600 transition-all" />
                                                <Button icon="pi pi-trash" severity="danger" text rounded @click="deleteGrade(slotProps.data.id)" class="w-9 h-9 hover:bg-red-50 transition-all" />
                                            </div>
                                        </template>
                                    </Column>
                                </DataTable>
                            </div>
                        </AccordionTab>
                    </Accordion>

                    <div v-if="Object.keys(gradesByPeriod).length === 0" class="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                        <i class="pi pi-search text-4xl text-slate-200 mb-4"></i>
                        <p class="text-slate-500 font-medium">No se encontraron cursos que coincidan con tu búsqueda.</p>
                        <Button label="Limpiar búsqueda" text @click="searchQuery = ''" class="mt-2" />
                    </div>
                </div>
            </main>
        </div>

        <!-- Grade Form Dialog -->
        <Dialog v-model:visible="showDialog" 
                :header="isEditing ? 'Editar Nota' : 'Registrar Nueva Nota'" 
                :modal="true" 
                :draggable="false"
                :closable="true"
                style="width: 650px"
                :breakpoints="{'960px': '90vw'}">
            <div class="flex flex-col gap-5 py-4 bg-white">
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="courseCode" class="text-xs font-bold text-slate-500 uppercase">Código</label>
                        <InputText id="courseCode" v-model="gradeForm.courseCode" placeholder="INE002" class="w-full font-mono" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="academicPeriod" class="text-xs font-bold text-slate-500 uppercase">Período</label>
                        <InputText id="academicPeriod" v-model="gradeForm.academicPeriod" placeholder="2022-1" class="w-full" />
                    </div>
                </div>
                
                <div class="flex flex-col gap-2">
                    <label for="courseName" class="text-xs font-bold text-slate-500 uppercase">Nombre del Curso</label>
                    <InputText id="courseName" v-model="gradeForm.courseName" placeholder="PROGRAMACIÓN Y COMPUTACIÓN" class="w-full" />
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="cycle" class="text-xs font-bold text-slate-500 uppercase">Ciclo</label>
                        <InputNumber id="cycle" v-model="gradeForm.cycle" :min="1" :max="10" showButtons class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="score" class="text-xs font-bold text-slate-500 uppercase">Nota</label>
                        <InputNumber id="score" v-model="gradeForm.score" :min="0" :max="20" showButtons class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="credits" class="text-xs font-bold text-slate-500 uppercase">Créditos</label>
                        <InputNumber id="credits" v-model="gradeForm.credits" :min="1" :max="10" showButtons class="w-full" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label for="type" class="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                        <Dropdown id="type" v-model="gradeForm.type" :options="courseTypes" optionLabel="label" optionValue="value" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label for="section" class="text-xs font-bold text-slate-500 uppercase">Sección</label>
                        <InputText id="section" v-model="gradeForm.section" placeholder="2" class="w-full" />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="recordCode" class="text-xs font-bold text-slate-500 uppercase">Código de Acta</label>
                    <InputText id="recordCode" v-model="gradeForm.recordCode" placeholder="P - 2022120120180INE0022P" class="w-full font-mono text-xs" />
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3 justify-end pt-2">
                    <Button label="Cancelar" icon="pi pi-times" text severity="secondary" @click="showDialog = false" />
                    <Button :label="isEditing ? 'Actualizar' : 'Guardar'" icon="pi pi-check" @click="saveGrade" class="shadow-md px-6" />
                </div>
            </template>
        </Dialog>

        <!-- Student Info Dialog -->
        <Dialog v-model:visible="showStudentDialog" 
                header="Editar Información del Estudiante" 
                :modal="true" 
                :draggable="false"
                style="width: 550px"
                :breakpoints="{'960px': '90vw'}">
            <div class="flex flex-col gap-5 py-4">
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-500 uppercase">Código de Matrícula</label>
                    <InputText v-model="studentForm.studentId" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                    <InputText v-model="studentForm.fullName" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-500 uppercase">Facultad</label>
                    <InputText v-model="studentForm.faculty" class="w-full" />
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-500 uppercase">Escuela</label>
                    <InputText v-model="studentForm.school" class="w-full" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase">Especialidad</label>
                        <InputText v-model="studentForm.specialty" class="w-full" />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold text-slate-500 uppercase">Plan</label>
                        <InputText v-model="studentForm.plan" class="w-full" />
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3 justify-end pt-2">
                    <Button label="Cancelar" icon="pi pi-times" text severity="secondary" @click="showStudentDialog = false" />
                    <Button label="Guardar" icon="pi pi-check" @click="saveStudentInfo" class="shadow-md px-6" />
                </div>
            </template>
        </Dialog>
        
        <!-- Batch Import Dialog -->
        <Dialog v-model:visible="showBatchDialog" 
                header="Importar Cursos desde Texto" 
                :modal="true" 
                :draggable="false"
                style="width: 750px"
                :breakpoints="{'960px': '95vw'}">
            <div class="flex flex-col gap-5 py-4">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p class="text-sm text-blue-800 font-medium mb-2">
                        <i class="pi pi-info-circle mr-2"></i>Formato esperado:
                    </p>
                    <pre class="text-xs bg-white p-3 rounded border border-blue-100 overflow-x-auto">Periodo Académico 2023-0
Ciclo Plan Tipo Asignatura Calif. Créd. Sec. Acta
3 2018 O 20118033 - ORGANIZACIÓN Y ADMINISTRACIÓN 19 3.0 1 P - 2023020120180201180331P
3 2018 O 20118037 - MATEMÁTICAS DISCRETAS 20 3.0 1 P - 2023020120180201180371P</pre>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-slate-500 uppercase">Pega aquí el texto copiado</label>
                    <Textarea v-model="batchText" 
                              rows="12" 
                              class="w-full font-mono text-sm"
                              placeholder="Pega aquí el contenido de tus cursos..." />
                </div>

                <div v-if="batchResult" class="space-y-3">
                    <Message v-if="batchResult.success" severity="success" :closable="false">
                        ✓ Se importaron {{ batchResult.imported }} curso(s) exitosamente
                    </Message>
                    
                    <Message v-if="batchResult.failed > 0" severity="warn" :closable="false">
                        ⚠ {{ batchResult.failed }} curso(s) no pudieron ser procesados
                    </Message>

                    <div v-if="batchResult.errors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p class="text-xs font-bold text-red-700 mb-2">Errores:</p>
                        <ul class="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                            <li v-for="(error, idx) in batchResult.errors" :key="idx" class="flex items-start gap-2">
                                <span class="text-red-400">•</span>
                                <span>{{ error }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3 justify-end pt-2">
                    <Button label="Cancelar" icon="pi pi-times" text severity="secondary" @click="showBatchDialog = false" />
                    <Button label="Procesar" icon="pi pi-check" @click="processBatchImport" :disabled="!batchText.trim()" class="shadow-md px-6" />
                </div>
            </template>
        </Dialog>
        </div>
    </div>
</template>

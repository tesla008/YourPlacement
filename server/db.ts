import fs from 'fs';
import path from 'path';
import {
  User,
  Student,
  PlacementHistoryItem,
  CoordinatorAccount,
  ImportLog,
  PlacementStatus,
  DashboardStats,
  Company,
  PlacementDrive,
  EligibilityCriteria,
  DriveRegistration,
  DriveStatusHistoryItem,
  StudentNotification,
  EligibilityResult,
} from '../src/types.ts';
import { checkEligibility, calculateEligibleCountPreview } from '../src/lib/eligibility.ts';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  students: Student[];
  coordinators: CoordinatorAccount[];
  placement_history: PlacementHistoryItem[];
  import_logs: ImportLog[];
  companies: Company[];
  placement_drives: PlacementDrive[];
  eligibility_criteria: EligibilityCriteria[];
  drive_registrations: DriveRegistration[];
  drive_status_history: DriveStatusHistoryItem[];
  notifications: StudentNotification[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'placement_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class RelationalDatabase {
  private data: DatabaseSchema = {
    users: [],
    students: [],
    coordinators: [],
    placement_history: [],
    import_logs: [],
    companies: [],
    placement_drives: [],
    eligibility_criteria: [],
    drive_registrations: [],
    drive_status_history: [],
    notifications: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all arrays exist
        this.data.users = this.data.users || [];
        this.data.students = this.data.students || [];
        this.data.coordinators = this.data.coordinators || [];
        this.data.placement_history = this.data.placement_history || [];
        this.data.import_logs = this.data.import_logs || [];
        this.data.companies = this.data.companies || [];
        this.data.placement_drives = this.data.placement_drives || [];
        this.data.eligibility_criteria = this.data.eligibility_criteria || [];
        this.data.drive_registrations = this.data.drive_registrations || [];
        this.data.drive_status_history = this.data.drive_status_history || [];
        this.data.notifications = this.data.notifications || [];

        // If placement drives are empty in existing file, seed them!
        if (this.data.placement_drives.length === 0) {
          console.log('[DB] Seeding placement drives and companies into existing database...');
          this.seedPlacementDrives();
        }

        console.log(`[DB] Loaded ${this.data.students.length} students, ${this.data.placement_drives.length} drives.`);
        return;
      } catch (err) {
        console.error('[DB] Failed to parse existing db file, re-seeding...', err);
      }
    }
    this.seedDemoData();
  }

  private save() {
    try {
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Error persisting database file:', err);
    }
  }

  public seedDemoData() {
    console.log('[DB] Seeding realistic placement database with ~100 students...');

    // 1. Users
    const users: (User & { passwordHash: string })[] = [
      {
        id: 'usr_admin_1',
        name: 'Dr. Arvind Kulkarni (TPO Head)',
        email: 'admin@college.edu',
        passwordHash: 'admin123',
        role: 'admin',
        department: null,
        batch: null,
        is_active: true,
        created_at: '2025-01-10T09:00:00.000Z',
      },
      {
        id: 'usr_coord_1',
        name: 'Prof. Priya Mehta',
        email: 'cs.coord@college.edu',
        passwordHash: 'coord123',
        role: 'coordinator',
        department: 'Computer Technology',
        batch: '2027',
        is_active: true,
        created_at: '2025-01-15T10:30:00.000Z',
      },
      {
        id: 'usr_coord_2',
        name: 'Prof. Rajesh Kumar',
        email: 'it.coord@college.edu',
        passwordHash: 'coord123',
        role: 'coordinator',
        department: 'Information Technology',
        batch: '2027',
        is_active: true,
        created_at: '2025-01-15T11:00:00.000Z',
      },
      {
        id: 'usr_coord_3',
        name: 'Prof. Suresh Patil',
        email: 'mech.coord@college.edu',
        passwordHash: 'coord123',
        role: 'coordinator',
        department: 'Mechanical',
        batch: '2027',
        is_active: true,
        created_at: '2025-01-16T09:15:00.000Z',
      },
      // Demo Students for Student Mode
      {
        id: 'usr_stu_1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@college.edu',
        passwordHash: 'student123',
        role: 'student',
        department: 'Computer Technology',
        batch: '2027',
        student_id: 'STU1001',
        is_active: true,
        created_at: '2025-01-20T09:00:00.000Z',
      },
      {
        id: 'usr_stu_2',
        name: 'Sanika Joshi',
        email: 'sanika.joshi@college.edu',
        passwordHash: 'student123',
        role: 'student',
        department: 'Information Technology',
        batch: '2027',
        student_id: 'STU1002',
        is_active: true,
        created_at: '2025-01-20T09:00:00.000Z',
      },
      {
        id: 'usr_stu_3',
        name: 'Rohan Verma',
        email: 'rohan.verma@college.edu',
        passwordHash: 'student123',
        role: 'student',
        department: 'Mechanical',
        batch: '2027',
        student_id: 'STU1003',
        is_active: true,
        created_at: '2025-01-20T09:00:00.000Z',
      },
      {
        id: 'usr_stu_4',
        name: 'Ananya Iyer',
        email: 'ananya.iyer@college.edu',
        passwordHash: 'student123',
        role: 'student',
        department: 'Electronics',
        batch: '2027',
        student_id: 'STU1004',
        is_active: true,
        created_at: '2025-01-20T09:00:00.000Z',
      },
    ];

    // 2. Coordinators table
    const coordinators: CoordinatorAccount[] = [
      {
        id: 'coord_cs_1',
        user_id: 'usr_coord_1',
        name: 'Prof. Priya Mehta',
        email: 'cs.coord@college.edu',
        department: 'Computer Technology',
        batch: '2027',
        is_active: true,
        created_at: '2025-01-15T10:30:00.000Z',
      },
      {
        id: 'coord_it_1',
        user_id: 'usr_coord_2',
        name: 'Prof. Rajesh Kumar',
        email: 'it.coord@college.edu',
        department: 'Information Technology',
        batch: '2027',
        is_active: true,
        created_at: '2025-01-15T11:00:00.000Z',
      },
      {
        id: 'coord_mech_1',
        user_id: 'usr_coord_3',
        name: 'Prof. Suresh Patil',
        email: 'mech.coord@college.edu',
        department: 'Mechanical',
        batch: '2027',
        is_active: true,
        created_at: '2025-01-16T09:15:00.000Z',
      },
    ];

    // 3. Students ~105 students across 6 departments
    const departments = [
      { name: 'Computer Technology', branch: 'Computer Engineering', code: 'CS', count: 32 },
      { name: 'Information Technology', branch: 'Information Technology', code: 'IT', count: 26 },
      { name: 'Electronics', branch: 'Electronics & Telecomm.', code: 'EC', count: 18 },
      { name: 'Electrical', branch: 'Electrical Engineering', code: 'EE', count: 12 },
      { name: 'Mechanical', branch: 'Mechanical Engineering', code: 'ME', count: 12 },
      { name: 'Civil', branch: 'Civil Engineering', code: 'CE', count: 10 },
    ];

    const firstNames = [
      'Aarav', 'Aditi', 'Ananya', 'Aryan', 'Ayush', 'Bhavya', 'Chirag', 'Dev', 'Diya', 'Eshan',
      'Gaurav', 'Harsh', 'Isha', 'Ishaan', 'Jaya', 'Karan', 'Kavya', 'Krish', 'Manav', 'Meera',
      'Mohit', 'Neha', 'Nikhil', 'Pooja', 'Pranav', 'Priya', 'Rahul', 'Rhea', 'Rohan', 'Ruchi',
      'Sahil', 'Sakshi', 'Sameer', 'Sanika', 'Shreya', 'Siddharth', 'Simran', 'Tanmay', 'Varun', 'Vidhi'
    ];
    const lastNames = [
      'Sharma', 'Verma', 'Patel', 'Deshmukh', 'Mehta', 'Kulkarni', 'Joshi', 'Gupta', 'Singh', 'Reddy',
      'Iyer', 'Nair', 'Bose', 'Chatterjee', 'Chopra', 'Malhotra', 'Shinde', 'Pawar', 'Bhat', 'Rao'
    ];

    const companies = [
      { name: 'TCS', roles: ['Software Engineer', 'Systems Engineer'], minPkg: 3.6, maxPkg: 7.0 },
      { name: 'Infosys', roles: ['Systems Engineer Specialist', 'Associate Consultant'], minPkg: 4.0, maxPkg: 9.5 },
      { name: 'Deloitte', roles: ['Analyst', 'Consultant - Cloud & Tech'], minPkg: 7.6, maxPkg: 10.5 },
      { name: 'Accenture', roles: ['Associate Software Engineer', 'Advanced App Engineering Analyst'], minPkg: 4.5, maxPkg: 8.5 },
      { name: 'Amazon', roles: ['Software Development Engineer I', 'Cloud Support Associate'], minPkg: 16.0, maxPkg: 28.5 },
      { name: 'Microsoft', roles: ['Software Engineer', 'Support Engineer'], minPkg: 18.0, maxPkg: 26.0 },
      { name: 'Capgemini', roles: ['Senior Analyst', 'Software Associate'], minPkg: 4.25, maxPkg: 7.5 },
      { name: 'Wipro', roles: ['Project Engineer', 'Turbo Developer'], minPkg: 3.5, maxPkg: 6.5 },
      { name: 'Tata Motors', roles: ['Graduate Engineer Trainee', 'R&D Engineer'], minPkg: 6.0, maxPkg: 8.5 },
      { name: 'L&T', roles: ['Graduate Engineer Trainee', 'Design Engineer'], minPkg: 5.5, maxPkg: 7.5 },
      { name: 'Cognizant', roles: ['GenC Next Developer', 'Programmer Analyst'], minPkg: 4.0, maxPkg: 6.8 },
    ];

    const students: Student[] = [];
    const placementHistory: PlacementHistoryItem[] = [];

    let stuCounter = 1000;

    departments.forEach((dept) => {
      for (let i = 1; i <= dept.count; i++) {
        stuCounter++;
        const fName = firstNames[(stuCounter * 7) % firstNames.length];
        const lName = lastNames[(stuCounter * 11) % lastNames.length];
        let fullName = `${fName} ${lName}`;
        let email = `${fName.toLowerCase()}.${lName.toLowerCase()}${stuCounter % 99}@college.edu`;
        const phone = `+91 ${9800000000 + (stuCounter * 1234) % 19999999}`;
        const rollNumber = `2023${dept.code}${i < 10 ? '00' + i : '0' + i}`;
        const enrollmentNumber = `EN2023${dept.code}${100 + i}`;
        const batch = stuCounter % 15 === 0 ? '2026' : '2027'; // mostly 2027, some 2026

        // CGPA realistic 6.20 - 9.85
        let cgpa = Number((6.2 + ((stuCounter * 17) % 360) / 100).toFixed(2));
        let tenth = Number((72 + ((stuCounter * 13) % 260) / 10).toFixed(1));
        let twelfth = Number((68 + ((stuCounter * 19) % 280) / 10).toFixed(1));

        // Placement distribution: ~60% placed, ~25% not placed, ~8% higher studies, ~4% not interested, ~3% other
        const seedMod = (stuCounter * 23) % 100;
        let status: PlacementStatus = 'Not Placed';
        let company: string | null = null;
        let jobRole: string | null = null;
        let pkg: number | null = null;
        let placementDate: string | null = null;
        let placementType: Student['placement_type'] = null;
        let location: string | null = null;
        let remarks: string | null = null;

        // Ensure distinct, well-calibrated demo student accounts
        if (stuCounter === 1001) {
          fullName = 'Rahul Sharma';
          email = 'rahul.sharma@college.edu';
          cgpa = 8.45;
          tenth = 88.0;
          twelfth = 85.0;
          status = 'Not Placed';
          company = null;
          jobRole = null;
          pkg = null;
          placementDate = null;
          placementType = null;
          location = null;
          remarks = 'Registered for TCS & Deloitte campus drives';
        } else if (stuCounter === 1002) {
          fullName = 'Sanika Joshi';
          email = 'sanika.joshi@college.edu';
          cgpa = 7.75;
          tenth = 82.5;
          twelfth = 79.0;
          status = 'Not Placed';
          company = null;
          jobRole = null;
          pkg = null;
          placementDate = null;
          placementType = null;
          location = null;
          remarks = 'Interested in Software Analyst & Development roles';
        } else if (stuCounter === 1003) {
          fullName = 'Rohan Verma';
          email = 'rohan.verma@college.edu';
          cgpa = 6.40;
          tenth = 72.0;
          twelfth = 68.0;
          status = 'Not Placed';
          company = null;
          jobRole = null;
          pkg = null;
          placementDate = null;
          placementType = null;
          location = null;
          remarks = 'Core Mechanical aspirant; active in SAE club';
        } else if (stuCounter === 1004) {
          fullName = 'Ananya Iyer';
          email = 'ananya.iyer@college.edu';
          cgpa = 8.90;
          tenth = 91.0;
          twelfth = 89.0;
          status = 'Not Placed';
          company = null;
          jobRole = null;
          pkg = null;
          placementDate = null;
          placementType = null;
          location = null;
          remarks = 'VLSI & Embedded Systems enthusiast';
        } else if (seedMod < 58) {
          status = 'Placed';
          // pick company
          const compIdx = (stuCounter * 5) % companies.length;
          const comp = companies[compIdx];
          company = comp.name;
          jobRole = comp.roles[stuCounter % comp.roles.length];
          const pkgRange = comp.maxPkg - comp.minPkg;
          pkg = Number((comp.minPkg + (pkgRange * ((stuCounter * 13) % 100)) / 100).toFixed(1));
          const month = (stuCounter % 8) + 1;
          const day = (stuCounter % 27) + 1;
          placementDate = `2026-0${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
          const types: Student['placement_type'][] = ['On Campus', 'On Campus', 'Pool Campus', 'Off Campus'];
          placementType = types[stuCounter % types.length];
          const locs = ['Bengaluru', 'Pune', 'Hyderabad', 'Mumbai', 'Noida', 'Gurugram', 'Chennai'];
          location = locs[stuCounter % locs.length];
          remarks = 'Shortlisted in day-1 drive, completed HR interview';
        } else if (seedMod < 67) {
          status = 'Higher Studies';
          remarks = 'Preparing for GATE / GRE & MS in Computer Science';
        } else if (seedMod < 72) {
          status = 'Not Interested';
          remarks = 'Joining family business / startup venture';
        } else if (seedMod < 75) {
          status = 'Other';
          remarks = 'Preparing for Civil Services (UPSC/MPSC)';
        } else {
          status = 'Not Placed';
          remarks = 'Actively appearing for upcoming campus drives';
        }

        const studentId = `STU${stuCounter}`;
        const student: Student = {
          id: `stu_${studentId}`,
          student_id: studentId,
          roll_number: rollNumber,
          enrollment_number: enrollmentNumber,
          name: fullName,
          email,
          phone,
          department: dept.name,
          branch: dept.branch,
          batch,
          cgpa,
          tenth_percentage: tenth,
          twelfth_percentage: twelfth,
          diploma_percentage: stuCounter % 7 === 0 ? Number((75 + (stuCounter % 15)).toFixed(1)) : null,
          placement_status: status,
          company,
          job_role: jobRole,
          package: pkg,
          placement_date: placementDate,
          placement_type: placementType,
          location,
          remarks,
          updated_by: 'System Seed',
          created_at: '2026-01-15T08:00:00.000Z',
          updated_at: placementDate ? `${placementDate}T12:00:00.000Z` : '2026-01-15T08:00:00.000Z',
        };

        students.push(student);

        // Add history record for placed students
        if (status === 'Placed') {
          placementHistory.push({
            id: `hist_${stuCounter}`,
            student_id: student.student_id,
            student_name: student.name,
            roll_number: student.roll_number,
            previous_status: 'Not Placed',
            new_status: 'Placed',
            company: student.company,
            package: student.package,
            changed_by: 'Prof. Priya Mehta (Coordinator)',
            changed_by_role: 'coordinator',
            changed_at: `${placementDate}T14:30:00.000Z`,
            remarks: `Placed at ${student.company} with ₹${student.package} LPA`,
          });
        }
      }
    });

    // 4. Import log
    const importLogs: ImportLog[] = [
      {
        id: 'log_initial_seed',
        filename: 'Final_Year_Students_Batch_2027_Master.xlsx',
        total_records: students.length,
        successful_records: students.length,
        failed_records: 0,
        duplicate_action: 'skip',
        imported_by: 'Dr. Arvind Kulkarni (TPO Head)',
        imported_at: '2026-01-15T09:30:00.000Z',
        errors_summary: 'Clean import, 0 errors detected.',
      },
    ];

    this.data = {
      users,
      coordinators,
      students,
      placement_history: placementHistory,
      import_logs: importLogs,
      companies: [],
      placement_drives: [],
      eligibility_criteria: [],
      drive_registrations: [],
      drive_status_history: [],
      notifications: [],
    };

    this.seedPlacementDrives();
    this.save();
  }

  // --- Auth & Users ---
  public findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  // --- Coordinator Management ---
  public getCoordinators() {
    return this.data.coordinators;
  }

  public addCoordinator(params: {
    name: string;
    email: string;
    department: string;
    batch: string;
  }) {
    const existing = this.data.users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error(`A user with email ${params.email} already exists.`);
    }

    const userId = `usr_coord_${Date.now()}`;
    const coordId = `coord_${Date.now()}`;

    const newUser = {
      id: userId,
      name: params.name,
      email: params.email,
      passwordHash: 'coord123', // default initial password
      role: 'coordinator' as const,
      department: params.department,
      batch: params.batch,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const newCoord: CoordinatorAccount = {
      id: coordId,
      user_id: userId,
      name: params.name,
      email: params.email,
      department: params.department,
      batch: params.batch,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.data.coordinators.push(newCoord);
    this.save();
    return newCoord;
  }

  public updateCoordinator(id: string, params: {
    name?: string;
    department?: string;
    batch?: string;
    is_active?: boolean;
    resetPassword?: boolean;
  }) {
    const coordIndex = this.data.coordinators.findIndex((c) => c.id === id);
    if (coordIndex === -1) throw new Error('Coordinator not found');
    const coord = this.data.coordinators[coordIndex];

    const userIndex = this.data.users.findIndex((u) => u.id === coord.user_id);
    if (userIndex !== -1) {
      if (params.name) this.data.users[userIndex].name = params.name;
      if (params.department) this.data.users[userIndex].department = params.department;
      if (params.batch) this.data.users[userIndex].batch = params.batch;
      if (params.is_active !== undefined) this.data.users[userIndex].is_active = params.is_active;
      if (params.resetPassword) this.data.users[userIndex].passwordHash = 'coord123';
    }

    this.data.coordinators[coordIndex] = {
      ...coord,
      name: params.name ?? coord.name,
      department: params.department ?? coord.department,
      batch: params.batch ?? coord.batch,
      is_active: params.is_active !== undefined ? params.is_active : coord.is_active,
    };

    this.save();
    return this.data.coordinators[coordIndex];
  }

  public toggleCoordinatorStatus(id: string) {
    const coord = this.data.coordinators.find((c) => c.id === id);
    if (!coord) throw new Error('Coordinator not found');
    return this.updateCoordinator(id, { is_active: !coord.is_active });
  }

  // --- Students CRUD & Scoping ---
  public getStudents(params: {
    search?: string;
    status?: string;
    department?: string;
    branch?: string;
    batch?: string;
    minCgpa?: number;
    maxCgpa?: number;
    company?: string;
    userScope?: { role: string; department: string | null; batch: string | null };
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    let filtered = [...this.data.students];

    // Role-based scope enforcement (Coordinator can only view assigned students)
    if (params.userScope?.role === 'coordinator') {
      if (params.userScope.department && params.userScope.department !== 'All') {
        filtered = filtered.filter(
          (s) => s.department.toLowerCase() === params.userScope!.department!.toLowerCase()
        );
      }
      if (params.userScope.batch && params.userScope.batch !== 'All') {
        filtered = filtered.filter((s) => s.batch === params.userScope!.batch);
      }
    }

    // Search query: Student name, roll number, enrollment number, email, company
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.roll_number.toLowerCase().includes(q) ||
          s.student_id.toLowerCase().includes(q) ||
          s.enrollment_number.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.company && s.company.toLowerCase().includes(q))
      );
    }

    // Filter by placement status
    if (params.status && params.status !== 'All') {
      filtered = filtered.filter((s) => s.placement_status === params.status);
    }

    // Filter by department
    if (params.department && params.department !== 'All') {
      filtered = filtered.filter((s) => s.department === params.department);
    }

    // Filter by branch
    if (params.branch && params.branch !== 'All') {
      filtered = filtered.filter((s) => s.branch === params.branch);
    }

    // Filter by batch
    if (params.batch && params.batch !== 'All') {
      filtered = filtered.filter((s) => s.batch === params.batch);
    }

    // Filter by company
    if (params.company && params.company !== 'All') {
      filtered = filtered.filter((s) => s.company?.toLowerCase() === params.company!.toLowerCase());
    }

    // Filter by CGPA range
    if (params.minCgpa !== undefined && !isNaN(params.minCgpa)) {
      filtered = filtered.filter((s) => s.cgpa >= params.minCgpa!);
    }
    if (params.maxCgpa !== undefined && !isNaN(params.maxCgpa)) {
      filtered = filtered.filter((s) => s.cgpa <= params.maxCgpa!);
    }

    // Sorting
    const sortBy = params.sortBy || 'roll_number';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      let aVal = (a as any)[sortBy];
      let bVal = (b as any)[sortBy];
      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';
      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * sortOrder;
      }
      return (aVal - bVal) * sortOrder;
    });

    const total = filtered.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      students: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public getAllStudentsForExport(params: {
    status?: string;
    department?: string;
    batch?: string;
    company?: string;
    userScope?: { role: string; department: string | null; batch: string | null };
  }) {
    let filtered = [...this.data.students];

    if (params.userScope?.role === 'coordinator') {
      if (params.userScope.department && params.userScope.department !== 'All') {
        filtered = filtered.filter(
          (s) => s.department.toLowerCase() === params.userScope!.department!.toLowerCase()
        );
      }
      if (params.userScope.batch && params.userScope.batch !== 'All') {
        filtered = filtered.filter((s) => s.batch === params.userScope!.batch);
      }
    }

    if (params.status && params.status !== 'All') {
      filtered = filtered.filter((s) => s.placement_status === params.status);
    }
    if (params.department && params.department !== 'All') {
      filtered = filtered.filter((s) => s.department === params.department);
    }
    if (params.batch && params.batch !== 'All') {
      filtered = filtered.filter((s) => s.batch === params.batch);
    }
    if (params.company && params.company !== 'All') {
      filtered = filtered.filter((s) => s.company?.toLowerCase() === params.company!.toLowerCase());
    }

    return filtered;
  }

  public getStudentById(id: string) {
    const student = this.data.students.find((s) => s.id === id || s.student_id === id);
    if (!student) return null;

    // Get audit history for this student
    const history = this.data.placement_history.filter(
      (h) => h.student_id === student.student_id
    ).sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());

    return {
      student,
      history,
    };
  }

  public createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>, actor: { name: string; role: string }) {
    // Validate uniqueness
    if (this.data.students.some((s) => s.student_id === studentData.student_id)) {
      throw new Error(`Student ID ${studentData.student_id} already exists.`);
    }
    if (this.data.students.some((s) => s.roll_number.toLowerCase() === studentData.roll_number.toLowerCase())) {
      throw new Error(`Roll number ${studentData.roll_number} already exists.`);
    }

    const now = new Date().toISOString();
    const newStudent: Student = {
      ...studentData,
      id: `stu_${studentData.student_id}_${Date.now()}`,
      updated_by: `${actor.name} (${actor.role})`,
      created_at: now,
      updated_at: now,
    };

    this.data.students.push(newStudent);

    if (newStudent.placement_status === 'Placed') {
      this.data.placement_history.push({
        id: `hist_${Date.now()}`,
        student_id: newStudent.student_id,
        student_name: newStudent.name,
        roll_number: newStudent.roll_number,
        previous_status: 'Not Placed',
        new_status: 'Placed',
        company: newStudent.company,
        package: newStudent.package,
        changed_by: `${actor.name} (${actor.role})`,
        changed_by_role: actor.role as any,
        changed_at: now,
        remarks: newStudent.remarks || 'Initial placement record created',
      });
    }

    this.save();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>, actor: { name: string; role: string }) {
    const index = this.data.students.findIndex((s) => s.id === id || s.student_id === id);
    if (index === -1) throw new Error('Student not found');

    const current = this.data.students[index];

    // Unique roll_number check if changed
    if (updates.roll_number && updates.roll_number !== current.roll_number) {
      if (this.data.students.some((s) => s.id !== current.id && s.roll_number.toLowerCase() === updates.roll_number!.toLowerCase())) {
        throw new Error(`Roll number ${updates.roll_number} is already in use by another student.`);
      }
    }

    const now = new Date().toISOString();
    const updated: Student = {
      ...current,
      ...updates,
      updated_by: `${actor.name} (${actor.role})`,
      updated_at: now,
    };

    this.data.students[index] = updated;
    this.save();
    return updated;
  }

  public deleteStudent(id: string) {
    const index = this.data.students.findIndex((s) => s.id === id || s.student_id === id);
    if (index === -1) throw new Error('Student not found');
    const removed = this.data.students.splice(index, 1)[0];
    this.save();
    return removed;
  }

  // --- Placement Status Update Workflow & Audit Trail ---
  public updatePlacementStatus(
    id: string,
    params: {
      new_status: PlacementStatus;
      company?: string | null;
      job_role?: string | null;
      package?: number | null;
      placement_date?: string | null;
      placement_type?: Student['placement_type'];
      location?: string | null;
      remarks?: string | null;
      confirmedRevertToUnplaced?: boolean;
    },
    actor: { name: string; role: string; department?: string | null; batch?: string | null }
  ) {
    const index = this.data.students.findIndex((s) => s.id === id || s.student_id === id);
    if (index === -1) throw new Error('Student not found');

    const student = this.data.students[index];

    // Check scope if coordinator
    if (actor.role === 'coordinator') {
      if (actor.department && actor.department !== 'All' && student.department.toLowerCase() !== actor.department.toLowerCase()) {
        throw new Error('Access denied: You can only update placement status for your assigned department.');
      }
      if (actor.batch && actor.batch !== 'All' && student.batch !== actor.batch) {
        throw new Error('Access denied: You can only update placement status for your assigned batch.');
      }
    }

    // Edge case: when changing placed back to not placed, require confirmation flag
    if (student.placement_status === 'Placed' && params.new_status === 'Not Placed') {
      if (!params.confirmedRevertToUnplaced) {
        throw new Error('CONFIRMATION_REQUIRED: Student is already marked as Placed. Reverting to Not Placed requires confirmation.');
      }
    }

    // Edge case: If new status is Placed, company and package should be provided
    if (params.new_status === 'Placed') {
      if (!params.company || !params.company.trim()) {
        throw new Error('Company name is required when marking a student as Placed.');
      }
      if (params.package === undefined || params.package === null || isNaN(Number(params.package))) {
        throw new Error('Package (in LPA) is required when marking a student as Placed.');
      }
    }

    const previousStatus = student.placement_status;
    const now = new Date().toISOString();

    const isNowPlaced = params.new_status === 'Placed';

    const updatedStudent: Student = {
      ...student,
      placement_status: params.new_status,
      company: isNowPlaced ? params.company : (params.new_status === 'Higher Studies' || params.new_status === 'Not Interested' ? null : student.company),
      job_role: isNowPlaced ? (params.job_role || null) : null,
      package: isNowPlaced ? Number(params.package) : null,
      placement_date: isNowPlaced ? (params.placement_date || new Date().toISOString().split('T')[0]) : null,
      placement_type: isNowPlaced ? (params.placement_type || 'On Campus') : null,
      location: isNowPlaced ? (params.location || null) : null,
      remarks: params.remarks !== undefined ? params.remarks : student.remarks,
      updated_by: `${actor.name} (${actor.role})`,
      updated_at: now,
    };

    this.data.students[index] = updatedStudent;

    // Record audit history entry
    const historyItem: PlacementHistoryItem = {
      id: `hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      student_id: student.student_id,
      student_name: student.name,
      roll_number: student.roll_number,
      previous_status: previousStatus,
      new_status: params.new_status,
      company: isNowPlaced ? params.company : null,
      package: isNowPlaced ? Number(params.package) : null,
      changed_by: `${actor.name} (${actor.role})`,
      changed_by_role: actor.role as any,
      changed_at: now,
      remarks: params.remarks || (isNowPlaced ? `Placed at ${params.company} (₹${params.package} LPA)` : `Status changed to ${params.new_status}`),
    };

    this.data.placement_history.unshift(historyItem);
    this.save();

    return {
      student: updatedStudent,
      historyItem,
    };
  }

  public getPlacementHistory(studentId?: string, limit = 100) {
    let logs = [...this.data.placement_history];
    if (studentId) {
      logs = logs.filter((h) => h.student_id === studentId);
    }
    logs.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
    return logs.slice(0, limit);
  }

  public getImportLogs() {
    return [...this.data.import_logs].sort(
      (a, b) => new Date(b.imported_at).getTime() - new Date(a.imported_at).getTime()
    );
  }

  public addImportLog(log: Omit<ImportLog, 'id' | 'imported_at'>) {
    const newLog: ImportLog = {
      ...log,
      id: `log_${Date.now()}`,
      imported_at: new Date().toISOString(),
    };
    this.data.import_logs.unshift(newLog);
    this.save();
    return newLog;
  }

  // --- Dynamic Dashboard Stats Calculation ---
  public calculateDashboardStats(filters?: {
    batch?: string;
    department?: string;
    userScope?: { role: string; department: string | null; batch: string | null };
  }): DashboardStats {
    let students = [...this.data.students];

    // Apply coordinator scope
    if (filters?.userScope?.role === 'coordinator') {
      if (filters.userScope.department && filters.userScope.department !== 'All') {
        students = students.filter(
          (s) => s.department.toLowerCase() === filters.userScope!.department!.toLowerCase()
        );
      }
      if (filters.userScope.batch && filters.userScope.batch !== 'All') {
        students = students.filter((s) => s.batch === filters.userScope!.batch);
      }
    }

    // Apply dashboard top filters
    if (filters?.batch && filters.batch !== 'All') {
      students = students.filter((s) => s.batch === filters.batch);
    }
    if (filters?.department && filters.department !== 'All') {
      students = students.filter((s) => s.department === filters.department);
    }

    const totalStudents = students.length;
    const placedStudents = students.filter((s) => s.placement_status === 'Placed').length;
    const unplacedStudents = students.filter((s) => s.placement_status === 'Not Placed').length;
    const higherStudies = students.filter((s) => s.placement_status === 'Higher Studies').length;
    const notInterested = students.filter((s) => s.placement_status === 'Not Interested').length;
    const otherStatus = students.filter((s) => s.placement_status === 'Other').length;

    // Total eligible students: Total - (Higher Studies + Not Interested)
    // Formula from requirement: Placed Students / Total Eligible Students * 100
    const eligibleStudents = Math.max(0, totalStudents - (higherStudies + notInterested));
    const placementPercentage =
      eligibleStudents > 0
        ? Number(((placedStudents / eligibleStudents) * 100).toFixed(1))
        : totalStudents > 0
        ? Number(((placedStudents / totalStudents) * 100).toFixed(1))
        : 0;

    // Package metrics
    const placedWithPkg = students.filter((s) => s.placement_status === 'Placed' && s.package && s.package > 0);
    const avgPkg =
      placedWithPkg.length > 0
        ? Number((placedWithPkg.reduce((sum, s) => sum + (s.package || 0), 0) / placedWithPkg.length).toFixed(2))
        : 0;
    const maxPkg =
      placedWithPkg.length > 0
        ? Math.max(...placedWithPkg.map((s) => s.package || 0))
        : 0;

    // Distinct companies
    const distinctCompanies = new Set(
      students.filter((s) => s.company && s.company.trim()).map((s) => s.company!.trim())
    );

    // Status distribution
    const statusDistribution = [
      { name: 'Placed', value: placedStudents, color: '#16a34a' },
      { name: 'Not Placed', value: unplacedStudents, color: '#dc2626' },
      { name: 'Higher Studies', value: higherStudies, color: '#2563eb' },
      { name: 'Not Interested', value: notInterested, color: '#64748b' },
      { name: 'Other', value: otherStatus, color: '#d97706' },
    ];

    // Department-wise placement
    const deptMap = new Map<string, { total: number; placed: number; unplaced: number; higher: number }>();
    students.forEach((s) => {
      const d = s.department || 'Unknown';
      const curr = deptMap.get(d) || { total: 0, placed: 0, unplaced: 0, higher: 0 };
      curr.total++;
      if (s.placement_status === 'Placed') curr.placed++;
      else if (s.placement_status === 'Not Placed') curr.unplaced++;
      else if (s.placement_status === 'Higher Studies') curr.higher++;
      deptMap.set(d, curr);
    });

    const departmentStats = Array.from(deptMap.entries())
      .map(([department, dStats]) => {
        const eligible = dStats.total - dStats.higher;
        const pct = eligible > 0 ? Number(((dStats.placed / eligible) * 100).toFixed(1)) : 0;
        return {
          department,
          total: dStats.total,
          placed: dStats.placed,
          unplaced: dStats.unplaced,
          higherStudies: dStats.higher,
          percentage: pct,
        };
      })
      .sort((a, b) => b.total - a.total);

    // Company-wise placement
    const compMap = new Map<string, { count: number; packages: number[] }>();
    students
      .filter((s) => s.placement_status === 'Placed' && s.company)
      .forEach((s) => {
        const comp = s.company!.trim();
        const curr = compMap.get(comp) || { count: 0, packages: [] };
        curr.count++;
        if (s.package) curr.packages.push(s.package);
        compMap.set(comp, curr);
      });

    const companyStats = Array.from(compMap.entries())
      .map(([company, cStats]) => {
        const avg =
          cStats.packages.length > 0
            ? Number((cStats.packages.reduce((a, b) => a + b, 0) / cStats.packages.length).toFixed(2))
            : 0;
        const highest = cStats.packages.length > 0 ? Math.max(...cStats.packages) : 0;
        return {
          company,
          students: cStats.count,
          avgPackage: avg,
          highestPackage: highest,
        };
      })
      .sort((a, b) => b.students - a.students)
      .slice(0, 10);

    // Batch distribution
    const batchMap = new Map<string, { total: number; placed: number }>();
    students.forEach((s) => {
      const b = s.batch || 'Unknown';
      const curr = batchMap.get(b) || { total: 0, placed: 0 };
      curr.total++;
      if (s.placement_status === 'Placed') curr.placed++;
      batchMap.set(b, curr);
    });

    const batchDistribution = Array.from(batchMap.entries()).map(([batch, bStats]) => ({
      batch,
      total: bStats.total,
      placed: bStats.placed,
      percentage: bStats.total > 0 ? Number(((bStats.placed / bStats.total) * 100).toFixed(1)) : 0,
    }));

    // Available filters extracted dynamically
    const availableDepartments = Array.from(
      new Set(this.data.students.map((s) => s.department).filter(Boolean))
    ).sort();
    const availableBatches = Array.from(
      new Set(this.data.students.map((s) => s.batch).filter(Boolean))
    ).sort();

    return {
      totalStudents,
      placedStudents,
      unplacedStudents,
      placementPercentage,
      higherStudies,
      notInterested,
      otherStatus,
      averagePackage: avgPkg,
      highestPackage: maxPkg,
      totalCompanies: distinctCompanies.size,
      statusDistribution,
      departmentStats,
      companyStats,
      batchDistribution,
      availableDepartments,
      availableBatches,
    };
  }

  // --- Bulk Import with Duplicate Resolution ---
  public bulkImport(
    incomingStudents: Partial<Student>[],
    duplicateAction: 'skip' | 'update' | 'new',
    actor: { name: string; role: string },
    filename: string
  ) {
    let successCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const now = new Date().toISOString();

    for (const raw of incomingStudents) {
      if (!raw.student_id || !raw.roll_number || !raw.name) {
        continue;
      }

      const existingIndex = this.data.students.findIndex(
        (s) =>
          s.student_id.toLowerCase() === raw.student_id!.toLowerCase() ||
          s.roll_number.toLowerCase() === raw.roll_number!.toLowerCase()
      );

      if (existingIndex !== -1) {
        if (duplicateAction === 'skip') {
          skippedCount++;
          continue;
        } else if (duplicateAction === 'update') {
          const current = this.data.students[existingIndex];
          this.data.students[existingIndex] = {
            ...current,
            ...raw,
            id: current.id,
            updated_by: `${actor.name} (${actor.role}) - Excel Import`,
            updated_at: now,
          } as Student;
          updatedCount++;
          successCount++;
          continue;
        } else {
          // 'new': append suffix to student_id and roll_number to make unique
          raw.student_id = `${raw.student_id}_new_${Date.now().toString().slice(-4)}`;
          raw.roll_number = `${raw.roll_number}_dup`;
        }
      }

      const fullStudent: Student = {
        id: `stu_${raw.student_id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        student_id: raw.student_id!,
        roll_number: raw.roll_number!,
        enrollment_number: raw.enrollment_number || `EN_${raw.student_id}`,
        name: raw.name!,
        email: raw.email || `${raw.student_id.toLowerCase()}@college.edu`,
        phone: raw.phone || '+91 9999999999',
        department: raw.department || 'Computer Technology',
        branch: raw.branch || raw.department || 'Engineering',
        batch: raw.batch || '2027',
        cgpa: typeof raw.cgpa === 'number' ? raw.cgpa : parseFloat(String(raw.cgpa || 7.0)) || 7.0,
        tenth_percentage: raw.tenth_percentage || 75.0,
        twelfth_percentage: raw.twelfth_percentage || 75.0,
        diploma_percentage: raw.diploma_percentage || null,
        placement_status: (raw.placement_status as PlacementStatus) || 'Not Placed',
        company: raw.company || null,
        job_role: raw.job_role || null,
        package: raw.package ? Number(raw.package) : null,
        placement_date: raw.placement_date || null,
        placement_type: raw.placement_type || null,
        location: raw.location || null,
        remarks: raw.remarks || null,
        updated_by: `${actor.name} (${actor.role}) - Excel Import`,
        created_at: now,
        updated_at: now,
      };

      this.data.students.push(fullStudent);
      successCount++;
    }

    this.data.import_logs.unshift({
      id: `log_${Date.now()}`,
      filename: filename || 'students_upload.xlsx',
      total_records: incomingStudents.length,
      successful_records: successCount,
      failed_records: incomingStudents.length - (successCount + skippedCount),
      duplicate_action: duplicateAction,
      imported_by: `${actor.name} (${actor.role})`,
      imported_at: now,
      errors_summary: `Import finished. ${successCount} imported/updated, ${skippedCount} duplicates skipped.`,
    });

    this.save();

    return {
      total: incomingStudents.length,
      successful: successCount,
      skipped: skippedCount,
      updated: updatedCount,
    };
  }

  // --- Reports Generation ---
  public getReportsSummary() {
    const stats = this.calculateDashboardStats();

    // Detailed company reports with min, max, avg
    const compMap = new Map<string, { count: number; packages: number[] }>();
    this.data.students
      .filter((s) => s.placement_status === 'Placed' && s.company)
      .forEach((s) => {
        const comp = s.company!.trim();
        const curr = compMap.get(comp) || { count: 0, packages: [] };
        curr.count++;
        if (s.package) curr.packages.push(s.package);
        compMap.set(comp, curr);
      });

    const companyReport = Array.from(compMap.entries()).map(([company, data]) => {
      const avg = data.packages.length > 0 ? data.packages.reduce((a, b) => a + b, 0) / data.packages.length : 0;
      const highest = data.packages.length > 0 ? Math.max(...data.packages) : 0;
      const lowest = data.packages.length > 0 ? Math.min(...data.packages) : 0;
      return {
        company,
        studentsCount: data.count,
        averagePackage: Number(avg.toFixed(2)),
        highestPackage: Number(highest.toFixed(2)),
        lowestPackage: Number(lowest.toFixed(2)),
      };
    }).sort((a, b) => b.studentsCount - a.studentsCount);

    return {
      overall: {
        totalStudents: stats.totalStudents,
        eligibleStudents: Math.max(0, stats.totalStudents - (stats.higherStudies + stats.notInterested)),
        placedStudents: stats.placedStudents,
        unplacedStudents: stats.unplacedStudents,
        higherStudies: stats.higherStudies,
        notInterested: stats.notInterested,
        placementPercentage: stats.placementPercentage,
        averagePackage: stats.averagePackage,
        highestPackage: stats.highestPackage,
      },
      departments: stats.departmentStats,
      companies: companyReport,
      batches: stats.batchDistribution,
    };
  }

  // ==========================================
  // PLACEMENT DRIVES, COMPANIES & STUDENT MODE
  // ==========================================

  public seedPlacementDrives() {
    console.log('[DB] Seeding comprehensive placement drives and companies...');

    // 1. Companies
    const companies: Company[] = [
      {
        id: 'comp_tcs',
        name: 'TCS',
        industry: 'IT Services & Consulting',
        website: 'https://www.tcs.com',
        description: 'Tata Consultancy Services is a global leader in IT services, consulting, and business solutions.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_deloitte',
        name: 'Deloitte',
        industry: 'Management & Tech Consulting',
        website: 'https://www.deloitte.com',
        description: 'Deloitte provides audit, consulting, financial advisory, risk management, and tax services.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_accenture',
        name: 'Accenture',
        industry: 'Digital Transformation & Technology',
        website: 'https://www.accenture.com',
        description: 'Global professional services company with leading capabilities in digital, cloud, and security.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_amazon',
        name: 'Amazon',
        industry: 'Cloud Computing & E-Commerce',
        website: 'https://www.amazon.jobs',
        description: 'Amazon focuses on cloud services (AWS), customer-centric software engineering, and AI systems.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_infosys',
        name: 'Infosys',
        industry: 'Enterprise Software & Digital Services',
        website: 'https://www.infosys.com',
        description: 'Infosys enables clients across 50+ countries to navigate their digital transformation.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_tatamotors',
        name: 'Tata Motors',
        industry: 'Automotive & Clean Mobility',
        website: 'https://www.tatamotors.com',
        description: 'Leading automobile manufacturer pioneering Electric Vehicles and next-gen vehicle architecture.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_microsoft',
        name: 'Microsoft',
        industry: 'Operating Systems & Cloud Infrastructure',
        website: 'https://careers.microsoft.com',
        description: 'Empowering every person and every organization on the planet to achieve more through software.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_capgemini',
        name: 'Capgemini',
        industry: 'Technology Services & Digital Engineering',
        website: 'https://www.capgemini.com',
        description: 'Global leader in consulting, technology transformation, and digital operations.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_wipro',
        name: 'Wipro',
        industry: 'Cognitive Computing & Hyper-Automation',
        website: 'https://www.wipro.com',
        description: 'Harnessing the power of cognitive computing, hyper-automation, robotics, cloud, and analytics.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'comp_lnt',
        name: 'L&T',
        industry: 'Heavy Engineering & Infrastructure',
        website: 'https://www.larsentoubro.com',
        description: 'Larsen & Toubro is a technology, engineering, construction, manufacturing and financial services conglomerate.',
        created_at: '2026-01-10T10:00:00.000Z',
      },
    ];

    // 2. Drives & Eligibility Criteria
    const placementDrives: PlacementDrive[] = [
      {
        id: 'drive_tcs_2026',
        company_id: 'comp_tcs',
        company_name: 'TCS',
        company_industry: 'IT Services & Consulting',
        job_role: 'Software Engineer',
        package: 7.2,
        package_display: '₹7.2 LPA',
        location: 'Pune / Bengaluru',
        drive_date: '2026-09-25',
        drive_time: '09:30 AM',
        application_deadline: '2026-09-22',
        venue: 'Main Placement Auditorium & Computer Labs 1-4',
        drive_type: 'On Campus',
        openings: 50,
        status: 'Applications Open',
        description: 'TCS Digital campus hiring drive for batch 2027. Multi-stage assessment: online cognitive & coding round, technical interview, and HR interview.',
        created_by: 'Dr. Arvind Kulkarni (TPO Head)',
        created_at: '2026-09-01T09:00:00.000Z',
        updated_at: '2026-09-01T09:00:00.000Z',
        eligibility: {
          id: 'elig_tcs_2026',
          drive_id: 'drive_tcs_2026',
          minimum_cgpa: 7.0,
          minimum_10th_marks: 60.0,
          minimum_12th_marks: 60.0,
          maximum_backlogs: 0,
          eligible_branches: ['Computer Technology', 'Information Technology', 'Electronics & Telecommunication'],
          eligible_batches: ['2027'],
        },
      },
      {
        id: 'drive_deloitte_2026',
        company_id: 'comp_deloitte',
        company_name: 'Deloitte',
        company_industry: 'Management & Tech Consulting',
        job_role: 'Analyst',
        package: 8.5,
        package_display: '₹8.5 LPA',
        location: 'Hyderabad / Bengaluru',
        drive_date: '2026-09-28',
        drive_time: '10:00 AM',
        application_deadline: '2026-09-24',
        venue: 'Virtual Assessment Platform & Seminar Hall B',
        drive_type: 'Pool Campus',
        openings: 25,
        status: 'Applications Open',
        description: 'Deloitte USI Analyst hiring for Consulting and Cloud Engineering practice. Versant voice test, technical case study, and partner interview.',
        created_by: 'Dr. Arvind Kulkarni (TPO Head)',
        created_at: '2026-09-02T10:00:00.000Z',
        updated_at: '2026-09-02T10:00:00.000Z',
        eligibility: {
          id: 'elig_deloitte_2026',
          drive_id: 'drive_deloitte_2026',
          minimum_cgpa: 7.5,
          minimum_10th_marks: 65.0,
          minimum_12th_marks: 65.0,
          maximum_backlogs: 0,
          eligible_branches: ['Computer Technology', 'Information Technology'],
          eligible_batches: ['2027'],
        },
      },
      {
        id: 'drive_accenture_2026',
        company_id: 'comp_accenture',
        company_name: 'Accenture',
        company_industry: 'Digital Transformation & Technology',
        job_role: 'Associate Software Engineer',
        package: 6.8,
        package_display: '₹6.8 LPA',
        location: 'Bengaluru / Pune / Gurugram',
        drive_date: '2026-10-02',
        drive_time: '09:00 AM',
        application_deadline: '2026-09-28',
        venue: 'Online Assessment / College Placement Center',
        drive_type: 'Online',
        openings: 80,
        status: 'Upcoming',
        description: 'Accenture nationwide campus drive for Associate Software Engineer and Advanced Application Engineering Analyst positions.',
        created_by: 'Dr. Arvind Kulkarni (TPO Head)',
        created_at: '2026-09-03T11:00:00.000Z',
        updated_at: '2026-09-03T11:00:00.000Z',
        eligibility: {
          id: 'elig_accenture_2026',
          drive_id: 'drive_accenture_2026',
          minimum_cgpa: 6.5,
          minimum_10th_marks: 60.0,
          minimum_12th_marks: 60.0,
          maximum_backlogs: 1,
          eligible_branches: [
            'Computer Technology',
            'Information Technology',
            'Electronics & Telecommunication',
            'Electrical',
            'Mechanical',
          ],
          eligible_batches: ['2027'],
        },
      },
      {
        id: 'drive_amazon_2026',
        company_id: 'comp_amazon',
        company_name: 'Amazon',
        company_industry: 'Cloud Computing & E-Commerce',
        job_role: 'Software Development Engineer I',
        package: 28.5,
        package_display: '₹28.5 LPA',
        location: 'Hyderabad / Bengaluru',
        drive_date: '2026-10-08',
        drive_time: '11:00 AM',
        application_deadline: '2026-10-01',
        venue: 'Virtual Chime Interviews & Online Coding',
        drive_type: 'Off Campus',
        openings: 12,
        status: 'Upcoming',
        description: 'SDE-1 recruitment for AWS and Consumer teams. Rigorous Data Structures, Algorithms, System Design basics and Leadership Principles.',
        created_by: 'Dr. Arvind Kulkarni (TPO Head)',
        created_at: '2026-09-05T12:00:00.000Z',
        updated_at: '2026-09-05T12:00:00.000Z',
        eligibility: {
          id: 'elig_amazon_2026',
          drive_id: 'drive_amazon_2026',
          minimum_cgpa: 8.0,
          minimum_10th_marks: 75.0,
          minimum_12th_marks: 75.0,
          maximum_backlogs: 0,
          eligible_branches: ['Computer Technology', 'Information Technology'],
          eligible_batches: ['2027'],
        },
      },
      {
        id: 'drive_infosys_2026',
        company_id: 'comp_infosys',
        company_name: 'Infosys',
        company_industry: 'Enterprise Software & Digital Services',
        job_role: 'Systems Engineer Specialist',
        package: 9.5,
        package_display: '₹9.5 LPA',
        location: 'Mysuru / Pune / Bengaluru',
        drive_date: '2026-10-12',
        drive_time: '10:00 AM',
        application_deadline: '2026-10-05',
        venue: 'Campus Training Hall A',
        drive_type: 'On Campus',
        openings: 35,
        status: 'Upcoming',
        description: 'Specialized engineer roles through campus placement track. Hands-on coding in modern languages and cloud frameworks.',
        created_by: 'Prof. Rajesh Kumar (Coordinator)',
        created_at: '2026-09-06T14:00:00.000Z',
        updated_at: '2026-09-06T14:00:00.000Z',
        eligibility: {
          id: 'elig_infosys_2026',
          drive_id: 'drive_infosys_2026',
          minimum_cgpa: 7.0,
          minimum_10th_marks: 65.0,
          minimum_12th_marks: 65.0,
          maximum_backlogs: 0,
          eligible_branches: ['Computer Technology', 'Information Technology', 'Electronics & Telecommunication'],
          eligible_batches: ['2027'],
        },
      },
      {
        id: 'drive_tatamotors_2026',
        company_id: 'comp_tatamotors',
        company_name: 'Tata Motors',
        company_industry: 'Automotive & Clean Mobility',
        job_role: 'Graduate Engineer Trainee',
        package: 8.5,
        package_display: '₹8.5 LPA',
        location: 'Pune / Jamshedpur',
        drive_date: '2026-10-15',
        drive_time: '09:30 AM',
        application_deadline: '2026-10-08',
        venue: 'Mechanical Engineering Block & Auditorium',
        drive_type: 'On Campus',
        openings: 20,
        status: 'Upcoming',
        description: 'GET hiring for Electric Mobility, Vehicle Architecture, and Advanced Manufacturing Operations.',
        created_by: 'Prof. Suresh Patil (Coordinator)',
        created_at: '2026-09-07T15:00:00.000Z',
        updated_at: '2026-09-07T15:00:00.000Z',
        eligibility: {
          id: 'elig_tatamotors_2026',
          drive_id: 'drive_tatamotors_2026',
          minimum_cgpa: 6.8,
          minimum_10th_marks: 60.0,
          minimum_12th_marks: 60.0,
          maximum_backlogs: 0,
          eligible_branches: ['Mechanical', 'Electrical'],
          eligible_batches: ['2027'],
        },
      },
      {
        id: 'drive_microsoft_2026',
        company_id: 'comp_microsoft',
        company_name: 'Microsoft',
        company_industry: 'Operating Systems & Cloud Infrastructure',
        job_role: 'Software Engineer',
        package: 26.0,
        package_display: '₹26.0 LPA',
        location: 'Hyderabad / Bengaluru / Noida',
        drive_date: '2026-10-20',
        drive_time: '10:00 AM',
        application_deadline: '2026-10-10',
        venue: 'Virtual Teams Assessment & Whiteboarding',
        drive_type: 'Off Campus',
        openings: 8,
        status: 'Upcoming',
        description: 'Core Engineering Teams. Strong emphasis on computer science fundamentals, algorithm efficiency, and problem solving.',
        created_by: 'Dr. Arvind Kulkarni (TPO Head)',
        created_at: '2026-09-08T16:00:00.000Z',
        updated_at: '2026-09-08T16:00:00.000Z',
        eligibility: {
          id: 'elig_microsoft_2026',
          drive_id: 'drive_microsoft_2026',
          minimum_cgpa: 8.5,
          minimum_10th_marks: 75.0,
          minimum_12th_marks: 75.0,
          maximum_backlogs: 0,
          eligible_branches: ['Computer Technology', 'Information Technology'],
          eligible_batches: ['2027'],
        },
      },
      {
        id: 'drive_capgemini_2026',
        company_id: 'comp_capgemini',
        company_name: 'Capgemini',
        company_industry: 'Technology Services & Digital Engineering',
        job_role: 'Senior Analyst',
        package: 7.5,
        package_display: '₹7.5 LPA',
        location: 'Mumbai / Pune / Bengaluru',
        drive_date: '2026-10-25',
        drive_time: '09:30 AM',
        application_deadline: '2026-10-18',
        venue: 'Placement Hall B & IT Labs',
        drive_type: 'On Campus',
        openings: 45,
        status: 'Upcoming',
        description: 'Cloud & Custom Applications Development. Pseudocode, English communication, and game-based aptitude.',
        created_by: 'Dr. Arvind Kulkarni (TPO Head)',
        created_at: '2026-09-09T17:00:00.000Z',
        updated_at: '2026-09-09T17:00:00.000Z',
        eligibility: {
          id: 'elig_capgemini_2026',
          drive_id: 'drive_capgemini_2026',
          minimum_cgpa: 6.8,
          minimum_10th_marks: 60.0,
          minimum_12th_marks: 60.0,
          maximum_backlogs: 0,
          eligible_branches: ['Computer Technology', 'Information Technology', 'Electronics & Telecommunication'],
          eligible_batches: ['2027'],
        },
      },
    ];

    const eligibilityCriteria: EligibilityCriteria[] = placementDrives.map((d) => d.eligibility);

    // 3. Drive Registrations
    const driveRegistrations: DriveRegistration[] = [];
    const driveStatusHistory: DriveStatusHistoryItem[] = [];

    // Helper to register student
    const addReg = (
      driveId: string,
      studentId: string,
      regStatus: DriveRegistration['registration_status'],
      selStatus: DriveRegistration['selection_status'],
      date: string,
      remarks?: string
    ) => {
      driveRegistrations.push({
        id: `reg_${driveId}_${studentId}`,
        drive_id: driveId,
        student_id: studentId,
        registration_status: regStatus,
        selection_status: selStatus,
        registered_at: `${date}T10:00:00.000Z`,
        updated_at: `${date}T14:30:00.000Z`,
        remarks: remarks || null,
      });

      driveStatusHistory.push({
        id: `dhist_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        drive_id: driveId,
        student_id: studentId,
        previous_status: 'Eligible',
        new_status: selStatus,
        changed_by: 'TPO System & Student Action',
        changed_at: `${date}T14:30:00.000Z`,
      });
    };

    // Demo student Rahul Sharma (STU1001) registrations
    addReg('drive_tcs_2026', 'STU1001', 'Registered', 'Test Scheduled', '2026-09-10', 'Online cognitive & coding test scheduled for 25 Sep 2026 in Lab 2.');
    addReg('drive_deloitte_2026', 'STU1001', 'Registered', 'Registered', '2026-09-12', 'Application registered successfully.');
    addReg('drive_accenture_2026', 'STU1001', 'Registered', 'Registered', '2026-09-14', 'Registered for upcoming drive.');

    // Demo student Sanika Joshi (STU1002) registrations
    addReg('drive_tcs_2026', 'STU1002', 'Registered', 'Registered', '2026-09-11', 'Registration confirmed.');
    addReg('drive_deloitte_2026', 'STU1002', 'Registered', 'Registered', '2026-09-13', 'Registration confirmed.');

    // Demo student Rohan Verma (STU1003) registrations
    addReg('drive_tatamotors_2026', 'STU1003', 'Registered', 'Registered', '2026-09-14', 'Registration confirmed for GET drive.');

    // Seed registrations for other unplaced or placed students across the campus
    this.data.students.slice(4, 35).forEach((stu, idx) => {
      // Register for TCS if eligible
      const tcsCrit = placementDrives[0].eligibility;
      if (checkEligibility(stu, tcsCrit).eligible) {
        const selStatus = idx % 5 === 0 ? 'Shortlisted' : idx % 3 === 0 ? 'Test Scheduled' : 'Registered';
        addReg('drive_tcs_2026', stu.student_id, 'Registered', selStatus, '2026-09-08');
      }
      // Register for Deloitte if eligible
      const deloitteCrit = placementDrives[1].eligibility;
      if (idx % 2 === 0 && checkEligibility(stu, deloitteCrit).eligible) {
        addReg('drive_deloitte_2026', stu.student_id, 'Registered', 'Registered', '2026-09-10');
      }
      // Register for Accenture if eligible
      const accCrit = placementDrives[2].eligibility;
      if (idx % 3 === 0 && checkEligibility(stu, accCrit).eligible) {
        addReg('drive_accenture_2026', stu.student_id, 'Registered', 'Registered', '2026-09-12');
      }
    });

    // 4. Notifications for Students
    const notifications: StudentNotification[] = [
      {
        id: 'notif_1',
        student_id: 'STU1001',
        title: 'Online Test Scheduled — TCS Digital',
        message: 'Your TCS Digital online cognitive and coding round is scheduled for 25 September 2026 at 09:30 AM in Computer Lab 2.',
        drive_id: 'drive_tcs_2026',
        type: 'test',
        is_read: false,
        created_at: '2026-09-14T10:00:00.000Z',
      },
      {
        id: 'notif_2',
        student_id: 'STU1001',
        title: 'New Placement Opportunity: Deloitte Analyst',
        message: 'Deloitte has announced campus hiring for Analyst (₹8.5 LPA). You meet all academic eligibility criteria!',
        drive_id: 'drive_deloitte_2026',
        type: 'drive',
        is_read: false,
        created_at: '2026-09-12T14:30:00.000Z',
      },
      {
        id: 'notif_3',
        student_id: 'STU1001',
        title: 'Registration Deadline Approaching: TCS',
        message: 'Application window for TCS Digital will close on 22 September 2026. Verify your profile details before deadline.',
        drive_id: 'drive_tcs_2026',
        type: 'deadline',
        is_read: true,
        created_at: '2026-09-11T09:00:00.000Z',
      },
      {
        id: 'notif_4',
        student_id: 'STU1002',
        title: 'Registration Confirmed: TCS Digital',
        message: 'Your registration for TCS Digital campus drive has been received by the T&P Cell.',
        drive_id: 'drive_tcs_2026',
        type: 'status_update',
        is_read: false,
        created_at: '2026-09-11T11:00:00.000Z',
      },
      {
        id: 'notif_5',
        student_id: 'STU1003',
        title: 'Tata Motors GET Drive Announced',
        message: 'Tata Motors campus drive announced for Mechanical & Electrical branches. Package ₹8.5 LPA.',
        drive_id: 'drive_tatamotors_2026',
        type: 'drive',
        is_read: false,
        created_at: '2026-09-14T12:00:00.000Z',
      },
    ];

    this.data.companies = companies;
    this.data.placement_drives = placementDrives;
    this.data.eligibility_criteria = eligibilityCriteria;
    this.data.drive_registrations = driveRegistrations;
    this.data.drive_status_history = driveStatusHistory;
    this.data.notifications = notifications;

    this.save();
    console.log(`[DB] Seeding complete: ${companies.length} companies, ${placementDrives.length} drives, ${driveRegistrations.length} registrations.`);
  }

  // --- Companies CRUD ---
  public getCompanies(): Company[] {
    return this.data.companies || [];
  }

  public getCompanyById(id: string): Company | null {
    return this.data.companies.find((c) => c.id === id) || null;
  }

  public createCompany(data: Partial<Company>): Company {
    if (!data.name || !data.name.trim()) {
      throw new Error('Company name is required');
    }
    const newComp: Company = {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: data.name.trim(),
      industry: data.industry?.trim() || 'Technology',
      website: data.website?.trim() || null,
      description: data.description?.trim() || null,
      logo: data.logo || null,
      created_at: new Date().toISOString(),
    };
    this.data.companies.unshift(newComp);
    this.save();
    return newComp;
  }

  // --- Placement Drives CRUD & Filtering ---
  public getPlacementDrives(params?: {
    studentId?: string;
    search?: string;
    status?: string;
    branch?: string;
    driveType?: string;
    packageRange?: string;
    eligibilityFilter?: string; // 'all' | 'eligible' | 'not_eligible'
  }) {
    let student: Student | null = null;
    if (params?.studentId) {
      student = this.data.students.find((s) => s.student_id === params.studentId || s.id === params.studentId) || null;
    }

    let list = this.data.placement_drives.map((drive) => {
      // Calculate real-time counts
      const driveRegs = (this.data.drive_registrations || []).filter((r) => r.drive_id === drive.id);
      const registeredCount = driveRegs.length;
      const shortlistedCount = driveRegs.filter((r) => ['Shortlisted', 'Interview Scheduled', 'Selected'].includes(r.selection_status)).length;
      const selectedCount = driveRegs.filter((r) => r.selection_status === 'Selected').length;

      // Calculate total eligible students across whole college
      let eligibleCount = 0;
      for (const s of this.data.students) {
        if (checkEligibility(s, drive.eligibility).eligible) {
          eligibleCount++;
        }
      }

      // If student perspective is requested:
      let studentEligibility: EligibilityResult | undefined;
      let studentRegistration: DriveRegistration | null = null;

      if (student) {
        studentEligibility = checkEligibility(student, drive.eligibility);
        studentRegistration = driveRegs.find((r) => r.student_id === student!.student_id) || null;
      }

      return {
        ...drive,
        stats: {
          eligibleCount,
          registeredCount,
          shortlistedCount,
          selectedCount,
        },
        studentEligibility,
        studentRegistration,
      };
    });

    // Filters
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.company_name.toLowerCase().includes(q) ||
          d.job_role.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          (d.company_industry && d.company_industry.toLowerCase().includes(q))
      );
    }

    if (params?.status && params.status !== 'All') {
      list = list.filter((d) => d.status === params.status);
    }

    if (params?.driveType && params.driveType !== 'All') {
      list = list.filter((d) => d.drive_type === params.driveType);
    }

    if (params?.branch && params.branch !== 'All') {
      list = list.filter(
        (d) =>
          d.eligibility.eligible_branches.length === 0 ||
          d.eligibility.eligible_branches.some((b) => b.toLowerCase().includes(params.branch!.toLowerCase()))
      );
    }

    if (params?.packageRange && params.packageRange !== 'All') {
      list = list.filter((d) => {
        const pkgVal = typeof d.package === 'number' ? d.package : parseFloat(String(d.package)) || 0;
        if (params.packageRange === 'under_5') return pkgVal < 5;
        if (params.packageRange === '5_10') return pkgVal >= 5 && pkgVal <= 10;
        if (params.packageRange === '10_15') return pkgVal > 10 && pkgVal <= 15;
        if (params.packageRange === 'above_15') return pkgVal > 15;
        return true;
      });
    }

    if (params?.eligibilityFilter && student) {
      if (params.eligibilityFilter === 'eligible') {
        list = list.filter((d) => d.studentEligibility?.eligible === true);
      } else if (params.eligibilityFilter === 'not_eligible') {
        list = list.filter((d) => d.studentEligibility?.eligible === false);
      }
    }

    // Sort by drive date ascending (closest drive first)
    list.sort((a, b) => new Date(a.drive_date).getTime() - new Date(b.drive_date).getTime());

    return list;
  }

  public getPlacementDriveById(id: string, studentId?: string) {
    const list = this.getPlacementDrives({ studentId });
    const drive = list.find((d) => d.id === id);
    if (!drive) return null;
    return drive;
  }

  public createPlacementDrive(
    driveData: Partial<PlacementDrive>,
    criteriaData: Partial<EligibilityCriteria>,
    actorName: string
  ): PlacementDrive {
    if (!driveData.company_name || !driveData.job_role || !driveData.drive_date) {
      throw new Error('Company name, job role, and drive date are required.');
    }

    const driveId = `drive_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const criteriaId = `elig_${driveId}`;

    // Ensure company exists or create
    let company = this.data.companies.find((c) => c.name.toLowerCase() === driveData.company_name!.toLowerCase());
    if (!company) {
      company = {
        id: `comp_${Date.now()}`,
        name: driveData.company_name!.trim(),
        industry: driveData.company_industry || 'Technology',
        website: null,
        description: null,
        created_at: new Date().toISOString(),
      };
      this.data.companies.push(company);
    }

    const pkgNum = typeof driveData.package === 'number' ? driveData.package : parseFloat(String(driveData.package)) || 0;
    const pkgDisplay = driveData.package_display || (pkgNum ? `₹${pkgNum} LPA` : 'As per industry standard');

    const eligibility: EligibilityCriteria = {
      id: criteriaId,
      drive_id: driveId,
      minimum_cgpa: criteriaData.minimum_cgpa !== undefined ? Number(criteriaData.minimum_cgpa) : 6.0,
      minimum_10th_marks: criteriaData.minimum_10th_marks !== undefined ? Number(criteriaData.minimum_10th_marks) : 60.0,
      minimum_12th_marks: criteriaData.minimum_12th_marks !== undefined ? Number(criteriaData.minimum_12th_marks) : 60.0,
      maximum_backlogs: criteriaData.maximum_backlogs !== undefined ? Number(criteriaData.maximum_backlogs) : 0,
      eligible_branches: criteriaData.eligible_branches && criteriaData.eligible_branches.length > 0 ? criteriaData.eligible_branches : ['All Branches'],
      eligible_batches: criteriaData.eligible_batches && criteriaData.eligible_batches.length > 0 ? criteriaData.eligible_batches : ['2027'],
    };

    const newDrive: PlacementDrive = {
      id: driveId,
      company_id: company.id,
      company_name: company.name,
      company_logo: driveData.company_logo || null,
      company_industry: company.industry || 'Technology',
      job_role: driveData.job_role.trim(),
      package: pkgNum,
      package_display: pkgDisplay,
      location: driveData.location || 'College Campus',
      drive_date: driveData.drive_date,
      drive_time: driveData.drive_time || '09:30 AM',
      application_deadline: driveData.application_deadline || driveData.drive_date,
      venue: driveData.venue || 'Placement Auditorium',
      drive_type: driveData.drive_type || 'On Campus',
      openings: driveData.openings ? Number(driveData.openings) : 10,
      status: driveData.status || 'Applications Open',
      description: driveData.description || `Campus recruitment drive by ${company.name} for ${driveData.job_role}.`,
      created_by: actorName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      eligibility,
    };

    this.data.placement_drives.unshift(newDrive);
    this.data.eligibility_criteria.unshift(eligibility);

    // Broadcast notification to all eligible students
    this.data.students.forEach((s) => {
      const res = checkEligibility(s, eligibility);
      if (res.eligible) {
        this.data.notifications.unshift({
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          student_id: s.student_id,
          title: `New Drive: ${newDrive.company_name} (${newDrive.job_role})`,
          message: `${newDrive.company_name} has announced a campus placement drive on ${newDrive.drive_date}. Package: ${newDrive.package_display}. You are eligible to apply!`,
          drive_id: newDrive.id,
          type: 'drive',
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    });

    this.save();
    return newDrive;
  }

  public updatePlacementDrive(
    id: string,
    driveUpdates: Partial<PlacementDrive>,
    criteriaUpdates: Partial<EligibilityCriteria>,
    actorName: string
  ): PlacementDrive {
    const idx = this.data.placement_drives.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Placement drive not found');

    const current = this.data.placement_drives[idx];
    const updatedCriteria: EligibilityCriteria = {
      ...current.eligibility,
      ...criteriaUpdates,
      minimum_cgpa: criteriaUpdates.minimum_cgpa !== undefined ? Number(criteriaUpdates.minimum_cgpa) : current.eligibility.minimum_cgpa,
      minimum_10th_marks: criteriaUpdates.minimum_10th_marks !== undefined ? Number(criteriaUpdates.minimum_10th_marks) : current.eligibility.minimum_10th_marks,
      minimum_12th_marks: criteriaUpdates.minimum_12th_marks !== undefined ? Number(criteriaUpdates.minimum_12th_marks) : current.eligibility.minimum_12th_marks,
      maximum_backlogs: criteriaUpdates.maximum_backlogs !== undefined ? Number(criteriaUpdates.maximum_backlogs) : current.eligibility.maximum_backlogs,
    };

    const pkgNum = driveUpdates.package !== undefined ? (typeof driveUpdates.package === 'number' ? driveUpdates.package : parseFloat(String(driveUpdates.package)) || 0) : current.package;
    const pkgDisplay = driveUpdates.package_display || (typeof pkgNum === 'number' && pkgNum > 0 ? `₹${pkgNum} LPA` : current.package_display);

    const updatedDrive: PlacementDrive = {
      ...current,
      ...driveUpdates,
      package: pkgNum,
      package_display: pkgDisplay,
      updated_at: new Date().toISOString(),
      eligibility: updatedCriteria,
    };

    this.data.placement_drives[idx] = updatedDrive;

    // Also update eligibility_criteria array
    const critIdx = this.data.eligibility_criteria.findIndex((c) => c.drive_id === id);
    if (critIdx !== -1) {
      this.data.eligibility_criteria[critIdx] = updatedCriteria;
    }

    this.save();
    return updatedDrive;
  }

  public deletePlacementDrive(id: string): void {
    const idx = this.data.placement_drives.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Placement drive not found');

    this.data.placement_drives.splice(idx, 1);
    this.data.eligibility_criteria = this.data.eligibility_criteria.filter((c) => c.drive_id !== id);
    this.data.drive_registrations = this.data.drive_registrations.filter((r) => r.drive_id !== id);
    this.save();
  }

  // --- Student Drive Registration & Applications ---
  public registerStudentForDrive(
    driveId: string,
    studentId: string,
    regStatus: DriveRegistration['registration_status'] = 'Registered',
    remarks?: string
  ): DriveRegistration {
    const drive = this.data.placement_drives.find((d) => d.id === driveId);
    if (!drive) throw new Error('Placement drive not found');

    const student = this.data.students.find((s) => s.student_id === studentId || s.id === studentId);
    if (!student) throw new Error('Student record not found');

    // Check if already registered
    const existingIdx = this.data.drive_registrations.findIndex(
      (r) => r.drive_id === driveId && r.student_id === student.student_id
    );

    const now = new Date().toISOString();

    if (existingIdx !== -1) {
      // Update registration
      this.data.drive_registrations[existingIdx].registration_status = regStatus;
      this.data.drive_registrations[existingIdx].updated_at = now;
      if (remarks) this.data.drive_registrations[existingIdx].remarks = remarks;
      this.save();
      return this.data.drive_registrations[existingIdx];
    }

    // New registration
    const newReg: DriveRegistration = {
      id: `reg_${driveId}_${student.student_id}`,
      drive_id: driveId,
      student_id: student.student_id,
      registration_status: regStatus,
      selection_status: 'Registered',
      registered_at: now,
      updated_at: now,
      remarks: remarks || `Applied via Student Portal on ${now.split('T')[0]}`,
    };

    this.data.drive_registrations.push(newReg);

    // Add status history
    this.data.drive_status_history.push({
      id: `dhist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      drive_id: driveId,
      student_id: student.student_id,
      student_name: student.name,
      company_name: drive.company_name,
      previous_status: 'Eligible',
      new_status: 'Registered',
      changed_by: student.name,
      changed_at: now,
    });

    // Add confirmation notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      student_id: student.student_id,
      title: `Registration Confirmed: ${drive.company_name}`,
      message: `You have successfully registered for ${drive.company_name} (${drive.job_role}). Drive date: ${drive.drive_date}.`,
      drive_id: driveId,
      type: 'status_update',
      is_read: false,
      created_at: now,
    });

    this.save();
    return newReg;
  }

  public getDriveRegistrations(driveId: string) {
    const regs = (this.data.drive_registrations || []).filter((r) => r.drive_id === driveId);
    return regs.map((r) => {
      const stu = this.data.students.find((s) => s.student_id === r.student_id);
      return {
        ...r,
        student_name: stu?.name || 'Unknown Student',
        roll_number: stu?.roll_number || '—',
        department: stu?.department || '—',
        branch: stu?.branch || '—',
        batch: stu?.batch || '2027',
        cgpa: stu?.cgpa || 0,
        tenth_percentage: stu?.tenth_percentage || 0,
        twelfth_percentage: stu?.twelfth_percentage || 0,
        current_overall_status: stu?.placement_status || 'Not Placed',
      };
    });
  }

  public updateStudentDriveStatus(
    driveId: string,
    studentId: string,
    newStatus: DriveRegistration['selection_status'],
    remarks: string | undefined,
    actorName: string
  ) {
    const regIdx = this.data.drive_registrations.findIndex(
      (r) => r.drive_id === driveId && r.student_id === studentId
    );
    if (regIdx === -1) throw new Error('Registration record not found for this student and drive.');

    const currentReg = this.data.drive_registrations[regIdx];
    const prevStatus = currentReg.selection_status;
    const now = new Date().toISOString();

    currentReg.selection_status = newStatus;
    currentReg.updated_at = now;
    if (remarks) currentReg.remarks = remarks;

    const drive = this.data.placement_drives.find((d) => d.id === driveId);
    const student = this.data.students.find((s) => s.student_id === studentId);

    // Record drive history
    this.data.drive_status_history.push({
      id: `dhist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      drive_id: driveId,
      student_id: studentId,
      student_name: student?.name,
      company_name: drive?.company_name,
      previous_status: prevStatus,
      new_status: newStatus,
      changed_by: actorName,
      changed_at: now,
    });

    // If marked as 'Selected', synchronize with main student placement database!
    if (newStatus === 'Selected' && student && drive) {
      student.placement_status = 'Placed';
      student.company = drive.company_name;
      student.job_role = drive.job_role;
      student.package = typeof drive.package === 'number' ? drive.package : parseFloat(String(drive.package)) || null;
      student.placement_type = drive.drive_type === 'Online' ? 'On Campus' : drive.drive_type;
      student.placement_date = now.split('T')[0];
      student.location = drive.location;
      student.remarks = `Selected in ${drive.company_name} campus placement drive.`;
      student.updated_by = actorName;
      student.updated_at = now;

      // Add to main placement history
      this.data.placement_history.unshift({
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        student_id: student.student_id,
        student_name: student.name,
        roll_number: student.roll_number,
        previous_status: prevStatus === 'Selected' ? 'Placed' : 'Not Placed',
        new_status: 'Placed',
        company: drive.company_name,
        package: student.package,
        changed_by: actorName,
        changed_by_role: 'admin',
        changed_at: now,
        remarks: `Selected in ${drive.company_name} drive (Package: ₹${student.package} LPA)`,
      });
    }

    // Send student notification
    this.data.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      student_id: studentId,
      title: `Status Update: ${drive?.company_name || 'Placement Drive'}`,
      message: `Your status for ${drive?.company_name} has been updated to "${newStatus}".${remarks ? ` Note: ${remarks}` : ''}`,
      drive_id: driveId,
      type: newStatus === 'Selected' ? 'selection' : newStatus.includes('Test') ? 'test' : 'status_update',
      is_read: false,
      created_at: now,
    });

    this.save();
    return currentReg;
  }

  public bulkUpdateDriveStatus(
    driveId: string,
    studentIds: string[],
    newStatus: DriveRegistration['selection_status'],
    remarks: string | undefined,
    actorName: string
  ): { updatedCount: number } {
    let count = 0;
    for (const sid of studentIds) {
      try {
        this.updateStudentDriveStatus(driveId, sid, newStatus, remarks, actorName);
        count++;
      } catch (err) {
        console.error(`[DB] Error updating student ${sid}:`, err);
      }
    }
    return { updatedCount: count };
  }

  // --- Student Mode Specific Queries ---
  public getStudentApplications(studentId: string) {
    const regs = (this.data.drive_registrations || []).filter((r) => r.student_id === studentId);
    return regs.map((r) => {
      const drive = this.data.placement_drives.find((d) => d.id === r.drive_id);
      return {
        ...r,
        drive,
      };
    });
  }

  public getStudentJourney(studentId: string) {
    const student = this.data.students.find((s) => s.student_id === studentId || s.id === studentId);
    if (!student) return [];

    const apps = this.getStudentApplications(student.student_id);

    return apps.map((app) => {
      const status = app.selection_status;
      const isSelected = status === 'Selected';
      const isShortlisted = ['Shortlisted', 'Interview Scheduled', 'Selected'].includes(status);
      const isInterview = ['Interview Scheduled', 'Shortlisted', 'Selected'].includes(status);
      const isTestScheduled = ['Test Scheduled', 'Interview Scheduled', 'Shortlisted', 'Selected'].includes(status);
      const isRejected = status === 'Rejected';

      const stages = [
        {
          name: 'Academic Eligibility',
          status: 'completed' as const,
          label: 'Eligible',
          date: app.drive?.created_at?.split('T')[0] || '2026-09-01',
        },
        {
          name: 'Drive Registration',
          status: 'completed' as const,
          label: 'Registered',
          date: app.registered_at?.split('T')[0],
        },
        {
          name: 'Online Assessment',
          status: isTestScheduled ? (isShortlisted ? ('completed' as const) : ('in_progress' as const)) : ('pending' as const),
          label: isTestScheduled ? 'Test Scheduled' : 'Awaiting Schedule',
          date: isTestScheduled ? app.drive?.drive_date : undefined,
        },
        {
          name: 'Technical Interview',
          status: isInterview ? (isSelected ? ('completed' as const) : ('in_progress' as const)) : ('pending' as const),
          label: isInterview ? 'Interview Scheduled' : 'Pending Test Results',
        },
        {
          name: 'HR & Final Selection',
          status: isSelected ? ('completed' as const) : isRejected ? ('rejected' as const) : ('pending' as const),
          label: isSelected ? 'Offer Extended' : isRejected ? 'Not Selected' : 'Final Decision',
          package: isSelected ? app.drive?.package_display : undefined,
        },
      ];

      return {
        drive_id: app.drive_id,
        company_name: app.drive?.company_name || 'Company',
        job_role: app.drive?.job_role || 'Job Role',
        package_display: app.drive?.package_display || '—',
        drive_date: app.drive?.drive_date,
        current_status: status,
        is_selected: isSelected,
        is_rejected: isRejected,
        stages,
        remarks: app.remarks,
        updated_at: app.updated_at,
      };
    });
  }

  public getStudentNotifications(studentId: string): StudentNotification[] {
    return (this.data.notifications || []).filter((n) => n.student_id === studentId);
  }

  public markNotificationAsRead(id: string): void {
    const notif = (this.data.notifications || []).find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.save();
    }
  }

  public markAllNotificationsAsRead(studentId: string): void {
    (this.data.notifications || []).forEach((n) => {
      if (n.student_id === studentId) n.is_read = true;
    });
    this.save();
  }

  public getStudentProfile(studentId: string) {
    const student = this.data.students.find((s) => s.student_id === studentId || s.id === studentId);
    if (!student) return null;

    const apps = this.getStudentApplications(student.student_id);
    const notifications = this.getStudentNotifications(student.student_id);
    const allDrives = this.getPlacementDrives({ studentId: student.student_id });

    const eligibleDrives = allDrives.filter((d) => d.studentEligibility?.eligible);

    return {
      student,
      stats: {
        eligibleDrivesCount: eligibleDrives.length,
        appliedDrivesCount: apps.length,
        selectedCount: apps.filter((a) => a.selection_status === 'Selected').length,
        unreadNotificationsCount: notifications.filter((n) => !n.is_read).length,
      },
      applications: apps,
    };
  }

  public getEligibilityPreview(criteria: EligibilityCriteria) {
    return calculateEligibleCountPreview(this.data.students, criteria);
  }
}

export const db = new RelationalDatabase();

import { Student, EligibilityCriteria, EligibilityResult } from '../types.ts';

/**
 * Centralized, reusable dynamic eligibility calculation engine
 */
export function checkEligibility(
  student: Pick<Student, 'cgpa' | 'tenth_percentage' | 'twelfth_percentage' | 'department' | 'branch' | 'batch'> & {
    active_backlogs?: number;
  },
  criteria?: EligibilityCriteria | null
): EligibilityResult {
  if (!criteria) {
    return { eligible: true, reasons: [] };
  }

  const reasons: string[] = [];

  // 1. CGPA requirement
  const studentCgpa = Number(student.cgpa || 0);
  const minCgpa = Number(criteria.minimum_cgpa || 0);
  if (studentCgpa < minCgpa) {
    reasons.push(
      `CGPA requirement: ${minCgpa.toFixed(1)} — Your CGPA: ${studentCgpa.toFixed(2)}`
    );
  }

  // 2. 10th Marks requirement
  const student10th = Number(student.tenth_percentage || 0);
  const min10th = Number(criteria.minimum_10th_marks || 0);
  if (student10th < min10th) {
    reasons.push(
      `Required 10th marks: ${min10th}% — Your marks: ${student10th}%`
    );
  }

  // 3. 12th Marks requirement
  const student12th = Number(student.twelfth_percentage || 0);
  const min12th = Number(criteria.minimum_12th_marks || 0);
  if (student12th < min12th) {
    reasons.push(
      `Required 12th marks: ${min12th}% — Your marks: ${student12th}%`
    );
  }

  // 4. Backlogs requirement
  const studentBacklogs = Number(student.active_backlogs || 0);
  const maxBacklogs = Number(criteria.maximum_backlogs ?? 0);
  if (studentBacklogs > maxBacklogs) {
    reasons.push(
      `Max active backlogs allowed: ${maxBacklogs} — Your active backlogs: ${studentBacklogs}`
    );
  }

  // 5. Eligible Branches
  if (criteria.eligible_branches && criteria.eligible_branches.length > 0) {
    const studentDept = (student.department || '').trim().toLowerCase();
    const studentBranch = (student.branch || '').trim().toLowerCase();

    const isBranchEligible = criteria.eligible_branches.some((branch) => {
      const b = branch.trim().toLowerCase();
      if (b === 'all' || b === 'all branches') return true;
      if (studentDept === b || studentBranch === b) return true;

      // Fuzzy / Department family matching
      if (b.includes('computer') && (studentDept.includes('computer') || studentBranch.includes('computer'))) {
        return true;
      }
      if (b.includes('information') && (studentDept.includes('information') || studentBranch.includes('information') || studentDept.includes('it'))) {
        return true;
      }
      if (
        (b.includes('electronic') || b.includes('telecom') || b.includes('extc') || b.includes('ec')) &&
        (studentDept.includes('electronic') || studentBranch.includes('electronic') || studentBranch.includes('telecomm'))
      ) {
        return true;
      }
      if (b.includes('mechanical') && (studentDept.includes('mechanical') || studentBranch.includes('mechanical'))) {
        return true;
      }
      if (b.includes('electrical') && (studentDept.includes('electrical') || studentBranch.includes('electrical'))) {
        return true;
      }
      if (b.includes('civil') && (studentDept.includes('civil') || studentBranch.includes('civil'))) {
        return true;
      }

      return false;
    });

    if (!isBranchEligible) {
      reasons.push(
        `Department '${student.department || student.branch}' is not in the eligible branches (${criteria.eligible_branches.join(', ')})`
      );
    }
  }

  // 6. Eligible Batches
  if (criteria.eligible_batches && criteria.eligible_batches.length > 0) {
    const isBatchEligible = criteria.eligible_batches.some(
      (b) => b === 'All' || b === student.batch
    );
    if (!isBatchEligible) {
      reasons.push(
        `Eligible batches: ${criteria.eligible_batches.join(', ')} — Your batch: ${student.batch}`
      );
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

/**
 * Calculates student eligibility breakdown for TPO live preview
 */
export function calculateEligibleCountPreview(
  students: Student[],
  criteria: EligibilityCriteria
): {
  totalEligible: number;
  byDepartment: Record<string, number>;
} {
  const byDepartment: Record<string, number> = {};
  let totalEligible = 0;

  for (const s of students) {
    const res = checkEligibility(s, criteria);
    if (res.eligible) {
      totalEligible++;
      const dept = s.department || 'Other';
      byDepartment[dept] = (byDepartment[dept] || 0) + 1;
    }
  }

  return {
    totalEligible,
    byDepartment,
  };
}

// ==========================================
// DATA EXPORT SERVICE
// Sections 71, 112: "EXPORT MY LIFE LOG"
// ==========================================

import { LifeLogExport } from '../types';

export class ExportService {
  /**
   * Generates and downloads a JSON file containing the full immutable archive.
   */
  public static downloadJSON(data: LifeLogExport, filename?: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `AccountabilityGarden_LifeLog_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates and downloads CSV format for daily records.
   */
  public static downloadRecordsCSV(data: LifeLogExport): void {
    const headers = [
      'RecordDate',
      'HabitID',
      'HabitName',
      'Category',
      'Status',
      'Value',
      'Target',
      'Unit',
      'LockedAt',
      'Notes',
      'Mood',
      'EnergyLevel'
    ];

    const habitMap = new Map<string, { name: string; category: string }>();
    data.commitments.forEach(c => habitMap.set(c.id, { name: c.name, category: c.category }));

    const rows = data.dailyRecords.map(r => {
      const h = habitMap.get(r.habitId);
      return [
        r.recordDate,
        `"${r.habitId}"`,
        `"${(h?.name || '').replace(/"/g, '""')}"`,
        `"${h?.category || ''}"`,
        r.status,
        r.value ?? '',
        r.targetValue ?? '',
        r.unit || '',
        r.lockedAt,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        r.mood || '',
        r.energyLevel ?? ''
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AccountabilityGarden_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates a readable Markdown Life Log Report.
   */
  public static downloadMarkdownReport(data: LifeLogExport): void {
    let md = `# ACCOUNTABILITY GARDEN - LIFE LOG ARCHIVE\n`;
    md += `*“You cannot edit yesterday.”*\n\n`;
    md += `**Member**: ${data.user.name} (@${data.user.username})\n`;
    md += `**Archive Generated**: ${data.generatedAt}\n`;
    md += `**Accountability Mode**: ${data.user.accountabilityMode}\n\n`;

    md += `## 1. Summary Statistics\n`;
    md += `- Total Commitments: ${data.summaryStats.totalCommitments}\n`;
    md += `- Total Permanent Records: ${data.summaryStats.totalRecords}\n`;
    md += `- Overall Completion Rate: ${data.summaryStats.overallCompletionRate}%\n\n`;

    md += `## 2. Commitments & Plant Archetypes\n`;
    data.commitments.forEach(c => {
      md += `### ${c.name} (${c.category})\n`;
      md += `- **Plant**: ${c.plantType.toUpperCase()}\n`;
      md += `- **Tracking Type**: ${c.trackingType}\n`;
      md += `- **Created At**: ${c.createdAt}\n`;
      md += `- **Status**: ${c.isArchived ? 'Archived' : 'Active'}\n\n`;
    });

    md += `## 3. Daily History Log (Sample)\n`;
    data.dailyRecords.slice(-50).forEach(r => {
      md += `- **${r.recordDate}**: [${r.status}] ${r.notes ? `— "${r.notes}"` : ''} *(Locked at ${r.lockedAt})*\n`;
    });

    md += `\n---\n*End of Immutable Archive*\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AccountabilityGarden_Report_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

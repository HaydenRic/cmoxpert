import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AuditData {
  company_name: string;
  website: string;
  monthly_ad_spend: number;
  primary_channels: string[];
  score: number;
  estimated_waste: number;
  potential_savings: number;
  findings: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    issue: string;
    impact: string;
    recommendation: string;
  }>;
  opportunities: Array<{
    title: string;
    savings: number;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }>;
  platformAnalysis?: {
    overall_score: number;
    campaign_structure: number;
    tracking_analytics: number;
    budget_allocation: number;
    best_practices: number;
    platform_details: Array<{
      platform: string;
      score: number;
      issues: string[];
      recommendations: string[];
    }>;
  };
  actionPlan?: Array<{
    title: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: 'High' | 'Medium' | 'Low';
    effort: number;
    timeline: string;
    steps: string[];
    expected_result: string;
  }>;
}

export async function generateAuditPDF(auditData: AuditData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const primaryColor = [34, 51, 59];
  const accentColor = [198, 172, 143];
  const lightBg = [234, 224, 213];

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('CMOxPert | Marketing Intelligence Platform', 15, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - 30, pageHeight - 10);
    doc.text('https://cmoxpert.com', pageWidth / 2, pageHeight - 10, { align: 'center' });
  };

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('Marketing Audit Report', pageWidth / 2, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(auditData.company_name || 'Your Company', pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(10);
  const today = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(today, pageWidth / 2, 42, { align: 'center' });

  yPosition = 60;

  doc.setFillColor(...lightBg);
  doc.roundedRect(15, yPosition, pageWidth - 30, 8, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPosition + 6);
  yPosition += 15;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const summaryText = `Based on our comprehensive analysis of ${auditData.company_name}'s marketing operations, we identified significant opportunities for optimization and cost reduction. This report provides actionable insights to improve your marketing performance and ROI.`;
  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
  doc.text(splitSummary, 20, yPosition);
  yPosition += splitSummary.length * 6 + 10;

  const boxHeight = 35;
  const boxWidth = (pageWidth - 50) / 3;
  const boxY = yPosition;

  doc.setFillColor(...primaryColor);
  doc.roundedRect(15, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Health Score', 15 + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(auditData.score.toString(), 15 + boxWidth / 2, boxY + 22, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const scoreLabel = auditData.score >= 70 ? 'Good' : auditData.score >= 50 ? 'Fair' : 'Critical';
  doc.text(scoreLabel, 15 + boxWidth / 2, boxY + 30, { align: 'center' });

  const redColor = [239, 68, 68];
  doc.setFillColor(...redColor);
  doc.roundedRect(20 + boxWidth, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Monthly Waste', 20 + boxWidth + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`£${(auditData.estimated_waste / 100).toLocaleString()}`, 20 + boxWidth + boxWidth / 2, boxY + 22, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Inefficient spend', 20 + boxWidth + boxWidth / 2, boxY + 30, { align: 'center' });

  const greenColor = [34, 197, 94];
  doc.setFillColor(...greenColor);
  doc.roundedRect(25 + boxWidth * 2, boxY, boxWidth, boxHeight, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('Potential Savings', 25 + boxWidth * 2 + boxWidth / 2, boxY + 8, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`£${(auditData.potential_savings / 100).toLocaleString()}`, 25 + boxWidth * 2 + boxWidth / 2, boxY + 22, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Per month', 25 + boxWidth * 2 + boxWidth / 2, boxY + 30, { align: 'center' });

  yPosition = boxY + boxHeight + 20;

  addFooter(1);
  doc.addPage();
  yPosition = 20;

  if (auditData.platformAnalysis) {
    doc.setFillColor(...lightBg);
    doc.roundedRect(15, yPosition, pageWidth - 30, 8, 2, 2, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Platform Performance Scorecard', 20, yPosition + 6);
    yPosition += 15;

    const categories = [
      { name: 'Campaign Structure', score: auditData.platformAnalysis.campaign_structure },
      { name: 'Tracking & Analytics', score: auditData.platformAnalysis.tracking_analytics },
      { name: 'Budget Allocation', score: auditData.platformAnalysis.budget_allocation },
      { name: 'Best Practices', score: auditData.platformAnalysis.best_practices }
    ];

    categories.forEach(cat => {
      addNewPageIfNeeded(15);

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text(cat.name, 20, yPosition);

      const barWidth = 100;
      const barHeight = 8;
      doc.setFillColor(220, 220, 220);
      doc.roundedRect(120, yPosition - 5, barWidth, barHeight, 2, 2, 'F');

      const fillWidth = (cat.score / 100) * barWidth;
      const barColor = cat.score >= 70 ? greenColor : cat.score >= 50 ? [251, 191, 36] : redColor;
      doc.setFillColor(...barColor);
      doc.roundedRect(120, yPosition - 5, fillWidth, barHeight, 2, 2, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${cat.score}/100`, 225, yPosition);

      yPosition += 12;
    });

    yPosition += 10;
  }

  doc.setFillColor(...lightBg);
  doc.roundedRect(15, yPosition, pageWidth - 30, 8, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Findings', 20, yPosition + 6);
  yPosition += 15;

  auditData.findings.slice(0, 5).forEach((finding, index) => {
    addNewPageIfNeeded(35);

    const severityColors: Record<string, number[]> = {
      critical: [239, 68, 68],
      warning: [251, 191, 36],
      info: [59, 130, 246]
    };
    const severityColor = severityColors[finding.severity];

    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPosition, pageWidth - 30, 32, 2, 2, 'F');

    doc.setFillColor(...severityColor);
    doc.circle(22, yPosition + 8, 3, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(finding.category, 28, yPosition + 8);

    doc.setFontSize(8);
    doc.setTextColor(...severityColor);
    doc.text(finding.severity.toUpperCase(), pageWidth - 40, yPosition + 8);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const issueText = doc.splitTextToSize(finding.issue, pageWidth - 45);
    doc.text(issueText, 20, yPosition + 15);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const recommendationText = doc.splitTextToSize(`→ ${finding.recommendation}`, pageWidth - 45);
    doc.text(recommendationText, 20, yPosition + 15 + issueText.length * 4 + 3);

    yPosition += 35;
  });

  addFooter(2);

  if (auditData.actionPlan && auditData.actionPlan.length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setFillColor(...lightBg);
    doc.roundedRect(15, yPosition, pageWidth - 30, 8, 2, 2, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Prioritized Action Plan', 20, yPosition + 6);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Follow these prioritized actions to optimize your marketing performance:', 20, yPosition);
    yPosition += 10;

    auditData.actionPlan.slice(0, 6).forEach((action, index) => {
      addNewPageIfNeeded(50);

      const priorityColors: Record<string, number[]> = {
        HIGH: [239, 68, 68],
        MEDIUM: [251, 191, 36],
        LOW: [59, 130, 246]
      };
      const priorityColor = priorityColors[action.priority];

      doc.setFillColor(250, 250, 250);
      doc.roundedRect(15, yPosition, pageWidth - 30, 5 + action.steps.length * 5 + 15, 2, 2, 'F');

      doc.setFillColor(...priorityColor);
      doc.roundedRect(15, yPosition, 5, 5 + action.steps.length * 5 + 15, 2, 2, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text(`${index + 1}. ${action.title}`, 25, yPosition + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...priorityColor);
      doc.text(action.priority, 25, yPosition + 12);

      doc.setTextColor(100, 100, 100);
      doc.text(`Impact: ${action.impact} | Effort: ${action.effort}/5 | Timeline: ${action.timeline}`, 50, yPosition + 12);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      let stepY = yPosition + 18;
      action.steps.forEach((step, stepIndex) => {
        const stepText = doc.splitTextToSize(`${stepIndex + 1}. ${step}`, pageWidth - 55);
        doc.text(stepText, 28, stepY);
        stepY += stepText.length * 4 + 1;
      });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(80, 80, 80);
      const resultText = doc.splitTextToSize(`Expected: ${action.expected_result}`, pageWidth - 55);
      doc.text(resultText, 28, stepY + 2);

      yPosition += 5 + action.steps.length * 5 + 18;
    });

    addFooter(3);
  }

  doc.addPage();
  yPosition = 20;

  doc.setFillColor(...lightBg);
  doc.roundedRect(15, yPosition, pageWidth - 30, 8, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Quick Win Opportunities', 20, yPosition + 6);
  yPosition += 15;

  auditData.opportunities.forEach((opp, index) => {
    addNewPageIfNeeded(22);

    doc.setFillColor(...greenColor);
    doc.circle(22, yPosition + 5, 3, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(opp.title, 28, yPosition + 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Save £${(opp.savings / 100).toLocaleString()}/month`, 28, yPosition + 12);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${opp.effort.toUpperCase()} EFFORT | ${opp.timeline}`, pageWidth - 80, yPosition + 12);

    yPosition += 18;
  });

  yPosition += 10;

  doc.setFillColor(...primaryColor);
  doc.roundedRect(15, yPosition, pageWidth - 30, 50, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Ready to Take Action?', pageWidth / 2, yPosition + 15, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const ctaText = 'Our productized marketing services deliver automated insights and strategic recommendations for 50-60% less than traditional agencies.';
  const splitCta = doc.splitTextToSize(ctaText, pageWidth - 50);
  doc.text(splitCta, pageWidth / 2, yPosition + 25, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.roundedRect((pageWidth - 60) / 2, yPosition + 38, 60, 8, 2, 2, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Schedule a Consultation', pageWidth / 2, yPosition + 43, { align: 'center' });

  addFooter(4);

  const filename = `Marketing_Audit_${auditData.company_name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}

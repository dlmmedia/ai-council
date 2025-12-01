import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import './DownloadReport.css';

// Strip markdown formatting for plain text
function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*+]\s/gm, '• ')
    .replace(/^\d+\.\s/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Parse markdown sections
function parseMarkdownSections(text) {
  const lines = text.split('\n');
  const sections = [];
  let currentSection = { title: '', content: [] };

  lines.forEach(line => {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      if (currentSection.title || currentSection.content.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: headingMatch[2],
        level: headingMatch[1].length,
        content: []
      };
    } else {
      currentSection.content.push(line);
    }
  });

  if (currentSection.title || currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

export default function DownloadReport({ question, stage1, stage2, stage3, metadata }) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const footerBuffer = 12;
      const contentWidth = pageWidth - (margin * 2);
      let yPos = margin;

      // Colors from brand guide
      const goldDark = [138, 112, 72]; // #8a7048
      const textPrimary = [58, 48, 36]; // #3a3024
      const goldAccent = [184, 144, 72]; // #b89048

      const drawPageFrame = () => {
        doc.setDrawColor(...goldAccent);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
        doc.setLineWidth(0.2);
        doc.rect(12, 12, pageWidth - 24, pageHeight - 24);
      };

      doc.setLineHeightFactor(1.4);
      drawPageFrame();

      // Helper function to add text with word wrap
      const addWrappedText = (text, x, y, maxWidth, fontSize = 11, color = textPrimary) => {
        doc.setFontSize(fontSize);
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight =
          (fontSize * doc.getLineHeightFactor()) / doc.internal.scaleFactor;

        lines.forEach((line) => {
          if (y + lineHeight > pageHeight - margin - footerBuffer) {
            doc.addPage();
            drawPageFrame();
            y = margin;
          }
          doc.text(line, x, y);
          y += lineHeight;
        });
        return y;
      };

      // Check and add new page if needed
      const ensurePageSpace = (requiredSpace = 0) => {
        if (yPos + requiredSpace > pageHeight - margin - footerBuffer) {
          doc.addPage();
          drawPageFrame();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(...goldDark);
      doc.text('DLM LLM COUNCIL', pageWidth / 2, yPos + 5, { align: 'center' });
      yPos += 12;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Official Council Report', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Decorative line
      doc.setDrawColor(...goldAccent);
      doc.setLineWidth(0.5);
      doc.line(margin + 30, yPos, pageWidth - margin - 30, yPos);
      yPos += 8;

      // Date
      doc.setFontSize(10);
      doc.setTextColor(...textPrimary);
      doc.text(`Generated: ${formatDate()}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 15;

      // Question Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...goldDark);
      doc.text('THE INQUIRY', margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      yPos = addWrappedText(question, margin, yPos, contentWidth, 11, textPrimary);
      yPos += 10;

      // Stage 1: Individual Responses
      ensurePageSpace(30);
      doc.setDrawColor(...goldAccent);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...goldDark);
      doc.text('STAGE I: INDIVIDUAL DELIBERATIONS', margin, yPos);
      yPos += 10;

      if (stage1 && stage1.length > 0) {
        stage1.forEach((resp, index) => {
          ensurePageSpace(40);
          
          const modelName = resp.model.split('/')[1] || resp.model;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(...goldAccent);
          doc.text(`Councillor ${index + 1}: ${modelName}`, margin, yPos);
          yPos += 6;

          doc.setFont('helvetica', 'normal');
          const responseText = stripMarkdown(resp.response);
          yPos = addWrappedText(responseText.substring(0, 2000), margin + 5, yPos, contentWidth - 10, 10, textPrimary);
          
          if (responseText.length > 2000) {
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 100);
            doc.text('[Response truncated for brevity...]', margin + 5, yPos);
            yPos += 5;
          }
          
          yPos += 8;
        });
      }

      // Stage 2: Peer Rankings
      ensurePageSpace(30);
      doc.setDrawColor(...goldAccent);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...goldDark);
      doc.text('STAGE II: PEER EVALUATIONS & RANKINGS', margin, yPos);
      yPos += 10;

      if (stage2 && stage2.length > 0) {
        stage2.forEach((rank, index) => {
          ensurePageSpace(35);
          
          const modelName = rank.model.split('/')[1] || rank.model;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(...goldAccent);
          doc.text(`Evaluator: ${modelName}`, margin, yPos);
          yPos += 6;

          if (rank.parsed_ranking && rank.parsed_ranking.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...textPrimary);
            
            rank.parsed_ranking.forEach((label, i) => {
              const rankedModel = metadata?.label_to_model?.[label]?.split('/')[1] || label;
              doc.text(`  ${i + 1}. ${rankedModel}`, margin + 5, yPos);
              yPos += 5;
            });
          }
          
          yPos += 5;
        });

        // Aggregate Rankings
        if (metadata?.aggregate_rankings && metadata.aggregate_rankings.length > 0) {
          ensurePageSpace(40);
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.setTextColor(...goldDark);
          doc.text('AGGREGATE STANDINGS (Street Cred)', margin, yPos);
          yPos += 8;

          metadata.aggregate_rankings.forEach((agg, index) => {
            const modelName = agg.model.split('/')[1] || agg.model;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...textPrimary);
            doc.text(`#${index + 1} ${modelName} - Avg: ${agg.average_rank.toFixed(2)} (${agg.rankings_count} votes)`, margin + 5, yPos);
            yPos += 5;
          });
          
          yPos += 8;
        }
      }

      // Stage 3: Final Answer
      ensurePageSpace(30);
      doc.setDrawColor(...goldAccent);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...goldDark);
      doc.text('STAGE III: THE COUNCIL\'S FINAL VERDICT', margin, yPos);
      yPos += 8;

      if (stage3) {
        const chairmanName = stage3.model.split('/')[1] || stage3.model;
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(...goldAccent);
        doc.text(`Chairman: ${chairmanName}`, margin, yPos);
        yPos += 8;

        doc.setFont('helvetica', 'normal');
        const finalText = stripMarkdown(stage3.response);
        yPos = addWrappedText(finalText, margin, yPos, contentWidth, 11, textPrimary);
      }

      // Footer
      const currentPageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= currentPageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `DLM LLM Council Report - Page ${i} of ${currentPageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`council-report-${Date.now()}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
    
    setGenerating(false);
    setIsOpen(false);
  };

  const generateWord = async () => {
    setGenerating(true);

    try {
      const children = [];

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'DLM LLM COUNCIL',
              bold: true,
              size: 48,
              color: '8a7048',
              font: 'Georgia'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Official Council Report',
              italics: true,
              size: 28,
              color: '6a5a48',
              font: 'Georgia'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '═══════════════════════════════════════',
              size: 24,
              color: 'b89048'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Generated: ${formatDate()}`,
              size: 20,
              color: '6a5a48',
              font: 'Georgia'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // The Inquiry
      children.push(
        new Paragraph({
          text: 'THE INQUIRY',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          thematicBreak: true
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: question,
              size: 24,
              font: 'Georgia'
            })
          ],
          spacing: { after: 400 },
          border: {
            left: {
              color: 'b89048',
              space: 15,
              style: BorderStyle.SINGLE,
              size: 12
            }
          },
          indent: { left: 400 }
        })
      );

      // Stage 1
      children.push(
        new Paragraph({
          text: 'STAGE I: INDIVIDUAL DELIBERATIONS',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      if (stage1 && stage1.length > 0) {
        stage1.forEach((resp, index) => {
          const modelName = resp.model.split('/')[1] || resp.model;
          
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Councillor ${index + 1}: ${modelName}`,
                  bold: true,
                  size: 24,
                  color: 'b89048',
                  font: 'Georgia'
                })
              ],
              spacing: { before: 300, after: 100 }
            })
          );

          // Split response into paragraphs
          const responseText = stripMarkdown(resp.response);
          const paragraphs = responseText.split('\n\n').filter(p => p.trim());
          
          paragraphs.forEach(para => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 22,
                    font: 'Georgia'
                  })
                ],
                spacing: { after: 120 },
                indent: { left: 200 }
              })
            );
          });
        });
      }

      // Stage 2
      children.push(
        new Paragraph({
          text: 'STAGE II: PEER EVALUATIONS & RANKINGS',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      if (stage2 && stage2.length > 0) {
        stage2.forEach((rank, index) => {
          const modelName = rank.model.split('/')[1] || rank.model;
          
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Evaluator: ${modelName}`,
                  bold: true,
                  size: 24,
                  color: 'b89048',
                  font: 'Georgia'
                })
              ],
              spacing: { before: 200, after: 100 }
            })
          );

          if (rank.parsed_ranking && rank.parsed_ranking.length > 0) {
            rank.parsed_ranking.forEach((label, i) => {
              const rankedModel = metadata?.label_to_model?.[label]?.split('/')[1] || label;
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${i + 1}. ${rankedModel}`,
                      size: 22,
                      font: 'Georgia'
                    })
                  ],
                  indent: { left: 400 },
                  spacing: { after: 50 }
                })
              );
            });
          }
        });

        // Aggregate Rankings Table
        if (metadata?.aggregate_rankings && metadata.aggregate_rankings.length > 0) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'AGGREGATE STANDINGS (Street Cred)',
                  bold: true,
                  size: 26,
                  color: '8a7048',
                  font: 'Georgia'
                })
              ],
              spacing: { before: 400, after: 200 }
            })
          );

          const tableRows = [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Rank', bold: true, size: 22 })] })],
                  width: { size: 15, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Model', bold: true, size: 22 })] })],
                  width: { size: 45, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Average Rank', bold: true, size: 22 })] })],
                  width: { size: 25, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: 'Votes', bold: true, size: 22 })] })],
                  width: { size: 15, type: WidthType.PERCENTAGE }
                })
              ]
            })
          ];

          metadata.aggregate_rankings.forEach((agg, index) => {
            const modelName = agg.model.split('/')[1] || agg.model;
            tableRows.push(
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: `#${index + 1}`, size: 22 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: modelName, size: 22 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: agg.average_rank.toFixed(2), size: 22 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: String(agg.rankings_count), size: 22 })] })]
                  })
                ]
              })
            );
          });

          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          );
        }
      }

      // Stage 3
      children.push(
        new Paragraph({
          text: "STAGE III: THE COUNCIL'S FINAL VERDICT",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        })
      );

      if (stage3) {
        const chairmanName = stage3.model.split('/')[1] || stage3.model;
        
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: '👑 ',
                size: 24
              }),
              new TextRun({
                text: `Chairman: ${chairmanName}`,
                italics: true,
                size: 24,
                color: 'b89048',
                font: 'Georgia'
              })
            ],
            spacing: { after: 200 }
          })
        );

        // Final response paragraphs
        const finalText = stripMarkdown(stage3.response);
        const paragraphs = finalText.split('\n\n').filter(p => p.trim());
        
        paragraphs.forEach(para => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para.trim(),
                  size: 24,
                  font: 'Georgia'
                })
              ],
              spacing: { after: 150 },
              indent: { left: 200 }
            })
          );
        });
      }

      // Footer
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '═══════════════════════════════════════',
              size: 24,
              color: 'b89048'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'DLM LLM Council - Where the Greatest Minds of Artificial Intelligence Convene',
              italics: true,
              size: 18,
              color: '6a5a48',
              font: 'Georgia'
            })
          ],
          alignment: AlignmentType.CENTER
        })
      );

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children
        }],
        styles: {
          default: {
            heading1: {
              run: {
                font: 'Georgia',
                size: 32,
                bold: true,
                color: '8a7048'
              },
              paragraph: {
                spacing: { before: 400, after: 200 }
              }
            }
          }
        }
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `council-report-${Date.now()}.docx`);
      
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Error generating Word document. Please try again.');
    }

    setGenerating(false);
    setIsOpen(false);
  };

  if (!stage3) return null;

  return (
    <div className="download-report">
      <button 
        className="download-trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={generating}
      >
        <span className="download-icon">📥</span>
        Download Report
      </button>

      {isOpen && (
        <div className="download-dropdown">
          <div className="dropdown-header">
            <span>Select Format</span>
          </div>
          <button 
            className="format-option"
            onClick={generatePDF}
            disabled={generating}
          >
            <span className="format-icon">📄</span>
            <div className="format-info">
              <span className="format-name">PDF Document</span>
              <span className="format-desc">Best for printing & sharing</span>
            </div>
          </button>
          <button 
            className="format-option"
            onClick={generateWord}
            disabled={generating}
          >
            <span className="format-icon">📝</span>
            <div className="format-info">
              <span className="format-name">Word Document</span>
              <span className="format-desc">Best for editing & customizing</span>
            </div>
          </button>
          {generating && (
            <div className="generating-indicator">
              <div className="spinner-small"></div>
              <span>Generating report...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const LINE_HEIGHT = 14; // approx. points per wrapped line
const MIN_ROW_HEIGHT = 22;
const MAX_ROW_HEIGHT = 320;

/**
 * Estimates how many wrapped lines a cell needs at a given column width.
 * Explicit line breaks are counted separately so bulleted comments don't
 * get collapsed into one long run.
 */
function wrappedLineCount(text, columnWidth) {
  if (text === undefined || text === null) return 1;
  const charsPerLine = Math.max(Math.floor(columnWidth - 2), 8);
  return String(text)
    .split("\n")
    .reduce(
      (lines, segment) =>
        lines + Math.max(1, Math.ceil(segment.length / charsPerLine)),
      0
    );
}

/**
 * Renders a comment as text. Bulleted comments keep one point per line so the
 * cell stays readable; points that already carry their own numbering are left
 * alone rather than being double-numbered.
 */
function formatComment(comment) {
  if (!comment) return "";
  if (!Array.isArray(comment.value)) return comment.value;
  if (comment.type !== "points" || comment.value.length < 2)
    return comment.value.join("\n");

  return comment.value
    .map((point) => (/^\s*\d+[.)]/.test(point) ? point : `• ${point}`))
    .join("\n");
}

/**
 * Applies borders, wrapping and per-row heights to a sheet, and styles the
 * header row. Row heights are estimated rather than fixed so wrapped text is
 * never clipped.
 */
function styleSheet(worksheet) {
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.alignment = {
        vertical: "top",
        horizontal: "left",
        wrapText: true,
      };

      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };

      if (rowNumber === 1) {
        cell.font = { bold: true };
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF1F5F9" },
        };
      }
    });

    let maxLines = 1;
    row.eachCell((cell, colNumber) => {
      const width = worksheet.getColumn(colNumber).width || 10;
      maxLines = Math.max(maxLines, wrappedLineCount(cell.value, width));
    });

    row.height = Math.min(
      MAX_ROW_HEIGHT,
      Math.max(MIN_ROW_HEIGHT, maxLines * LINE_HEIGHT)
    );
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
}

/**
 * Builds the main results sheet from the module's column/row config. Any
 * column marked `type: "comment"` is formatted the same way the on-screen
 * CommentCell would render it (text or bulleted points).
 */
function buildMainSheet(workbook, config) {
  const worksheet = workbook.addWorksheet(config.excel.mainSheetName);

  worksheet.columns = config.excel.columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  config.resultsTable.rows.forEach((row) => {
    const record = {};
    config.excel.columns.forEach((col) => {
      record[col.key] =
        col.type === "comment" ? formatComment(row[col.key]) : row[col.key];
    });
    worksheet.addRow(record);
  });

  styleSheet(worksheet);
  return worksheet;
}

/**
 * Builds the Audit Trail sheet: one row per validation check, grouped under
 * the test procedure it belongs to, with the procedure's description and
 * findings merged across its group.
 */
function buildAuditTrailSheet(workbook, config) {
  const sheet = workbook.addWorksheet(config.excel.auditSheetName || "Audit Trail");

  sheet.columns = [
    { header: "Test Procedure", key: "procedure", width: 30 },
    { header: "Attributes", key: "attributes", width: 12 },
    { header: "Procedure Description", key: "detail", width: 58 },
    { header: "Check No.", key: "checkNo", width: 10 },
    { header: "Validation Check Performed", key: "check", width: 52 },
    { header: "Result", key: "result", width: 12 },
    { header: "Noted That", key: "noted", width: 62 },
  ];

  config.validationChecks.forEach((proc) => {
    const firstRow = sheet.rowCount + 1;

    proc.subChecks.forEach((check, i) => {
      sheet.addRow({
        procedure: i === 0 ? proc.label : "",
        attributes: i === 0 ? proc.attributes || "-" : "",
        detail: i === 0 ? proc.detail : "",
        checkNo: `${proc.id.toUpperCase()}.${i + 1}`,
        check,
        result: "Passed",
        noted: i === 0 ? (proc.points || []).join("\n") : "",
      });
    });

    const lastRow = sheet.rowCount;

    // Merge the procedure-level columns across the group
    if (lastRow > firstRow) {
      ["A", "B", "C", "G"].forEach((col) => {
        sheet.mergeCells(`${col}${firstRow}:${col}${lastRow}`);
      });
    }
  });

  styleSheet(sheet);

  // Colour the Result column so passes read at a glance
  sheet.getColumn("result").eachCell((cell, rowNumber) => {
    if (rowNumber === 1) return;
    cell.font = { color: { argb: "FF166534" }, bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCFCE7" },
    };
  });

  return sheet;
}


/**
 * Builds the "Summary" sheet for any dashboard-style module: control result,
 * metrics, the module's own summary bullets, exception breakdown, and the
 * test validation checklist.
 */
function buildSummarySheet(workbook, config) {
  const { dashboard } = config;
  const summaryLabel = dashboard.summaryLabel || "Summary";
  const sheet = workbook.addWorksheet(config.excel.summarySheetName || "Summary");

  sheet.columns = [
    { header: "Field", key: "field", width: 28 },
    { header: "Value", key: "value", width: 60 },
  ];

  sheet.addRow({ field: "Control Result", value: dashboard.summary.controlResult });
  sheet.addRow({ field: "Recall", value: dashboard.summary.metrics.recall });
  sheet.addRow({ field: "Precision", value: dashboard.summary.metrics.precision });
  sheet.addRow({ field: "Exceptions", value: dashboard.summary.metrics.exceptions });
  sheet.addRow({ field: "False Positives", value: dashboard.summary.metrics.falsePositives });
  sheet.addRow({});

  sheet.addRow({ field: summaryLabel });
  dashboard.summary.summaryPoints.forEach((pt) => sheet.addRow({ value: pt }));
  sheet.addRow({});

  sheet.addRow({ field: "Exception Breakdown" });
  sheet.addRow({ field: "Exception Type", value: "Count / Severity" });
  dashboard.breakdown.forEach((row) =>
    sheet.addRow({ field: row.type, value: `${row.count} / ${row.severity}` })
  );
  sheet.addRow({});

  sheet.addRow({ field: "Test Validation" });
  dashboard.summary.testValidation.forEach((item) => sheet.addRow({ value: `✓ ${item}` }));

  // Bold the section header rows (those with a field value but no numeric row above)
  [summaryLabel, "Exception Breakdown", "Test Validation", "Control Result"].forEach(
    (label) => {
      sheet.eachRow((row) => {
        if (row.getCell(1).value === label) row.getCell(1).font = { bold: true };
      });
    }
  );

  styleSheet(sheet);
  return sheet;
}

/**
 * Builds the "Exceptions" sheet: one row per detected exception, with its
 * evidence flattened into label/value columns.
 */
function buildExceptionsSheet(workbook, config) {
  const { exceptions } = config.dashboard;
  const maxEvidence = Math.max(...exceptions.map((e) => e.evidence.length));

  const sheet = workbook.addWorksheet(config.excel.exceptionsSheetName || "Exceptions");

  const columns = [
    { header: "Exception ID", key: "id", width: 16 },
    { header: "Account", key: "account", width: 14 },
    { header: "Security / Item", key: "securityName", width: 22 },
    { header: "Exception Type", key: "type", width: 22 },
    { header: "Severity", key: "severity", width: 12 },
  ];
  for (let i = 0; i < maxEvidence; i++) {
    columns.push({ header: `Evidence ${i + 1}`, key: `evidence${i}`, width: 34 });
  }
  sheet.columns = columns;

  exceptions.forEach((exc) => {
    const record = {
      id: exc.id,
      account: exc.account,
      securityName: exc.securityName,
      type: exc.type,
      severity: exc.severity,
    };
    exc.evidence.forEach((ev, i) => {
      record[`evidence${i}`] = `${ev.label}: ${ev.value}`;
    });
    sheet.addRow(record);
  });

  styleSheet(sheet);

  // Colour the Severity column
  sheet.getColumn("severity").eachCell((cell, rowNumber) => {
    if (rowNumber === 1) return;
    const critical = cell.value === "CRITICAL";
    cell.font = { bold: true, color: { argb: critical ? "FF991B1B" : "FF9A3412" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: critical ? "FFFEE2E2" : "FFFFEDD5" },
    };
  });

  return sheet;
}

/**
 * Builds one sheet from a stack of table blocks (title row, header row,
 * data rows, blank separator) - the shape the flow-driven modules (e.g. the
 * REC-01 custody reconciliation test) show on screen and export as-is.
 */
function buildStackedTablesSheet(workbook, sheetName, tables) {
  const sheet = workbook.addWorksheet(sheetName);
  const maxCols = Math.max(...tables.map((t) => t.columns.length));
  sheet.columns = Array.from({ length: maxCols }, () => ({ width: 22 }));

  tables.forEach((table) => {
    const titleRow = sheet.addRow([table.title]);
    titleRow.getCell(1).font = { bold: true, size: 12 };
    if (table.note) {
      const noteRow = sheet.addRow([table.note]);
      noteRow.getCell(1).font = { italic: true, color: { argb: "FF64748B" } };
    }

    const headerRow = sheet.addRow(table.columns.map((c) => c.label));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    });

    table.rows.forEach((row) => {
      sheet.addRow(table.columns.map((c) => row[c.key] ?? ""));
    });

    sheet.addRow([]); // blank separator between blocks
  });

  // Borders + wrap on every populated cell, without the shared header-row
  // styling (each block has its own header), and per-row height estimation.
  sheet.eachRow((row, rowNumber) => {
    let maxLines = 1;
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      const width = sheet.getColumn(colNumber).width || 10;
      maxLines = Math.max(maxLines, wrappedLineCount(cell.value, width));
    });
    row.height = Math.min(MAX_ROW_HEIGHT, Math.max(MIN_ROW_HEIGHT, maxLines * LINE_HEIGHT));
  });

  sheet.views = [{ state: "frozen", ySplit: 0 }];
  return sheet;
}

/**
 * Builds and downloads the report for any module, driven entirely by its
 * config object. Flow-driven modules (config.flow) export a two-tab report -
 * IPE (population-step tables) and Testing (the final sample-level table) -
 * plus the shared Audit Trail. Everything else keeps the existing shape.
 */
export async function downloadReport(config) {
  const workbook = new ExcelJS.Workbook();

  if (Array.isArray(config.flow)) {
    const ipeTables = config.flow.filter((s) => s.exportTab === "IPE").flatMap((s) => s.tables || []);
    const testingTables = config.flow
      .filter((s) => s.exportTab === "Testing")
      .flatMap((s) => s.tables || []);

    if (ipeTables.length) buildStackedTablesSheet(workbook, config.excel.ipeSheetName || "IPE", ipeTables);
    if (testingTables.length)
      buildStackedTablesSheet(workbook, config.excel.testingSheetName || "Testing", testingTables);
  } else if (config.dashboard) {
    // Dashboard-style modules (e.g. reconciliation) export the same
    // structure shown on screen: Summary, Exceptions, then the audit trail.
    buildSummarySheet(workbook, config);
    buildExceptionsSheet(workbook, config);
  } else {
    buildMainSheet(workbook, config);
  }

  buildAuditTrailSheet(workbook, config);

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(new Blob([buffer]), config.excel.fileName);
}

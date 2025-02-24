// File analyzer to identify potential i18n needs
import * as fs from "fs";
import * as path from "path";

function analyzeFileForI18n(fileContent) {
  const analysis = {
    hardCodedStrings: [],
    potentialTranslationNeeds: false,
    reasons: [],
  };

  // Patterns to look for
  const patterns = {
    // JSX text content
    jsxText: />([^<>{}\n]+)</g,

    // String literals in attributes
    attributes: /(\w+)=["']([^"']+)["']/g,

    // Common UI text props
    textProps: /(title|label|placeholder|alt|aria-label)=["']([^"']+)["']/g,

    // Error messages and notifications
    alerts: /(error|warning|message|notification):\s*["']([^"']+)["']/gi,

    // Button/link text
    buttonText: /<button[^>]*>([^<]+)<\/button>/g,

    // Skip translation checks for these patterns
    skipPatterns: [
      /^[0-9\s\-:./]+$/, // dates, numbers
      /^https?:\/\//, // URLs
      /^[A-Z0-9_]+$/, // constants
      /^\s+$/, // whitespace
      /^[<>=!&|{}\[\]]+$/, // operators and syntax
    ],
  };

  // Helper to check if string should be translated
  function shouldTranslate(str) {
    // Skip if string is empty or too short
    if (!str || str.length < 2) return false;

    // Skip if matches any skip patterns
    if (patterns.skipPatterns.some((pattern) => pattern.test(str)))
      return false;

    // String likely needs translation if:
    // - Contains letters
    // - Not just technical symbols
    // - More than one word or contains sentence punctuation
    return (
      /[a-zA-Z]/.test(str) &&
      !/^[^a-zA-Z]+$/.test(str) &&
      (/\s+/.test(str) || /[.!?]/.test(str))
    );
  }

  // Check for JSX text content
  let match;
  while ((match = patterns.jsxText.exec(fileContent)) !== null) {
    const text = match[1].trim();
    if (shouldTranslate(text)) {
      analysis.hardCodedStrings.push({
        type: "JSX text",
        text: text,
        needsTranslation: true,
      });
    }
  }

  // Check attributes
  while ((match = patterns.textProps.exec(fileContent)) !== null) {
    const [_, prop, value] = match;
    if (shouldTranslate(value)) {
      analysis.hardCodedStrings.push({
        type: `${prop} prop`,
        text: value,
        needsTranslation: true,
      });
    }
  }

  // Check for existing translation usage
  const hasExistingTranslations = /useTranslations?\(/.test(fileContent);
  const hasHardCodedStrings = analysis.hardCodedStrings.length > 0;

  // Determine if file needs attention
  if (hasHardCodedStrings) {
    analysis.potentialTranslationNeeds = true;
    if (!hasExistingTranslations) {
      analysis.reasons.push(
        "Contains hard-coded strings without useTranslation"
      );
    } else {
      analysis.reasons.push("Has useTranslation but may have missed strings");
    }
  }

  return analysis;
}

function generateReport(filePath, analysis) {
  let report = `\nAnalysis for ${filePath}:\n`;
  report += "-".repeat(40) + "\n";

  if (analysis.potentialTranslationNeeds) {
    report += "⚠️  Needs translation attention\n";
    report += "Reasons:\n";
    analysis.reasons.forEach((reason) => {
      report += `  - ${reason}\n`;
    });

    report += "\nHard-coded strings found:\n";
    analysis.hardCodedStrings.forEach(({ type, text }) => {
      report += `  - [${type}] "${text}"\n`;
    });
  } else {
    report += "✅ No immediate translation needs detected\n";
  }

  return report;
}

function scanDirectory(dir, fileExtensions = [".js", ".jsx", ".ts", ".tsx"]) {
  let reports = [];

  function scan(currentDir) {
    const files = fs.readdirSync(currentDir);

    files.forEach((file) => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and other common exclude directories
        if (!file.startsWith(".") && file !== "node_modules") {
          scan(filePath);
        }
      } else if (fileExtensions.includes(path.extname(file))) {
        const content = fs.readFileSync(filePath, "utf-8");
        const analysis = analyzeFileForI18n(content);
        if (analysis.potentialTranslationNeeds) {
          reports.push(generateReport(filePath, analysis));
        }
      }
    });
  }

  scan(dir);
  return reports;
}

// Example usage:
// const reports = scanDirectory('./src');
// reports.forEach(report => console.log(report));

export { analyzeFileForI18n, scanDirectory };

import { scanDirectory } from './i18n-analyzer';

// Scan your source directory
const reports = scanDirectory('./app');

// View the results
reports.forEach(report => console.log(report));
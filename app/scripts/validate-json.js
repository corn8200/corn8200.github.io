import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Load JSON schema in a Node-compatible way across Node versions
const schemaPath = path.join(__dirname, '../schemas/resume.json');
const resumeSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validate = ajv.compile(resumeSchema);

async function validateJsonFiles() {
  let hasErrors = false;

  // Validate index.json
  const indexPath = path.join(__dirname, '../../data/index.json');
  try {
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    // For index.json, we only validate the 'variants' array against a subset of the resume schema
    // or a separate schema if needed. For simplicity, we'll just check if it's valid JSON.
    // A more robust solution would have a separate schema for index.json.
    console.log(`Validating ${indexPath}...`);
    if (typeof indexData !== 'object' || indexData === null) {
      console.error(`Error: ${indexPath} is not a valid JSON object.`);
      hasErrors = true;
    } else {
      console.log(`  ${indexPath} is valid JSON.`);
    }
  } catch (error) {
    console.error(`Error reading or parsing ${indexPath}:`, error.message);
    hasErrors = true;
  }

  // Validate resume JSON files
  const resumesDir = path.join(__dirname, '../../data/resumes');
  const resumeFiles = fs.readdirSync(resumesDir).filter(file => file.endsWith('.json'));

  for (const file of resumeFiles) {
    const filePath = path.join(resumesDir, file);
    try {
      const resumeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`Validating ${filePath}...`);
      const valid = validate(resumeData);
      if (!valid) {
        console.error(`Validation errors in ${filePath}:`);
        validate.errors.forEach(err => console.error(err));
        hasErrors = true;
      } else {
        console.log(`  ${filePath} is valid.`);
      }
    } catch (error) {
      console.error(`Error reading or parsing ${filePath}:`, error.message);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.warn('\nJSON validation encountered errors.');
  } else {
    console.log('\nAll JSON files are valid.');
  }
}

validateJsonFiles();

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Error mapping from old createError patterns to new predefined errors
const errorMappings = [
  // Authentication errors
  {
    old: /statusCode:\s*401,\s*statusMessage:\s*['"](Authorization token required|Authentication required)['"]/g,
    new: "throw createPredefinedError('UNAUTHORIZED', {\n        messages: getMultiLangMessage('UNAUTHORIZED')\n      })",
    replace: /throw createError\(\{\s*statusCode:\s*401,\s*statusMessage:\s*['"](Authorization token required|Authentication required)['"]\s*\}\)/g
  },
  
  // User not found errors
  {
    old: /statusCode:\s*404,\s*statusMessage:\s*['"](User not found)['"]/g,
    new: "throw createPredefinedError('USER_NOT_FOUND', {\n        messages: getMultiLangMessage('USER_NOT_FOUND')\n      })",
    replace: /throw createError\(\{\s*statusCode:\s*404,\s*statusMessage:\s*['"](User not found)['"]\s*\}\)/g
  },
  
  // Permission/Access errors
  {
    old: /statusCode:\s*403,\s*statusMessage:\s*['"](Insufficient permissions?|Access denied)['"]/g,
    new: "throw createPredefinedError('FORBIDDEN', {\n        messages: getMultiLangMessage('FORBIDDEN')\n      })",
    replace: /throw createError\(\{\s*statusCode:\s*403,\s*statusMessage:\s*['"](Insufficient permissions?|Access denied)['"]\s*\}\)/g
  },
  
  // Bad Request errors
  {
    old: /statusCode:\s*400,\s*statusMessage:\s*['"](.*required.*|Invalid.*)['"]/g,
    new: "throw createPredefinedError('INVALID_INPUT', {\n        messages: getMultiLangMessage('INVALID_INPUT')\n      })",
    replace: /throw createError\(\{\s*statusCode:\s*400,\s*statusMessage:\s*['"](.*required.*|Invalid.*)['"]\s*\}\)/g
  },
  
  // Internal Server Error
  {
    old: /statusCode:\s*500,\s*statusMessage:\s*['"](Internal server error)['"]/g,
    new: "throw createPredefinedError('INTERNAL_ERROR', {\n        messages: getMultiLangMessage('INTERNAL_ERROR')\n      })",
    replace: /throw createError\(\{\s*statusCode:\s*500,\s*statusMessage:\s*['"](Internal server error)['"]\s*\}\)/g
  }
];

// Find all API files
const apiFiles = glob.sync('server/api/**/*.ts');

console.log(`Found ${apiFiles.length} API files to update...`);

let updatedFiles = 0;

apiFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    let needsImport = false;
    
    // Check if file needs updates
    const hasCreateError = /throw createError\(\{/.test(content);
    if (!hasCreateError) return;
    
    console.log(`\nUpdating ${filePath}...`);
    
    // Apply error mappings
    errorMappings.forEach(mapping => {
      if (mapping.replace.test(content)) {
        content = content.replace(mapping.replace, mapping.new);
        needsImport = true;
      }
    });
    
    // Add import if needed and not already present
    if (needsImport && !content.includes('createPredefinedError')) {
      // Check for existing responseHandler import
      const importMatch = content.match(/import\s+{[^}]*}\s+from\s+['"]~\/server\/utils\/responseHandler['"]/);
      if (importMatch) {
        // Add to existing import
        const existingImport = importMatch[0];
        const imports = existingImport.match(/{\s*([^}]*)\s*}/)[1];
        const importList = imports.split(',').map(i => i.trim()).filter(i => i);
        
        if (!importList.includes('createPredefinedError')) {
          importList.push('createPredefinedError');
        }
        if (!importList.includes('getMultiLangMessage')) {
          importList.push('getMultiLangMessage');
        }
        
        const newImport = `import { ${importList.join(', ')} } from '~/server/utils/responseHandler'`;
        content = content.replace(importMatch[0], newImport);
      } else {
        // Add new import after existing imports
        const lastImportMatch = content.match(/import[^;]+;(?=\s*\n)/g);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const newImport = `\nimport { createPredefinedError, getMultiLangMessage } from '~/server/utils/responseHandler'`;
          content = content.replace(lastImport, lastImport + newImport);
        }
      }
    }
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      updatedFiles++;
      console.log(`✓ Updated ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
});

console.log(`\n✨ Updated ${updatedFiles} files successfully!`);
#!/usr/bin/env node

/**
 * SSR Safety Checker
 * 
 * This script scans the codebase for potential SSR issues by looking for
 * direct browser API usage that should be wrapped in safety checks.
 */

const fs = require('fs');
const path = require('path');

// Patterns that indicate potential SSR issues
const UNSAFE_PATTERNS = [
    {
        pattern: /(?<!typeof\s+window\s+!==\s+['"]undefined['"]\s+\?\s+)(?<!safeWindow\(\)\s*\?\s*)window\./g,
        message: 'Direct window access - use safeWindow() or typeof window !== "undefined" check',
        severity: 'error',
        exclude: /typeof\s+window\s+!==\s+['"]undefined['"]/
    },
    {
        pattern: /(?<!typeof\s+)(?<!safeLocalStorage\(\)\s*\?\s*)localStorage\./g,
        message: 'Direct localStorage access - use safeLocalStorage() or useLocalStorage hook',
        severity: 'error',
        exclude: /typeof\s+window\s+!==\s+['"]undefined['"]/
    },
    {
        pattern: /(?<!typeof\s+)(?<!safeSessionStorage\(\)\s*\?\s*)sessionStorage\./g,
        message: 'Direct sessionStorage access - use safeSessionStorage()',
        severity: 'error'
    },
    {
        pattern: /(?<!typeof\s+navigator\s+!==\s+['"]undefined['"]\s+\?\s+)(?<!safeNavigator\(\)\s*\?\s*)navigator\./g,
        message: 'Direct navigator access - use safeNavigator()',
        severity: 'error',
        exclude: /typeof\s+navigator\s+!==\s+['"]undefined['"]/
    },
    {
        pattern: /(?<!typeof\s+document\s+!==\s+['"]undefined['"]\s+\?\s+)(?<!safeDocument\(\)\s*\?\s*)document\./g,
        message: 'Direct document access - use safeDocument() or typeof document !== "undefined" check',
        severity: 'warning',
        exclude: /typeof\s+document\s+!==\s+['"]undefined['"]/
    }
];

// Files and directories to scan
const SCAN_PATHS = [
    'src/app',
    'src/components',
    'src/hooks',
    'src/lib',
    'src/utils'
];

// Files to exclude from scanning
const EXCLUDE_PATTERNS = [
    /node_modules/,
    /\.next/,
    /\.git/,
    /ssr-safe\.ts$/,
    /useBrowserSafe\.ts$/,
    /check-ssr-safety\.js$/
];

function shouldExcludeFile(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => pattern.test(filePath));
}

function scanFile(filePath) {
    if (shouldExcludeFile(filePath)) {
        return [];
    }

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const issues = [];

        lines.forEach((line, lineNumber) => {
            UNSAFE_PATTERNS.forEach(({ pattern, message, severity, exclude }) => {
                // Skip if line matches exclude pattern
                if (exclude && exclude.test(line)) {
                    return;
                }

                const matches = line.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        issues.push({
                            file: filePath,
                            line: lineNumber + 1,
                            column: line.indexOf(match) + 1,
                            match,
                            message,
                            severity,
                            lineContent: line.trim()
                        });
                    });
                }
            });
        });

        return issues;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return [];
    }
}

function scanDirectory(dirPath) {
    let allIssues = [];

    try {
        const items = fs.readdirSync(dirPath);

        items.forEach(item => {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);

            if (stat.isDirectory()) {
                allIssues = allIssues.concat(scanDirectory(itemPath));
            } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
                allIssues = allIssues.concat(scanFile(itemPath));
            }
        });
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
    }

    return allIssues;
}

function formatIssues(issues) {
    if (issues.length === 0) {
        console.log('✅ No SSR safety issues found!');
        return;
    }

    console.log(`\n🔍 Found ${issues.length} potential SSR issue(s):\n`);

    const groupedIssues = issues.reduce((groups, issue) => {
        if (!groups[issue.file]) {
            groups[issue.file] = [];
        }
        groups[issue.file].push(issue);
        return groups;
    }, {});

    Object.entries(groupedIssues).forEach(([file, fileIssues]) => {
        console.log(`📁 ${file}`);
        
        fileIssues.forEach(issue => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️';
            console.log(`  ${icon} Line ${issue.line}:${issue.column} - ${issue.message}`);
            console.log(`     Found: "${issue.match}"`);
            console.log(`     Code: ${issue.lineContent}`);
            console.log('');
        });
    });

    // Summary
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   ⚠️  Warnings: ${warnings}`);
    console.log(`   📁 Files affected: ${Object.keys(groupedIssues).length}`);

    if (errors > 0) {
        console.log('\n💡 Recommendations:');
        console.log('   - Use safeWindow(), safeLocalStorage(), etc. from src/utils/ssr-safe.ts');
        console.log('   - Use useBrowserSafe(), useLocalStorage(), etc. hooks from src/hooks/useBrowserSafe.ts');
        console.log('   - Wrap browser API access in typeof checks');
        console.log('   - Execute browser-specific code in useEffect');
    }
}

function main() {
    console.log('🔍 Scanning for SSR safety issues...\n');

    let allIssues = [];

    SCAN_PATHS.forEach(scanPath => {
        if (fs.existsSync(scanPath)) {
            console.log(`Scanning ${scanPath}...`);
            allIssues = allIssues.concat(scanDirectory(scanPath));
        } else {
            console.log(`⚠️  Path ${scanPath} does not exist, skipping...`);
        }
    });

    formatIssues(allIssues);

    // Exit with error code if there are errors
    const errors = allIssues.filter(i => i.severity === 'error').length;
    process.exit(errors > 0 ? 1 : 0);
}

if (require.main === module) {
    main();
}

module.exports = { scanFile, scanDirectory, UNSAFE_PATTERNS };

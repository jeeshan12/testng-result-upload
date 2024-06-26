import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { TestDetails } from '../types/report';
import { generateTestDetailsTable } from './summary';


async function run(): Promise<void> {

    try {
        const xmlFilePath: string = core.getInput('xml-file');
        const xmlData: string = readFileSync(xmlFilePath, 'utf8');

        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        const testResults = jsonObj['testng-results'];
        const total = testResults.total;
        const passed = testResults.passed;
        const failed = testResults.failed;
        const skipped = testResults.skipped;

        const conclusion = failed == 0 ? 'Success' : 'Failure';

        const suite = testResults.suite;
        const suiteName = suite.name;

        core.info(`Test suite name : ${suiteName}`)
        core.info(`Total tests: ${total}`);
        core.info(`Passed tests: ${passed}`);
        core.info(`Failed tests: ${failed}`);
        core.info(`Skipped tests: ${skipped}`);
        core.info(`Conclusion  of run : ${conclusion}`);

        const test = suite.test;
        const testCases: TestDetails[] = [];

        for (const testClass of Array.isArray(test.class) ? test.class : [test.class]) {
            for (const method of Array.isArray(testClass['test-method']) ? testClass['test-method'] : [testClass['test-method']]) {
                const methodName = method.name;
                const status = method.status;
                const duration = method["duration-ms"];
                testCases.push({ name: methodName, status: status, duration });
            }
        }

        generateTestDetailsTable(testCases);

    } catch (error) {
        console.error('Failed to read or process the file:', error);
        core.setFailed(`Error processing the file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

run();

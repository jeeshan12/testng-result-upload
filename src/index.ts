import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';


async function run(): Promise<void> {


    try {
        const githubToken = core.getInput('github_token');
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
        const testCases = [];

        for (const testClass of Array.isArray(test.class) ? test.class : [test.class]) {
            for (const method of Array.isArray(testClass['test-method']) ? testClass['test-method'] : [testClass['test-method']]) {
                const methodName = method.name;
                const status = method.status;
                testCases.push({ name: methodName, status });
            }
        }

        testCases.forEach(testCase => {
            core.info(`Test Name: ${testCase.name}, Status: ${testCase.status}`);
        });
        const pullRequest = github.context.payload.pull_request;
        const head_sha = (pullRequest && pullRequest.head.sha) || github.context.sha;
        core.info(`Posting status for suite '${suiteName}' with conclusion '${conclusion}' to (sha: ${head_sha})`);


    } catch (error) {
        core.setFailed(error?.message);
    }
}

run();

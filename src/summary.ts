import * as core from '@actions/core';
import { TestDetails } from '../types/report';

export function generateTestDetailsTable(tests: TestDetails[]) {

    try {
        core.summary.addHeading('Detailed Test Execution Results', 3);
        const headers = [
            { data: 'Name', header: true },
            { data: 'Status', header: true },
            { data: 'Test Execution time(ms)', header: true },
        ];

        const tableRows = tests.map(test =>
            [
                {
                    data: test.name, header: false
                },
                {
                    data: `${test.status}${getEmojiForStatus(test.status)}`, headers: false
                },
                {
                    data: String(test.duration), headers: false
                }
            ]
        );

        core.summary.addTable([headers, ...tableRows]);
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(`Failed to append to detailed test execution summary: ${error.message}`);
        } else {
            core.setFailed("An unknown error occurred");
        }
    }
}

function getEmojiForStatus(status: string): string {
    switch (status) {
        case 'PASS':
            return '✅';
        case 'FAIL':
            return '❌';
        case 'SKIP':
            return '⏭️';
        default:
            return '❓';
    }
}
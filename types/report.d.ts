export interface Summary {
    tests: number,
    passed: number,
    failed: number,
    skipped: number,
}




export interface TestDetails {
    name: string,
    duration: number,
    status: string
}

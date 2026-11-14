// Earlier prototype contracts are retained for reference, not treated as current UI coverage.
import {defineConfig} from '@playwright/test'
import base from './playwright.config'
export default defineConfig({...base,testMatch:'**/*.spec.ts',testIgnore:['**/current/**','**/production.spec.ts']})

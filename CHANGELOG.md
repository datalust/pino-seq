# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- **BREAKING**: Converted entire codebase from JavaScript to TypeScript
- Project now uses `tsup` for building with automatic type generation
- Type definitions are now automatically generated from TypeScript source
- Removed manually maintained `index.d.ts` file
- Package now exports proper ES modules with correct type definitions

### Added
- Docker Compose configuration for local Seq testing
- Comprehensive integration tests
- TypeScript source files in `src/` directory
- Build script that generates `dist/` output
- Proper ES module exports with TypeScript support
- `PinoSeqStreamConfig` interface now properly extends `Partial<SeqLoggerConfig>`

### Fixed
- Fixed #45: No default export error - now properly exports both default and named exports
- Fixed #48: Type definitions now automatically generated from TypeScript source

### Development
- Added `@types/node` for Node.js type definitions
- Added `tsup` for building TypeScript
- Added `pino` as dev dependency for testing
- New npm scripts: `build`, `dev` (watch mode)
- All examples and tests updated to use built output from `dist/`

## Notes

This package is ESM-only, matching its dependency `seq-logging`. For CommonJS support, use version 2.x or earlier.
